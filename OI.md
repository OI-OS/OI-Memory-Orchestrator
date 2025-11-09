# OI-Memory-Orchestrator MCP Server - OI OS Installation Guide

This guide provides comprehensive installation instructions for AI agents installing the OI-Memory-Orchestrator MCP server in OI OS (Brain Trust 4) environments.

## Table of Contents

1. [AI Agent Quick Installation](#ai-agent-quick-installation)
2. [Prerequisites](#prerequisites)
3. [Full Installation Steps](#full-installation-steps)
4. [Connecting to OI OS](#connecting-to-oi-os)
5. [Creating Intent Mappings](#creating-intent-mappings)
6. [Creating Parameter Rules](#creating-parameter-rules)
7. [Parameter Extractors](#parameter-extractors)
8. [Verification & Testing](#verification--testing)
9. [Troubleshooting](#troubleshooting)
10. [Tool Reference](#tool-reference)

---

## AI Agent Quick Installation

**⚠️ For AI Agents: Use Direct Calls for Reliability**

AI agents should prefer **direct `brain-trust4 call` commands** over natural language queries for maximum reliability. Natural language commands can timeout or have parameter extraction issues. Direct calls bypass intent mapping and parameter extraction, providing consistent results.

**Example:**
```bash
# ✅ RECOMMENDED for AI agents: Direct call
./brain-trust4 call OI-Memory-Orchestrator create_conversation_session '{"agent_id": "ai-agent-1", "title": "Project Planning"}'

# ⚠️ FALLBACK: Natural language (may timeout or fail parameter extraction)
./oi "memory create conversation session for project planning"
```

For AI agents using OI OS, execute the following commands:

```bash
# 1. Install the server
./oi install https://github.com/OI-OS/OI-Memory-Orchestrator.git

# 2. Build the project
cd MCP-servers/OI-Memory-Orchestrator
npm install
npm run build

# 3. Connect the server to OI OS
cd ../../
./brain-trust4 connect OI-Memory-Orchestrator node -- "$(pwd)/MCP-servers/OI-Memory-Orchestrator/build/index.js"

# 4. Create intent mappings and parameter rules (see sections below)
```

---

## Prerequisites

| Requirement | Version        |
| ----------- | -------------- |
| **Node.js** | 18.x or higher |
| **npm**     | Latest         |
| **Git**     | Any            |

### API Keys Required

The server requires API keys for external services:

| Service         | Environment Variable | Required | Get API Key                                        |
| --------------- | -------------------- | -------- | -------------------------------------------------- |
| Google Gemini   | `GEMINI_API_KEY`     | ✅       | [Get Key](https://makersuite.google.com/app/apikey) |
| Tavily Search   | `TAVILY_API_KEY`     | ✅       | [Get Key](https://tavily.com/)                      |

**Note:** Multiple Gemini API keys can be provided (e.g., `GEMINI_API_KEY_2`, `GOOGLE_API_KEY`) for failover/load balancing. The server uses them in round-robin fashion.

---

## Full Installation Steps

### Step 1: Clone and Install

```bash
cd MCP-servers/OI-Memory-Orchestrator
npm install
npm run build
```

### Step 2: Verify Build

```bash
# Check that build/index.js exists
ls -la build/index.js
```

### Step 3: Connect to OI OS

```bash
cd ../../
./brain-trust4 connect OI-Memory-Orchestrator node -- "$(pwd)/MCP-servers/OI-Memory-Orchestrator/build/index.js"
```

### Step 4: Verify Connection

```bash
./oi status OI-Memory-Orchestrator
./oi tools OI-Memory-Orchestrator
```

---

## Creating Intent Mappings

Intent mappings allow OI OS to route natural language queries to OI-Memory-Orchestrator tools. The mappings are created in the `brain-trust4.db` database.

**SQL to create intent mappings:**

```sql
BEGIN TRANSACTION;

-- Conversation Management
INSERT OR REPLACE INTO intent_mappings (keyword, server_name, tool_name, priority) VALUES
('create conversation', 'OI-Memory-Orchestrator', 'create_conversation_session', 10),
('start conversation', 'OI-Memory-Orchestrator', 'create_conversation_session', 10),
('new conversation session', 'OI-Memory-Orchestrator', 'create_conversation_session', 10),
('end conversation', 'OI-Memory-Orchestrator', 'end_conversation_session', 10),
('close conversation', 'OI-Memory-Orchestrator', 'end_conversation_session', 10),
('store message', 'OI-Memory-Orchestrator', 'store_conversation_messages', 10),
('save message', 'OI-Memory-Orchestrator', 'store_conversation_messages', 10),
('get conversation', 'OI-Memory-Orchestrator', 'get_conversation_session', 10),
('list conversations', 'OI-Memory-Orchestrator', 'get_conversation_sessions', 10),
('get messages', 'OI-Memory-Orchestrator', 'get_conversation_messages', 10),
('conversation history', 'OI-Memory-Orchestrator', 'get_conversation_messages', 10),
('summarize conversation', 'OI-Memory-Orchestrator', 'summarize_conversation', 10),

-- Task & Plan Management
('create task plan', 'OI-Memory-Orchestrator', 'create_task_plan', 10),
('new task plan', 'OI-Memory-Orchestrator', 'create_task_plan', 10),
('get plan', 'OI-Memory-Orchestrator', 'get_plan', 10),
('list plans', 'OI-Memory-Orchestrator', 'list_task_plans', 10),
('get tasks', 'OI-Memory-Orchestrator', 'get_plan_tasks', 10),
('list tasks', 'OI-Memory-Orchestrator', 'get_plan_tasks', 10),
('add task', 'OI-Memory-Orchestrator', 'add_task_to_plan', 10),
('create task', 'OI-Memory-Orchestrator', 'add_task_to_plan', 10),
('update task', 'OI-Memory-Orchestrator', 'update_task_details', 10),
('delete task', 'OI-Memory-Orchestrator', 'delete_tasks', 10),
('add subtask', 'OI-Memory-Orchestrator', 'add_subtask_to_plan', 10),
('create subtask', 'OI-Memory-Orchestrator', 'add_subtask_to_plan', 10),
('get subtasks', 'OI-Memory-Orchestrator', 'get_subtasks', 10),
('list subtasks', 'OI-Memory-Orchestrator', 'get_subtasks', 10),
('update subtask', 'OI-Memory-Orchestrator', 'update_subtask_details', 10),
('delete subtask', 'OI-Memory-Orchestrator', 'delete_subtasks', 10),

-- Knowledge Graph
('ingest codebase', 'OI-Memory-Orchestrator', 'ingest_codebase_structure', 10),
('parse codebase', 'OI-Memory-Orchestrator', 'ingest_codebase_structure', 10),
('knowledge graph', 'OI-Memory-Orchestrator', 'knowledge_graph_memory', 10),
('query knowledge graph', 'OI-Memory-Orchestrator', 'kg_nl_query', 10),
('visualize knowledge graph', 'OI-Memory-Orchestrator', 'kg_visualize', 10),
('infer relations', 'OI-Memory-Orchestrator', 'kg_infer_relations', 10),

-- Embeddings & Semantic Search
('ingest embeddings', 'OI-Memory-Orchestrator', 'ingest_codebase_embeddings', 10),
('create embeddings', 'OI-Memory-Orchestrator', 'ingest_codebase_embeddings', 10),
('search codebase', 'OI-Memory-Orchestrator', 'query_codebase_embeddings', 10),
('semantic search', 'OI-Memory-Orchestrator', 'query_codebase_embeddings', 10),
('clean embeddings', 'OI-Memory-Orchestrator', 'clean_up_embeddings', 10),

-- AI Tools
('ask gemini', 'OI-Memory-Orchestrator', 'ask_gemini', 10),
('gemini query', 'OI-Memory-Orchestrator', 'ask_gemini', 10),
('tavily search', 'OI-Memory-Orchestrator', 'tavily_web_search', 10),
('web search', 'OI-Memory-Orchestrator', 'tavily_web_search', 10),
('ai suggest subtasks', 'OI-Memory-Orchestrator', 'ai_suggest_subtasks', 10),
('ai analyze plan', 'OI-Memory-Orchestrator', 'ai_analyze_plan', 10),
('ai suggest task details', 'OI-Memory-Orchestrator', 'ai_suggest_task_details', 10);

COMMIT;
```

**Verifying Intent Mappings:**

```bash
sqlite3 brain-trust4.db "SELECT * FROM intent_mappings WHERE server_name = 'OI-Memory-Orchestrator' ORDER BY tool_name, keyword;"
```

---

## Creating Parameter Rules

Parameter rules define which fields are required and how to extract them from natural language queries. The OI OS parameter engine **only extracts required fields** - optional fields are skipped even if extractors exist.

**⚠️ CRITICAL: Most tools require `agent_id` parameter. This must be provided in parameter rules.**

**SQL to create parameter rules (key tools):**

```sql
BEGIN TRANSACTION;

-- Conversation Management
INSERT OR REPLACE INTO parameter_rules (server_name, tool_name, tool_signature, required_fields, field_generators, patterns) VALUES
('OI-Memory-Orchestrator', 'create_conversation_session', 'OI-Memory-Orchestrator::create_conversation_session', '["agent_id"]',
 '{"agent_id": {"FromQuery": "OI-Memory-Orchestrator::create_conversation_session.agent_id"}, "title": {"FromQuery": "OI-Memory-Orchestrator::create_conversation_session.title"}}', '[]'),

('OI-Memory-Orchestrator', 'end_conversation_session', 'OI-Memory-Orchestrator::end_conversation_session', '["session_id"]',
 '{"session_id": {"FromQuery": "OI-Memory-Orchestrator::end_conversation_session.session_id"}}', '[]'),

('OI-Memory-Orchestrator', 'store_conversation_messages', 'OI-Memory-Orchestrator::store_conversation_messages', '["session_id", "messages"]',
 '{"session_id": {"FromQuery": "OI-Memory-Orchestrator::store_conversation_messages.session_id"}, "messages": {"FromQuery": "OI-Memory-Orchestrator::store_conversation_messages.messages"}}', '[]'),

('OI-Memory-Orchestrator', 'get_conversation_session', 'OI-Memory-Orchestrator::get_conversation_session', '["session_id"]',
 '{"session_id": {"FromQuery": "OI-Memory-Orchestrator::get_conversation_session.session_id"}}', '[]'),

('OI-Memory-Orchestrator', 'get_conversation_sessions', 'OI-Memory-Orchestrator::get_conversation_sessions', '["agent_id"]',
 '{"agent_id": {"FromQuery": "OI-Memory-Orchestrator::get_conversation_sessions.agent_id"}}', '[]'),

('OI-Memory-Orchestrator', 'get_conversation_messages', 'OI-Memory-Orchestrator::get_conversation_messages', '["session_id"]',
 '{"session_id": {"FromQuery": "OI-Memory-Orchestrator::get_conversation_messages.session_id"}}', '[]'),

-- Task & Plan Management (all require agent_id)
('OI-Memory-Orchestrator', 'create_task_plan', 'OI-Memory-Orchestrator::create_task_plan', '["agent_id"]',
 '{"agent_id": {"FromQuery": "OI-Memory-Orchestrator::create_task_plan.agent_id"}, "goal_description": {"FromQuery": "OI-Memory-Orchestrator::create_task_plan.goal_description"}}', '[]'),

('OI-Memory-Orchestrator', 'get_plan', 'OI-Memory-Orchestrator::get_plan', '["agent_id", "plan_id"]',
 '{"agent_id": {"FromQuery": "OI-Memory-Orchestrator::get_plan.agent_id"}, "plan_id": {"FromQuery": "OI-Memory-Orchestrator::get_plan.plan_id"}}', '[]'),

('OI-Memory-Orchestrator', 'list_task_plans', 'OI-Memory-Orchestrator::list_task_plans', '["agent_id"]',
 '{"agent_id": {"FromQuery": "OI-Memory-Orchestrator::list_task_plans.agent_id"}}', '[]'),

('OI-Memory-Orchestrator', 'get_plan_tasks', 'OI-Memory-Orchestrator::get_plan_tasks', '["agent_id", "plan_id"]',
 '{"agent_id": {"FromQuery": "OI-Memory-Orchestrator::get_plan_tasks.agent_id"}, "plan_id": {"FromQuery": "OI-Memory-Orchestrator::get_plan_tasks.plan_id"}}', '[]'),

('OI-Memory-Orchestrator', 'add_task_to_plan', 'OI-Memory-Orchestrator::add_task_to_plan', '["agent_id", "plan_id", "title"]',
 '{"agent_id": {"FromQuery": "OI-Memory-Orchestrator::add_task_to_plan.agent_id"}, "plan_id": {"FromQuery": "OI-Memory-Orchestrator::add_task_to_plan.plan_id"}, "title": {"FromQuery": "OI-Memory-Orchestrator::add_task_to_plan.title"}}', '[]'),

-- Knowledge Graph
('OI-Memory-Orchestrator', 'ingest_codebase_structure', 'OI-Memory-Orchestrator::ingest_codebase_structure', '["directory_path"]',
 '{"directory_path": {"FromQuery": "OI-Memory-Orchestrator::ingest_codebase_structure.directory_path"}}', '[]'),

('OI-Memory-Orchestrator', 'query_codebase_embeddings', 'OI-Memory-Orchestrator::query_codebase_embeddings', '["query_text"]',
 '{"query_text": {"FromQuery": "OI-Memory-Orchestrator::query_codebase_embeddings.query_text"}}', '[]'),

-- AI Tools
('OI-Memory-Orchestrator', 'ask_gemini', 'OI-Memory-Orchestrator::ask_gemini', '["query"]',
 '{"query": {"FromQuery": "OI-Memory-Orchestrator::ask_gemini.query"}}', '[]'),

('OI-Memory-Orchestrator', 'tavily_web_search', 'OI-Memory-Orchestrator::tavily_web_search', '["query"]',
 '{"query": {"FromQuery": "OI-Memory-Orchestrator::tavily_web_search.query"}}', '[]');

COMMIT;
```

**Verifying Parameter Rules:**

```bash
sqlite3 brain-trust4.db "SELECT tool_signature, required_fields FROM parameter_rules WHERE server_name = 'OI-Memory-Orchestrator';"
```

---

## Parameter Extractors

Parameter extractors are configured in `parameter_extractors.toml.default`. Add the following extractors for OI-Memory-Orchestrator:

```toml
# OI-Memory-Orchestrator Parameter Extractors

# Conversation Management
"OI-Memory-Orchestrator::create_conversation_session.agent_id" = "regex:(?:agent[\\s_-]?id|agent)[\\s:]+([a-zA-Z0-9_-]+)"
"OI-Memory-Orchestrator::create_conversation_session.title" = "regex:(?:title|name|for)[\\s:]+(.+?)(?:\\s|$)"
"OI-Memory-Orchestrator::end_conversation_session.session_id" = "regex:(?:session[\\s_-]?id|session)[\\s:]+([a-zA-Z0-9_-]+)"
"OI-Memory-Orchestrator::store_conversation_messages.session_id" = "regex:(?:session[\\s_-]?id|session)[\\s:]+([a-zA-Z0-9_-]+)"
"OI-Memory-Orchestrator::get_conversation_session.session_id" = "regex:(?:session[\\s_-]?id|session)[\\s:]+([a-zA-Z0-9_-]+)"
"OI-Memory-Orchestrator::get_conversation_sessions.agent_id" = "regex:(?:agent[\\s_-]?id|agent)[\\s:]+([a-zA-Z0-9_-]+)"
"OI-Memory-Orchestrator::get_conversation_messages.session_id" = "regex:(?:session[\\s_-]?id|session)[\\s:]+([a-zA-Z0-9_-]+)"

# Task & Plan Management
"OI-Memory-Orchestrator::create_task_plan.agent_id" = "regex:(?:agent[\\s_-]?id|agent)[\\s:]+([a-zA-Z0-9_-]+)"
"OI-Memory-Orchestrator::create_task_plan.goal_description" = "regex:(?:goal|plan|for)[\\s:]+(.+?)(?:\\s|$)"
"OI-Memory-Orchestrator::get_plan.agent_id" = "regex:(?:agent[\\s_-]?id|agent)[\\s:]+([a-zA-Z0-9_-]+)"
"OI-Memory-Orchestrator::get_plan.plan_id" = "regex:(?:plan[\\s_-]?id|plan)[\\s:]+([a-zA-Z0-9_-]+)"
"OI-Memory-Orchestrator::list_task_plans.agent_id" = "regex:(?:agent[\\s_-]?id|agent)[\\s:]+([a-zA-Z0-9_-]+)"
"OI-Memory-Orchestrator::get_plan_tasks.agent_id" = "regex:(?:agent[\\s_-]?id|agent)[\\s:]+([a-zA-Z0-9_-]+)"
"OI-Memory-Orchestrator::get_plan_tasks.plan_id" = "regex:(?:plan[\\s_-]?id|plan)[\\s:]+([a-zA-Z0-9_-]+)"
"OI-Memory-Orchestrator::add_task_to_plan.agent_id" = "regex:(?:agent[\\s_-]?id|agent)[\\s:]+([a-zA-Z0-9_-]+)"
"OI-Memory-Orchestrator::add_task_to_plan.plan_id" = "regex:(?:plan[\\s_-]?id|plan)[\\s:]+([a-zA-Z0-9_-]+)"
"OI-Memory-Orchestrator::add_task_to_plan.title" = "regex:(?:task|title|name)[\\s:]+(.+?)(?:\\s|$)"

# Knowledge Graph
"OI-Memory-Orchestrator::ingest_codebase_structure.directory_path" = "regex:(?:path|directory|dir)[\\s:]+([^\\s]+)"
"OI-Memory-Orchestrator::query_codebase_embeddings.query_text" = "regex:(?:query|search|find)[\\s:]+(.+?)(?:\\s|$)"

# AI Tools
"OI-Memory-Orchestrator::ask_gemini.query" = "regex:(?:query|ask|question)[\\s:]+(.+?)(?:\\s|$)"
"OI-Memory-Orchestrator::tavily_web_search.query" = "regex:(?:query|search|find)[\\s:]+(.+?)(?:\\s|$)"
```

---

## Verification & Testing

### Test Direct Calls

```bash
# Test conversation creation
./brain-trust4 call OI-Memory-Orchestrator create_conversation_session '{"agent_id": "test-agent", "title": "Test Session"}'

# Test plan creation
./brain-trust4 call OI-Memory-Orchestrator create_task_plan '{"agent_id": "test-agent", "goal_description": "Build a React app"}'

# Test knowledge graph ingestion
./brain-trust4 call OI-Memory-Orchestrator ingest_codebase_structure '{"directory_path": "./"}'
```

### Test Natural Language Queries

```bash
# Test conversation intent
./oi "memory create conversation session for project planning"

# Test plan intent
./oi "memory create task plan for building a dashboard"

# Test search intent
./oi "memory search codebase for authentication functions"
```

---

## Troubleshooting

### Server Connection Issues

**Error:** `Connection failed during initialization`

**Solution:**
1. Verify server connection: `./oi status OI-Memory-Orchestrator`
2. Check API keys are set in environment
3. Restart server connection: `./brain-trust4 connect OI-Memory-Orchestrator node -- "$(pwd)/MCP-servers/OI-Memory-Orchestrator/build/index.js"`

### Missing agent_id Error

**Error:** `agent_id is required for [tool_name]`

**Solution:** Most tools require `agent_id`. Ensure it's provided in parameter rules and extractors. For direct calls, always include `agent_id`:

```bash
./brain-trust4 call OI-Memory-Orchestrator create_task_plan '{"agent_id": "your-agent-id", "goal_description": "..."}'
```

### Parameter Extraction Fails

**Error:** Natural language queries don't extract parameters correctly

**Solution:**
1. Verify parameter rules exist: `sqlite3 brain-trust4.db "SELECT * FROM parameter_rules WHERE server_name = 'OI-Memory-Orchestrator';"`
2. Check parameter extractors in `parameter_extractors.toml.default`
3. Use direct calls for reliability: `./brain-trust4 call OI-Memory-Orchestrator [tool] '{...}'`

---

## Tool Reference

### Conversation Management

- **create_conversation_session**: Start a new conversation thread
- **end_conversation_session**: Close an active conversation
- **store_conversation_messages**: Save messages to a conversation
- **get_conversation_session**: Get conversation details
- **get_conversation_sessions**: List conversation sessions
- **get_conversation_messages**: Get conversation history
- **summarize_conversation**: Generate conversation summary

### Task & Plan Management

- **create_task_plan**: Create a new task plan (requires agent_id)
- **get_plan**: Get plan details (requires agent_id)
- **list_task_plans**: List all plans (requires agent_id)
- **get_plan_tasks**: Get tasks for a plan (requires agent_id)
- **add_task_to_plan**: Add task to plan (requires agent_id)
- **update_task_details**: Update task (requires agent_id)
- **add_subtask_to_plan**: Add subtask (requires agent_id)
- **get_subtasks**: Get subtasks (requires agent_id)

### Knowledge Graph

- **ingest_codebase_structure**: Parse codebase into knowledge graph
- **knowledge_graph_memory**: Interact with knowledge graph
- **kg_nl_query**: Natural language query for knowledge graph
- **kg_visualize**: Generate Mermaid diagram of knowledge graph
- **kg_infer_relations**: AI-powered relation inference

### Embeddings & Semantic Search

- **ingest_codebase_embeddings**: Create embeddings for codebase
- **query_codebase_embeddings**: Semantic search in codebase
- **clean_up_embeddings**: Remove embeddings

### AI Tools

- **ask_gemini**: Query Google Gemini AI
- **tavily_web_search**: Web search via Tavily
- **ai_suggest_subtasks**: AI-powered subtask suggestions
- **ai_analyze_plan**: AI plan analysis
- **ai_suggest_task_details**: AI task detail suggestions

**Note:** This server has 43 total tools. See `./oi tools OI-Memory-Orchestrator` for complete list.

---

## Storage Location

Data is stored in the server directory:
- **SQLite Database**: `MCP-servers/OI-Memory-Orchestrator/memory.db`
- **Vector Store**: `MCP-servers/OI-Memory-Orchestrator/vector_store.db`
- **Knowledge Graph**: `MCP-servers/OI-Memory-Orchestrator/knowledge_graph.jsonl`

---

_Built for OI OS - The AI Operating System_

