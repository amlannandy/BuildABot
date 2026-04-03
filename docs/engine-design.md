# Execution Engine Design

## Overview

The execution engine powers chatbots at runtime. When an end user sends a message to a chatbot, the engine processes it through a session-aware, intent-detection + workflow-execution pipeline and returns a reply. It supports both single-turn (stateless) and multi-turn (branching) conversations.

---

## Runtime Flow

```
Incoming message (input, chatbot, user_identifier)
    │
    ▼
Load session for this user+chatbot from DB (if any)
    │
    ├── Session exists + current_node set?
    │       │
    │       ▼
    │   Skip intent detection
    │   Go directly to current_node
    │   Store input as variable if node expects one
    │
    └── No active session?
            │
            ▼
        Detect intent via LLM
        (prompt includes all node intents defined in workflow)
        Match to starting node
        Create new session
    │
    ▼
Execute node action:
    ├── static_reply    →  return fixed message, no LLM
    ├── collect_input   →  reply with prompt, save variable, advance to next_node
    ├── knowledge_base  →  embed input → vector search → top N chunks → feed to LLM
    ├── api_call        →  HTTP call with variables interpolated → feed result to LLM
    └── llm_generate    →  open-ended LLM reply, conversation history as context
    │
    ▼
Has next_node?
    ├── Yes → update session.current_node, save session
    └── No  → clear/expire session
    │
    ▼
Generate reply (LLM call, skipped for static_reply and collect_input)
    │
    ▼
Response to user
```

---

## Workflow JSON Structure (stored in `chatbots.workflow` JSONB column)

### Single-turn example (stateless node)
```json
{
  "nodes": [
    {
      "id": "check_order",
      "intent": "check_order_status",
      "action": {
        "type": "api_call",
        "endpoint": "https://orders.example.com/status",
        "method": "GET"
      },
      "reply_template": "Your order is currently: {{status}}"
    },
    {
      "id": "return_policy",
      "intent": "return_policy_question",
      "action": {
        "type": "knowledge_base",
        "kb_id": 42
      }
    },
    {
      "id": "greeting",
      "intent": "greeting",
      "action": {
        "type": "static_reply",
        "message": "Hello! How can I help you today?"
      }
    },
    {
      "id": "fallback",
      "intent": "fallback",
      "action": {
        "type": "llm_generate"
      }
    }
  ]
}
```

### Multi-turn example (branching flow)
```json
{
  "nodes": [
    {
      "id": "collect_order_number",
      "intent": "initiate_return",
      "action": {
        "type": "collect_input",
        "variable": "order_number",
        "prompt": "Sure, I can help with that. What's your order number?"
      },
      "next_node": "collect_reason"
    },
    {
      "id": "collect_reason",
      "action": {
        "type": "collect_input",
        "variable": "return_reason",
        "prompt": "Got it. What's the reason for the return?"
      },
      "next_node": "process_return"
    },
    {
      "id": "process_return",
      "action": {
        "type": "api_call",
        "endpoint": "https://orders.example.com/return",
        "method": "POST"
      },
      "reply_template": "Return initiated for order {{order_number}}. Reason: {{return_reason}}"
    }
  ]
}
```

### Action Types

| Type                 | Description                                                        | Advances flow? | Final LLM call? |
|----------------------|--------------------------------------------------------------------|----------------|-----------------|
| `static_reply`       | Returns a fixed message                                            | No             | No              |
| `collect_input`      | Replies with a prompt, stores user's next message as a variable    | Yes            | No              |
| `knowledge_base`     | Vector search on KB chunks, top N results fed as LLM context      | No             | Yes             |
| `api_call`           | HTTP call with variables interpolated, result fed to LLM           | No             | Yes             |
| `llm_generate`       | Pure LLM generation with conversation history as context           | No             | Yes             |
| `end_conversation`   | Returns a closing message and deletes the session                  | No             | No              |

---

## Sessions

Sessions track where a user is within a multi-turn flow and what variables have been collected so far.

### Session record (stored in `sessions` table as JSONB)

```json
{
  "id": "sess_abc123",
  "chatbot_id": 7,
  "user_identifier": "user@example.com",
  "current_node_id": "collect_reason",
  "variables": {
    "order_number": "12345"
  },
  "history": [
    { "role": "user",      "content": "I want to return something" },
    { "role": "assistant", "content": "Sure, what's your order number?" },
    { "role": "user",      "content": "12345" }
  ],
  "expires_at": "2026-04-02T15:00:00Z"
}
```

### Session lifecycle
- **Created** when a user starts a new flow (first message, no active session)
- **Updated** after each turn — `current_node_id`, `variables`, and `history` are updated
- **Cleared** when a node has no `next_node` (flow complete)
- **Expired** by TTL — sessions older than a configurable duration are ignored

### Intent detection with sessions
- **No active session** → run intent detection → match a node by `intent` field
- **Active session** → skip intent detection → go directly to `current_node_id`
- History is always passed to the LLM for `llm_generate` actions so it has conversational context

---

## Knowledge Bases

### Supported file types
- `.txt` — stored directly in S3
- `.pdf` — parsed to text, stored in S3
- Plain text input — saved as `.txt` and stored in S3

### Why vector search (RAG)
Even a single file can be very large (e.g. a 50-page PDF). Dumping an entire file into the LLM prompt is unreliable and will hit context window limits. Instead we use **Retrieval Augmented Generation (RAG)**:
- Split the document into smaller chunks at upload time
- Embed each chunk as a vector (a list of numbers capturing its meaning)
- At query time, embed the user's input and find the most semantically similar chunks
- Pass only those chunks as context to the LLM

