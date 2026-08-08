//! Claw Extensions - Advanced features for claw-core
//!
//! This crate provides optional extensions for the claw-core cellular agent engine.
//!
//! ## Features
//!
//! - **equipment**: Advanced multi-slot equipment system
//! - **social**: Multi-agent coordination patterns
//! - **learning**: Seed learning and model distillation
//! - **bot**: Simple automation loops without ML
//! - **websocket**: Real-time bidirectional communication
//! - **gpu**: GPU acceleration (CUDA/WGPU)
//! - **monitoring**: Advanced monitoring and telemetry
//!
//! ## Usage
//!
//! ```rust,no_run
//! use claw_extensions::equipment::EquipmentManager;
//! use claw_extensions::social::SocialManager;
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     let mut equipment_mgr = EquipmentManager::new();
//!     let social_mgr = SocialManager::new();
//!
//!     // Use extensions
//!     Ok(())
//! }
//! ```

pub mod error;

#[cfg(feature = "equipment")]
pub mod equipment;

#[cfg(feature = "social")]
pub mod social;

#[cfg(feature = "learning")]
pub mod learning;

#[cfg(feature = "bot")]
pub mod bot;

#[cfg(feature = "websocket")]
pub mod websocket;

#[cfg(feature = "gpu")]
pub mod gpu;

#[cfg(feature = "monitoring")]
pub mod monitoring;

// Re-export common types
pub use error::{ExtensionError, Result};

/// Extension version
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// Extension name
pub const NAME: &str = env!("CARGO_PKG_NAME");

// --- Capability Handshake Module ---
use async_trait::async_trait;

/// Represents the intelligence tiers available in the ecosystem.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum IntelligenceTier {
    Edge,        // Tier 4: Local/Low-latency
    Workhorse,   // Tier 1: Standard reasoning
    Specialist,  // Tier 2: Deep domain expertise
    Generalist,  // Tier 3: High-order reasoning
}

/// Defines triggers for changing capability states.
#[derive(Debug, Clone)]
pub enum EscalationTrigger {
    LowConfidence(f32),
    HighComplexity(f32), // 0.0 to 1.0
    SocialConsensusRequired,
}

/// Metadata required to transfer state during escalation.
#[derive(Debug, Clone)]
pub struct HandshakeContext {
    pub original_tier: IntelligenceTier,
    pub intent: String,
    pub state_snapshot: Vec<u8>,
    pub requirement: String,
}

/// Result of a distillation process.
#[derive(Debug, Clone)]
pub struct DistillationPayload {
    pub optimized_prompt: String,
    pub distilled_weights_ref: Option<String>,
    pub behavior_seed: String,
}

/// Errors encountered during the handshake.
#[derive(Debug, Clone)]
pub enum HandshakeError {
    ResourceUnavailable(String),
    ContextLoss,
    TierIncompatibility,
}

/// Represents the current capability state of an agent.
pub trait CapabilityState {
    fn tier(&self) -> IntelligenceTier;
    fn confidence(&self) -> f32;
    fn context_saturation(&self) -> f32;
}

/// The core interface for executing a capability handshake.
#[async_trait]
pub trait CapabilityHandshake {
    /// Triggers an escalation to a higher intelligence tier.
    async fn escalate(&self, reason: EscalationTrigger) -> Result<HandshakeContext, HandshakeError>;

    /// Distills knowledge from a high-tier interaction back to the local tier.
    async fn distill(&self, context: HandshakeContext) -> Result<DistillationPayload, HandshakeError>;
}
