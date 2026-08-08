//! Reasoning equipment with escalation engine

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::equipment::{AdvancedEquipment, EquipmentSlot, EquipmentHealth};
use crate::error::Result;

/// Escalation engine for complex reasoning
pub struct EscalationEngine {
    name: String,
    memory: HashMap<String, serde_json::Value>,
    escalation_level: u32,
    max_level: u32,
}

impl EscalationEngine {
    pub fn new() -> Self {
        Self {
            name: "EscalationEngine".to_string(),
            memory: HashMap::new(),
            escalation_level: 0,
            max_level: 5,
        }
    }

    pub fn with_max_level(max_level: u32) -> Self {
        Self {
            name: "EscalationEngine".to_string(),
            memory: HashMap::new(),
            escalation_level: 0,
            max_level,
        }
    }

    /// Escalate reasoning level
    pub fn escalate(&mut self) -> Result<()> {
        if self.escalation_level < self.max_level {
            self.escalation_level += 1;
            Ok(())
        } else {
            Err(crate::error::ExtensionError::MaxLevelReached)
        }
    }

    /// De-escalate reasoning level
    pub fn deescalate(&mut self) -> Result<()> {
        if self.escalation_level > 0 {
            self.escalation_level -= 1;
            Ok(())
        } else {
            Err(crate::error::ExtensionError::MinLevelReached)
        }
    }

    /// Get current escalation level
    pub fn level(&self) -> u32 {
        self.escalation_level
    }
}

impl Default for EscalationEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl AdvancedEquipment for EscalationEngine {
    fn slot(&self) -> EquipmentSlot {
        EquipmentSlot::Reasoning
    }

    fn name(&self) -> &str {
        &self.name
    }

    async fn process(&self, data: HashMap<String, serde_json::Value>) -> Result<String> {
        Ok(format!("Processed reasoning at level {}", self.escalation_level))
    }

    fn get_memory(&self) -> &HashMap<String, serde_json::Value> {
        &self.memory
    }

    fn set_memory(&mut self, memory: HashMap<String, serde_json::Value>) {
        self.memory = memory;
    }

    fn cost(&self) -> f64 {
        // Higher escalation level = higher cost
        1.0 + (self.escalation_level as f64 * 0.5)
    }

    fn benefit(&self) -> f64 {
        // Higher escalation level = higher benefit
        1.0 + (self.escalation_level as f64 * 0.3)
    }

    fn health(&self) -> EquipmentHealth {
        if self.escalation_level >= self.max_level {
            EquipmentHealth::Degraded
        } else {
            EquipmentHealth::Healthy
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_escalation_engine_creation() {
        let engine = EscalationEngine::new();
        assert_eq!(engine.slot(), EquipmentSlot::Reasoning);
        assert_eq!(engine.level(), 0);
    }

    #[test]
    fn test_escalation() {
        let mut engine = EscalationEngine::new();
        engine.escalate().unwrap();
        assert_eq!(engine.level(), 1);
    }
}
