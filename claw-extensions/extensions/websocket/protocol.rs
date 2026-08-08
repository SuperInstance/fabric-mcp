//! WebSocket protocol definitions

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// WebSocket protocol message
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProtocolMessage {
    pub version: u32,
    pub message_type: MessageType,
    pub payload: Payload,
    pub correlation_id: Option<Uuid>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

/// Message types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum MessageType {
    /// Handshake message
    Handshake,
    /// Authentication
    Auth,
    /// Agent command
    AgentCommand,
    /// Agent state update
    AgentState,
    /// Subscription
    Subscribe,
    /// Unsubscribe
    Unsubscribe,
    /// Heartbeat
    Heartbeat,
    /// Error
    Error,
}

/// Message payload
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Payload {
    /// Handshake payload
    Handshake {
        client_id: String,
        protocol_version: u32,
    },
    /// Authentication payload
    Auth {
        token: String,
    },
    /// Agent command payload
    AgentCommand {
        agent_id: String,
        command: String,
        params: serde_json::Value,
    },
    /// Agent state payload
    AgentState {
        agent_id: String,
        state: serde_json::Value,
    },
    /// Subscription payload
    Subscribe {
        channel: String,
        filter: Option<serde_json::Value>,
    },
    /// Heartbeat payload
    Heartbeat {
        sequence: u64,
    },
    /// Error payload
    Error {
        code: String,
        message: String,
    },
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_protocol_message() {
        let msg = ProtocolMessage {
            version: 1,
            message_type: MessageType::Handshake,
            payload: Payload::Handshake {
                client_id: "test".to_string(),
                protocol_version: 1,
            },
            correlation_id: None,
            timestamp: chrono::Utc::now(),
        };

        assert_eq!(msg.version, 1);
        assert_eq!(msg.message_type, MessageType::Handshake);
    }
}
