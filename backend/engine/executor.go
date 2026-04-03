package engine

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/pgvector/pgvector-go"
)

type executeResult struct {
	// content is the raw data returned by the action — context for the LLM,
	// or the final message for static_reply, collect_input, end_conversation.
	content string

	// skipLLM indicates the content should be returned directly to the user
	// without a further LLM call.
	skipLLM bool

	// endSession indicates the session should be deleted after this turn.
	endSession bool
}

// execute runs the action defined on the given node and returns the result.
// The session's Variables map is updated in-place for collect_input actions.
func (e *Engine) execute(ctx context.Context, node *WorkflowNode, input string, variables map[string]string) (executeResult, error) {
	switch node.Action.Type {

	case ActionTypeStaticReply:
		return executeResult{
			content: node.Action.Message,
			skipLLM: true,
		}, nil

	case ActionTypeEndConversation:
		return executeResult{
			content:    node.Action.Message,
			skipLLM:    true,
			endSession: true,
		}, nil

	case ActionTypeCollectInput:
		// Variable storage is handled in engine.Run before this is called,
		// because only Run knows whether we are asking the question for the
		// first time or collecting the user's response to it.
		return executeResult{
			content: node.Action.Prompt,
			skipLLM: true,
		}, nil

	case ActionTypeKnowledgeBase:
		vector, err := e.embedding.Embed(ctx, input)
		if err != nil {
			return executeResult{}, fmt.Errorf("executor: embedding failed: %w", err)
		}

		chunks, err := e.kbRepo.FindSimilarChunks(node.Action.KBID, pgvector.NewVector(vector), 5)
		if err != nil {
			return executeResult{}, fmt.Errorf("executor: KB search failed: %w", err)
		}

		var texts []string
		for _, chunk := range chunks {
			texts = append(texts, chunk.Content)
		}
		return executeResult{content: strings.Join(texts, "\n\n")}, nil

	case ActionTypeAPICall:
		endpoint := InterpolateTemplate(node.Action.Endpoint, variables)
		result, err := callAPI(ctx, node.Action.Method, endpoint)
		if err != nil {
			return executeResult{}, fmt.Errorf("executor: api_call failed: %w", err)
		}
		return executeResult{content: result}, nil

	case ActionTypeLLMGenerate:
		return executeResult{content: ""}, nil

	default:
		return executeResult{}, fmt.Errorf("executor: unknown action type %q", node.Action.Type)
	}
}

// callAPI makes an HTTP request to the given endpoint and returns the response body.
func callAPI(ctx context.Context, method, endpoint string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, method, endpoint, nil)
	if err != nil {
		return "", fmt.Errorf("failed to build request: %w", err)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode >= 400 {
		return "", fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(body))
	}

	// Pretty-print JSON responses so the LLM can read them more easily
	var prettyJSON map[string]any
	if json.Unmarshal(body, &prettyJSON) == nil {
		if pretty, err := json.MarshalIndent(prettyJSON, "", "  "); err == nil {
			return string(pretty), nil
		}
	}

	return string(body), nil
}
