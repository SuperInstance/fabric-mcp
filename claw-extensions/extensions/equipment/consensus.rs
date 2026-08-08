//! Consensus equipment for multi-agent agreement

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::equipment::{AdvancedEquipment, EquipmentSlot, EquipmentHealth};
use crate::error::Result;

/// Tripartite consensus equipment
pub struct TripartiteConsensus {
    name: String,
    memory: HashMap<String, serde_json::Value>,
    threshold: f64,
}

impl TripartiteConsensus {
    pub fn new() -> Self {
        Self {
            name: "TripartiteConsensus".to_string(),
            memory: HashMap::new(),
            threshold: 0.67, // 2/3 majority by default
        }
    }

    pub fn with_threshold(threshold: f64) -> Self {
        Self {
            name: "TripartiteConsensus".to_string(),
            memory: HashMap::new(),
            threshold,
        }
    }

    /// Reach consensus on a value
    pub fn reach_consensus(&self, votes: &[bool]) -> bool {
        if votes.is_empty() {
            return false;
        }

        let agree_count = votes.iter().filter(|&&v| v).count();
        let agreement_ratio = agree_count as f64 / votes.len() as f64;

        agreement_ratio >= self.threshold
    }
}

impl Default for TripartiteConsensus {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl AdvancedEquipment for TripartiteConsensus {
    fn slot(&self) -> EquipmentSlot {
        EquipmentSlot::Consensus
    }

    fn name(&self) -> &str {
        &self.name
    }

    async fn process(&self, data: HashMap<String, serde_json::Value>) -> Result<String> {
        Ok(format!("Consensus threshold: {}", self.threshold))
    }

    fn get_memory(&self) -> &HashMap<String, serde_json::Value> {
        &self.memory
    }

    fn set_memory(&mut self, memory: HashMap<String, serde_json::Value>) {
        self.memory = memory;
    }

    fn cost(&self) -> f64 {
        2.0 // Consensus is expensive
    }

    fn benefit(&self) -> f64 {
        3.0 // But valuable for agreement
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_consensus_creation() {
        let consensus = TripartiteConsensus::new();
        assert_eq!(consensus.slot(), EquipmentSlot::Consensus);
    }

    #[test]
    fn test_consensus_reaching() {
        let consensus = TripartiteConsensus::new();
        let votes = vec![true, true, false];
        assert!(consensus.reach_consensus(&votes));
    }
}
