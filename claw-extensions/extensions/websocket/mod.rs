//! WebSocket extension for real-time bidirectional communication
//!
//! Provides WebSocket server and client implementations for claw agents.

use tokio_tungstenite::tungstenite::protocol::Message;
use futures_util::{SinkExt, StreamExt};
use std::sync::Arc;
use tokio::sync::{RwLock, broadcast, mpsc};
use uuid::Uuid;

use crate::error::{ExtensionError, Result};

/// WebSocket configuration
#[derive(Debug, Clone)]
pub struct WebSocketConfig {
    pub bind_addr: String,
    pub max_connections: usize,
    pub message_queue_size: usize,
}

impl WebSocketConfig {
    pub fn new(bind_addr: &str) -> Self {
        Self {
            bind_addr: bind_addr.to_string(),
            max_connections: 100,
            message_queue_size: 1000,
        }
    }
}

impl Default for WebSocketConfig {
    fn default() -> Self {
        Self::new("127.0.0.1:8080")
    }
}

/// WebSocket message types
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct WsMessage {
    pub id: Uuid,
    pub msg_type: WsMessageType,
    pub payload: serde_json::Value,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum WsMessageType {
    /// Agent state update
    AgentUpdate { agent_id: String },
    /// Agent event
    AgentEvent { agent_id: String, event: String },
    /// Broadcast message
    Broadcast,
    /// Direct message
    Direct { to: String },
    /// System message
    System,
}

/// WebSocket connection
pub struct WebSocketConnection {
    id: Uuid,
    tx: mpsc::UnboundedSender<Message>,
}

impl WebSocketConnection {
    pub fn new(id: Uuid, tx: mpsc::UnboundedSender<Message>) -> Self {
        Self { id, tx }
    }

    pub fn send(&mut self, msg: Message) -> Result<()> {
        self.tx.send(msg)
            .map_err(|_| ExtensionError::ConnectionClosed)?;
        Ok(())
    }

    pub fn id(&self) -> Uuid {
        self.id
    }
}

/// WebSocket server
pub struct WebSocketServer {
    config: WebSocketConfig,
    connections: Arc<RwLock<std::collections::HashMap<Uuid, WebSocketConnection>>>,
    broadcast_tx: broadcast::Sender<WsMessage>,
}

impl WebSocketServer {
    pub fn new(config: WebSocketConfig) -> Self {
        let (broadcast_tx, _) = broadcast::channel(1000);

        Self {
            config,
            connections: Arc::new(RwLock::new(std::collections::HashMap::new())),
            broadcast_tx,
        }
    }

    pub fn broadcast_channel(&self) -> broadcast::Sender<WsMessage> {
        self.broadcast_tx.clone()
    }

    pub async fn broadcast(&self, msg: WsMessage) -> Result<()> {
        let _ = self.broadcast_tx.send(msg);
        Ok(())
    }

    pub async fn get_connection(&self, id: Uuid) -> Option<WebSocketConnection> {
        self.connections.read().await.get(&id).cloned()
    }

    pub async fn get_connection_count(&self) -> usize {
        self.connections.read().await.len()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ws_config_creation() {
        let config = WebSocketConfig::new("127.0.0.1:8080");
        assert_eq!(config.bind_addr, "127.0.0.1:8080");
        assert_eq!(config.max_connections, 100);
    }

    #[test]
    fn test_ws_message_creation() {
        let msg = WsMessage {
            id: Uuid::new_v4(),
            msg_type: WsMessageType::Broadcast,
            payload: serde_json::json!({"test": "data"}),
            timestamp: chrono::Utc::now(),
        };

        assert!(matches!(msg.msg_type, WsMessageType::Broadcast));
    }
}