### Upload-time pipeline (one-time per file)

```
File uploaded
    │
    ▼
Extract text (parse PDF or read txt)
    │
    ▼
Split into chunks (~500 words each)
    │
    ▼
Embed each chunk via OpenAI text-embedding-3-small
    │
    ▼
Store chunk text + vector in DB (pgvector)
    │
    ▼
Store original file in S3
```

### Query-time retrieval

```
User input
    │
    ▼
Embed input via OpenAI text-embedding-3-small
    │
    ▼
pgvector similarity search across this KB's chunks
    │
    ▼
Retrieve top N most relevant chunks
    │
    ▼
Pass chunks as context to LLM for reply generation
```

### Why pgvector over a dedicated vector DB
Already on Postgres — pgvector is just an extension. No new infrastructure or service to manage.

---

## External Services

| Service | Purpose |
|---------|---------|
| Claude (Anthropic) | Intent detection + reply generation |
| OpenAI `text-embedding-3-small` | Generating embeddings for KB chunks and user input |
| S3 | Storing original uploaded files (txt, pdf) |
| pgvector (Postgres extension) | Storing and searching chunk embeddings |

> Claude is used for all text generation. OpenAI is used **only** for embeddings — Anthropic does not currently offer an embedding model.

---

## Data Model

- `knowledge_bases` — file metadata + S3 reference, belongs to a chatbot
- `knowledge_chunks` — individual text chunks + their embedding vectors, belongs to a knowledge base
- `sessions` — active conversation state: current node, collected variables, history, TTL

---

## Package Structure

```
backend/
├── engine/
│   ├── engine.go       # Engine struct; Run(input, chatbot, userID) → reply
│   ├── intent.go       # DetectIntent — LLM call with all chatbot intents as labels
│   ├── workflow.go     # WorkflowNode/Action types, ParseWorkflow, variable interpolation
│   ├── executor.go     # Dispatch to correct action handler per action type
│   └── responder.go    # Final LLM reply generation with context + history + template
│
├── llm/
│   ├── client.go       # LLM interface: Chat(ctx, []Message) → (string, error)
│   └── anthropic.go    # Claude implementation
│
├── embedding/
│   ├── client.go       # Embedding interface: Embed(text) → ([]float32, error)
│   └── openai.go       # OpenAI text-embedding-3-small implementation
│
├── storage/
│   ├── storage.go      # File I/O interface: Upload, Download, Delete
│   └── s3.go           # AWS S3 implementation
│
├── models/
│   ├── knowledge_base.go    # KnowledgeBase model
│   ├── knowledge_chunk.go   # Text chunk + embedding vector
│   └── session.go           # Session model — current node, variables, history, TTL
│
├── repository/
│   ├── knowledge_base.go    # CRUD for KBs, chunks, vector similarity search
│   └── session.go           # Create, load, update, delete sessions
│
└── cmd/
    └── engine-chat/
        └── main.go     # CLI REPL for end-to-end testing
```

---

## Testing Strategy

### Unit tests (no real API calls)
Each engine component is tested in isolation using mocked `llm.Client` and `embedding.Client` interfaces. Tests cover intent detection logic, workflow node matching, session state transitions, variable interpolation, and reply generation without hitting any external service.

### CLI tool for end-to-end testing (`cmd/engine-chat`)
A minimal interactive command-line tool that wires up the real engine with actual API keys. Supports multi-turn conversations to test branching flows.

```bash
go run ./cmd/engine-chat --chatbot-id=1 --user=test@example.com
> I want to return something
Engine: Sure, I can help with that. What's your order number?
> 12345
Engine: Got it. What's the reason for the return?
> It arrived broken
Engine: Return initiated for order 12345. Reason: It arrived broken
```

### HTTP handler last
The engine is fully tested and working before the HTTP handler is added. The handler is just a thin wrapper — it parses the request and calls `engine.Run()`.

---

## Key Design Decisions

- **Session-aware from the start** — the engine checks for an active session before doing anything. This supports both stateless single-turn nodes and multi-turn branching flows with the same pipeline.
- **Intent detection only on first turn** — mid-flow messages skip intent detection entirely; the session's `current_node_id` drives routing instead.
- **Variables interpolated at execution time** — `{{order_number}}` in templates and API call bodies are replaced with values from `session.variables` just before use.
- **Conversation history passed to LLM** — for `llm_generate` actions, full history from the session is passed as context so the LLM can give coherent multi-turn replies.
- **Workflow nodes define the intents** — the LLM for intent detection is seeded with whatever intents the user has configured. No hardcoded intents.
- **Strict JSON output for intent detection** — LLM must return a structured response to avoid mismatched or hallucinated intent names.
- **Fallback node is the catch-all** — always an `llm_generate` action for generic replies when no intent matches.
- **Knowledge bases are dynamic** — owned per chatbot, uploaded by users, chunked and embedded at upload time, searched at query time.
- **pgvector for vector storage** — avoids introducing a separate vector database; Postgres already in use.
- **OpenAI for embeddings, Claude for generation** — Anthropic has no embedding model. OpenAI's `text-embedding-3-small` is cheap and well-supported.
- **LLM and embedding clients are abstracted** — both behind interfaces so implementations can be swapped without touching engine logic.
- **Sessions have TTL** — inactive sessions expire automatically so users aren't stuck mid-flow if they abandon a conversation.
