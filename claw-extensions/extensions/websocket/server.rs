//! WebSocket server implementation

use crate::websocket::{WebSocketConfig, WebSocketServer, WsMessage};
use crate::error::Result;

impl WebSocketServer {
    /// Start the WebSocket server
    pub async fn serve(&self) -> Result<()> {
        let listener = tokio::net::TcpListener::bind(&self.config.bind_addr).await
            .map_err(|e| crate::error::ExtensionError::BindFailed(e.to_string()))?;

        tracing::info!("WebSocket server listening on {}", self.config.bind_addr);

        while let Ok((stream, addr)) = listener.accept().await {
            tracing::debug!("New connection from {}", addr);

            let config = self.config.clone();
            let connections = self.connections.clone();
            let mut broadcast_rx = self.broadcast_tx.subscribe();

            tokio::spawn(async move {
                if let Err(e) = handle_connection(stream, config, connections, broadcast_rx).await {
                    tracing::error!("Connection error: {}", e);
                }
            });
        }

        Ok(())
    }
}

async fn handle_connection(
    stream: tokio::net::TcpStream,
    config: WebSocketConfig,
    connections: Arc<tokio::sync::RwLock<std::collections::HashMap<Uuid, crate::websocket::WebSocketConnection>>>,
    mut broadcast_rx: broadcast::Receiver<WsMessage>,
) -> Result<()> {
    use tokio_tungstenite::accept_hdr_async;
    use tokio_tungstenite::tungstenite::handshake::server::{Request, Response};

    // Custom handshake callback
    let callback = |req: &Request, response: Response| {
        tracing::debug!("Handshake request from {:?}", req);
        Ok(response)
    };

    let ws_stream = accept_hdr_async(stream, callback).await?;
    let (mut ws_sender, mut ws_receiver) = ws_stream.split();

    let connection_id = Uuid::new_v4();
    let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel();

    // Store connection
    {
        let mut conns = connections.write().await;
        conns.insert(connection_id, crate::websocket::WebSocketConnection::new(connection_id, tx));
    }

    tracing::info!("Connection {} established", connection_id);

    // Spawn task to handle broadcast messages
    let conn_id = connection_id.clone();
    tokio::spawn(async move {
        while let Ok(msg) = broadcast_rx.recv().await {
            let json = serde_json::to_string(&msg).unwrap_or_default();
            if let Err(e) = tx.send(tokio_tungstenite::tungstenite::protocol::Message::Text(json)) {
                tracing::error!("Failed to send to connection {}: {}", conn_id, e);
                break;
            }
        }
    });

    // Handle incoming messages
    while let Some(msg) = ws_receiver.next().await {
        match msg {
            Ok(tokio_tungstenite::tungstenite::protocol::Message::Text(text)) => {
                tracing::debug!("Received text: {}", text);
                // Process message
            }
            Ok(tokio_tungstenite::tungstenite::protocol::Message::Close(_)) => {
                tracing::info!("Connection {} closed", connection_id);
                break;
            }
            Err(e) => {
                tracing::error!("Error receiving from connection {}: {}", connection_id, e);
                break;
            }
            _ => {}
        }
    }

    // Remove connection
    {
        let mut conns = connections.write().await;
        conns.remove(&connection_id);
    }

    Ok(())
}
