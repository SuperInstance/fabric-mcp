//! Seed learning system for claw agents
//!
//! Machine learning behavior optimization for agent specialization.

pub mod seed;
pub mod training;
pub mod distillation;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::error::Result;

/// Learning strategies
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum LearningStrategy {
    /// Reinforcement learning
    Reinforcement,
    /// Supervised learning
    Supervised,
    /// Unsupervised learning
    Unsupervised,
    /// Transfer learning
    Transfer,
    /// Federated learning
    Federated,
}

/// Seed definition - natural language behavior
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Seed {
    pub id: String,
    pub purpose: String,
    pub trigger: TriggerType,
    pub learning_strategy: LearningStrategy,
    pub default_equipment: Vec<String>,
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Trigger types for seeds
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(tag = "type")]
pub enum TriggerType {
    /// Data-based trigger
    Data { source: String, conditions: Vec<String> },
    /// Periodic trigger
    Periodic { interval_ms: u64 },
    /// Formula-based trigger
    Formula { formula: String },
    /// External event trigger
    External { event_type: String, source: String },
}

impl Seed {
    pub fn new(purpose: &str, trigger: TriggerType, learning_strategy: LearningStrategy) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            purpose: purpose.to_string(),
            trigger,
            learning_strategy,
            default_equipment: vec!["MEMORY".to_string()],
            metadata: HashMap::new(),
        }
    }

    pub fn with_equipment(mut self, equipment: Vec<String>) -> Self {
        self.default_equipment = equipment;
        self
    }

    pub fn with_metadata(mut self, metadata: HashMap<String, serde_json::Value>) -> Self {
        self.metadata = metadata;
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_seed_creation() {
        let trigger = TriggerType::Data {
            source: "sensor".to_string(),
            conditions: vec!["temperature > 50".to_string()],
        };

        let seed = Seed::new(
            "Monitor temperature",
            trigger,
            LearningStrategy::Reinforcement,
        );

        assert_eq!(seed.purpose, "Monitor temperature");
        assert!(matches!(seed.trigger, TriggerType::Data { .. }));
    }
}
