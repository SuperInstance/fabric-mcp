//! Inter-agent message types and routing

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Message type for agent communication
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentMessage {
    pub id: Uuid,
    pub from: String,
    pub to: String,
    pub payload: MessagePayload,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

/// Message payload types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum MessagePayload {
    /// Direct command
    Command { command: String, data: serde_json::Value },
    /// Query request
    Query { query: String, params: serde_json::Value },
    /// Query response
    Response { data: serde_json::Value },
    /// Event notification
    Event { event: String, data: serde_json::Value },
    /// Task delegation
    Task { task: String, payload: serde_json::Value },
    /// Status update
    Status { status: String, metadata: serde_json::Value },
}

impl AgentMessage {
    pub fn new(from: String, to: String, payload: MessagePayload) -> Self {
        Self {
            id: Uuid::new_v4(),
            from,
            to,
            payload,
            timestamp: chrono::Utc::now(),
        }
    }

    pub fn command(from: String, to: String, command: String, data: serde_json::Value) -> Self {
        Self::new(from, to, MessagePayload::Command { command, data })
    }

    pub fn query(from: String, to: String, query: String, params: serde_json::Value) -> Self {
        Self::new(from, to, MessagePayload::Query { query, params })
    }

    pub fn response(from: String, to: String, data: serde_json::Value) -> Self {
        Self::new(from, to, MessagePayload::Response { data })
    }

    pub fn event(from: String, to: String, event: String, data: serde_json::Value) -> Self {
        Self::new(from, to, MessagePayload::Event { event, data })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_message_creation() {
        let msg = AgentMessage::command(
            "agent1".to_string(),
            "agent2".to_string(),
            "process".to_string(),
            serde_json::json!({"data": "test"}),
        );

        assert_eq!(msg.from, "agent1");
        assert_eq!(msg.to, "agent2");
    }
}
