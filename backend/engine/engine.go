package engine

import (
	"build-a-bot/embedding"
	"build-a-bot/llm"
	"build-a-bot/models"
	"build-a-bot/repository"
	"context"
	"encoding/json"
	"fmt"
	"time"
)

const (
	sessionTTL = 30 * time.Minute
	topKChunks = 5
)

// Engine orchestrates the full chatbot pipeline:
// session loading → intent detection → action execution → reply generation.
type Engine struct {
	llm         llm.Client
	embedding   embedding.Client
	kbRepo      repository.KnowledgeBaseRepository
	sessionRepo repository.SessionRepository
}

func NewEngine(
	llm llm.Client,
	embedding embedding.Client,
	kbRepo repository.KnowledgeBaseRepository,
	sessionRepo repository.SessionRepository,
) *Engine {
	return &Engine{
		llm:         llm,
		embedding:   embedding,
		kbRepo:      kbRepo,
		sessionRepo: sessionRepo,
	}
}

// Run processes a single user message through the full pipeline and returns
// the chatbot's reply.
func (e *Engine) Run(ctx context.Context, input string, chatbot *models.ChatBot, userIdentifier string) (string, error) {
	if chatbot.Workflow == nil {
		return "", fmt.Errorf("engine: chatbot has no workflow configured")
	}

	workflow, err := ParseWorkflow(*chatbot.Workflow)
	if err != nil {
		return "", fmt.Errorf("engine: %w", err)
	}

	// Load existing session for this user+chatbot (nil if none / expired)
	session, err := e.sessionRepo.FindActive(chatbot.ID, userIdentifier)
	if err != nil {
		return "", fmt.Errorf("engine: failed to load session: %w", err)
	}

	// Unmarshal session state
	variables := map[string]string{}
	history := []llm.Message{}
	if session != nil {
		if err := unmarshalJSON(session.Variables, &variables); err != nil {
			return "", fmt.Errorf("engine: corrupt session variables: %w", err)
		}
		if err := unmarshalJSON(session.History, &history); err != nil {
			return "", fmt.Errorf("engine: corrupt session history: %w", err)
		}
	}

	// --- Find the node to execute ---
	var node *WorkflowNode
	isSessionContinuation := session != nil && session.CurrentNodeID != nil

	if isSessionContinuation {
		node = workflow.FindByID(*session.CurrentNodeID)
		if node == nil {
			return "", fmt.Errorf("engine: session references unknown node %q", *session.CurrentNodeID)
		}

		// If this node was waiting for user input, store it now and advance to next node
		if node.Action.Type == ActionTypeCollectInput {
			variables[node.Action.Variable] = input
			if node.NextNodeID != "" {
				next := workflow.FindByID(node.NextNodeID)
				if next == nil {
					return "", fmt.Errorf("engine: next_node %q not found", node.NextNodeID)
				}
				node = next
			}
		}
	} else {
		// No active session — detect intent and find entry node
		intents := workflow.Intents()
		intent, err := DetectIntent(ctx, e.llm, input, intents)
		if err != nil {
			return "", fmt.Errorf("engine: intent detection failed: %w", err)
		}

		node = workflow.FindByIntent(intent)
		if node == nil {
			node = workflow.FindByIntent("fallback")
		}
		if node == nil {
			return "", fmt.Errorf("engine: no matching node and no fallback defined")
		}
	}

	// --- Execute the node's action ---
	result, err := e.execute(ctx, node, input, variables)
	if err != nil {
		return "", fmt.Errorf("engine: execution failed: %w", err)
	}

	// --- Generate reply ---
	var reply string
	if result.skipLLM {
		reply = result.content
	} else {
		template := InterpolateTemplate(node.ReplyTemplate, variables)
		reply, err = e.generateReply(ctx, input, result.content, template, history)
		if err != nil {
			return "", fmt.Errorf("engine: reply generation failed: %w", err)
		}
	}

	// --- Update conversation history ---
	history = append(history,
		llm.Message{Role: llm.RoleUser, Content: input},
		llm.Message{Role: llm.RoleAssistant, Content: reply},
	)

	// --- Update session state ---
	if err := e.updateSession(ctx, session, chatbot.ID, userIdentifier, node, variables, history, result.endSession); err != nil {
		return "", fmt.Errorf("engine: failed to update session: %w", err)
	}

	return reply, nil
}

// updateSession saves, advances, or deletes the session based on the node's outcome.
func (e *Engine) updateSession(
	ctx context.Context,
	session *models.Session,
	chatBotID uint,
	userIdentifier string,
	node *WorkflowNode,
	variables map[string]string,
	history []llm.Message,
	endSession bool,
) error {
	// End conversation explicitly or flow is complete (no next node)
	flowComplete := endSession || (node.NextNodeID == "" && node.Action.Type != ActionTypeCollectInput)
	if flowComplete {
		if session != nil {
			return e.sessionRepo.Delete(session.ID)
		}
		return nil
	}

	// Determine next node ID — for collect_input, stay on this node waiting for response
	nextNodeID := node.NextNodeID
	if node.Action.Type == ActionTypeCollectInput {
		nextNodeID = node.ID
	}

	variablesJSON, err := marshalJSON(variables)
	if err != nil {
		return err
	}
	historyJSON, err := marshalJSON(history)
	if err != nil {
		return err
	}

	if session == nil {
		session = &models.Session{
			ChatBotID:      chatBotID,
			UserIdentifier: userIdentifier,
			CurrentNodeID:  &nextNodeID,
			Variables:      variablesJSON,
			History:        historyJSON,
			ExpiresAt:      time.Now().Add(sessionTTL),
		}
		_, err = e.sessionRepo.Create(session)
		return err
	}

	session.CurrentNodeID = &nextNodeID
	session.Variables = variablesJSON
	session.History = historyJSON
	session.ExpiresAt = time.Now().Add(sessionTTL) // rolling TTL
	_, err = e.sessionRepo.Update(session)
	return err
}

func marshalJSON(v any) (*string, error) {
	b, err := json.Marshal(v)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal JSON: %w", err)
	}
	s := string(b)
	return &s, nil
}

func unmarshalJSON(s *string, v any) error {
	if s == nil || *s == "" {
		return nil
	}
	return json.Unmarshal([]byte(*s), v)
}
