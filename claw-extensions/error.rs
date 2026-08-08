//! Error types for claw-extensions

use thiserror::Error;

/// Extension error types
#[derive(Debug, Error)]
pub enum ExtensionError {
    /// Agent not found
    #[error("Agent not found: {0}")]
    AgentNotFound(String),

    /// Pattern not found
    #[error("Pattern not found: {0}")]
    PatternNotFound(String),

    /// Route not found
    #[error("Route not found: {0}")]
    RouteNotFound(String),

    /// Connection closed
    #[error("Connection closed")]
    ConnectionClosed,

    /// Bind failed
    #[error("Failed to bind: {0}")]
    BindFailed(String),

    /// Coordination failed
    #[error("Coordination failed: {0}")]
    CoordinationFailed(String),

    /// Unsupported strategy
    #[error("Unsupported strategy: {0}")]
    UnsupportedStrategy(String),

    /// Max level reached
    #[error("Maximum level reached")]
    MaxLevelReached,

    /// Min level reached
    #[error("Minimum level reached")]
    MinLevelReached,

    /// Training failed
    #[error("Training failed: {0}")]
    TrainingFailed(String),

    /// Distillation failed
    #[error("Distillation failed: {0}")]
    DistillationFailed(String),

    /// Bot error
    #[error("Bot error: {0}")]
    BotError(String),

    /// GPU error
    #[error("GPU error: {0}")]
    GpuError(String),

    /// Equipment error
    #[error("Equipment error: {0}")]
    EquipmentError(String),

    /// Invalid configuration
    #[error("Invalid configuration: {0}")]
    InvalidConfiguration(String),

    /// Timeout
    #[error("Operation timed out")]
    Timeout,

    /// Internal error
    #[error("Internal error: {0}")]
    Internal(String),
}

/// Extension result type
pub type Result<T> = std::result::Result<T, ExtensionError>;
