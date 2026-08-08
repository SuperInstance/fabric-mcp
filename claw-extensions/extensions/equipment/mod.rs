//! Advanced equipment system for claw-core
//!
//! Extends the single Memory slot to 6 equipment slots with hot-swapping,
//! muscle memory extraction, and cost/benefit analysis.

pub mod memory;
pub mod reasoning;
pub mod consensus;
pub mod spreadsheet;
pub mod distillation;
pub mod coordination;

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::error::{ExtensionError, Result};

/// Advanced equipment slots
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum EquipmentSlot {
    /// Memory - state persistence and retrieval
    Memory,
    /// Reasoning - decision making and escalation
    Reasoning,
    /// Consensus - multi-agent agreement
    Consensus,
    /// Spreadsheet - cell integration
    Spreadsheet,
    /// Distillation - model compression
    Distillation,
    /// Coordination - multi-agent orchestration
    Coordination,
}

/// Advanced equipment trait
#[async_trait]
pub trait AdvancedEquipment: Send + Sync {
    /// Get the equipment slot
    fn slot(&self) -> EquipmentSlot;

    /// Get equipment name
    fn name(&self) -> &str;

    /// Get equipment version
    fn version(&self) -> &str {
        "1.0.0"
    }

    /// Process data and return result
    async fn process(&self, data: HashMap<String, serde_json::Value>) -> Result<String>;

    /// Get equipment cost (for optimization)
    fn cost(&self) -> f64 {
        1.0
    }

    /// Get equipment benefit score
    fn benefit(&self) -> f64 {
        1.0
    }

    /// Get equipment memory
    fn get_memory(&self) -> &HashMap<String, serde_json::Value>;

    /// Set equipment memory
    fn set_memory(&mut self, memory: HashMap<String, serde_json::Value>);

    /// Extract muscle memory (learned triggers)
    fn extract_muscle_memory(&self) -> Result<Vec<String>> {
        Ok(vec![])
    }

    /// Get equipment health
    fn health(&self) -> EquipmentHealth {
        EquipmentHealth::Healthy
    }
}

/// Equipment health status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum EquipmentHealth {
    /// Equipment is working normally
    Healthy,
    /// Equipment is degraded but functional
    Degraded,
    /// Equipment is malfunctioning
    Malfunctioning,
    /// Equipment is unavailable
    Unavailable,
}

/// Equipment manager with hot-swapping
pub struct EquipmentManager {
    equipped: Arc<RwLock<HashMap<EquipmentSlot, Box<dyn AdvancedEquipment>>>>,
    muscle_memory: Arc<RwLock<HashMap<EquipmentSlot, Vec<String>>>>,
}

impl EquipmentManager {
    /// Create a new equipment manager
    pub fn new() -> Self {
        Self {
            equipped: Arc::new(RwLock::new(HashMap::new())),
            muscle_memory: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Equip an item
    pub async fn equip(&mut self, equipment: Box<dyn AdvancedEquipment>) -> Result<()> {
        let slot = equipment.slot();

        // Extract muscle memory from old equipment if exists
        {
            let equipped = self.equipped.read().await;
            if let Some(old_equipment) = equipped.get(&slot) {
                let memory = old_equipment.extract_muscle_memory()?;
                let mut muscle_memory = self.muscle_memory.write().await;
                muscle_memory.insert(slot, memory);
            }
        }

        // Equip new equipment
        let mut equipped = self.equipped.write().await;
        equipped.insert(slot, equipment);

        Ok(())
    }

    /// Unequip an item
    pub async fn unequip(&mut self, slot: EquipmentSlot) -> Result<Option<Box<dyn AdvancedEquipment>>> {
        let mut equipped = self.equipped.write().await;
        Ok(equipped.remove(&slot))
    }

    /// Get equipped item
    pub async fn get(&self, slot: EquipmentSlot) -> Option<Box<dyn AdvancedEquipment>> {
        // Note: This is a simplified version - actual implementation would need cloning
        None
    }

    /// Check if slot is equipped
    pub async fn is_equipped(&self, slot: EquipmentSlot) -> bool {
        let equipped = self.equipped.read().await;
        equipped.contains_key(&slot)
    }

    /// Get all equipped slots
    pub async fn equipped_slots(&self) -> Vec<EquipmentSlot> {
        let equipped = self.equipped.read().await;
        equipped.keys().copied().collect()
    }

    /// Process with all equipped equipment
    pub async fn process_all(&self, data: HashMap<String, serde_json::Value>) -> Result<Vec<String>> {
        let equipped = self.equipped.read().await;
        let mut results = Vec::new();

        for (_slot, equipment) in equipped.iter() {
            let result = equipment.process(data.clone()).await?;
            results.push(result);
        }

        Ok(results)
    }

    /// Analyze cost/benefit of equipment
    pub async fn analyze_equipment(&self) -> HashMap<EquipmentSlot, (f64, f64)> {
        let equipped = self.equipped.read().await;
        let mut analysis = HashMap::new();

        for (slot, equipment) in equipped.iter() {
            analysis.insert(*slot, (equipment.cost(), equipment.benefit()));
        }

        analysis
    }
}

impl Default for EquipmentManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_equipment_manager_creation() {
        let manager = EquipmentManager::new();
        assert_eq!(manager.equipped_slots().await.len(), 0);
    }

    #[tokio::test]
    async fn test_equipment_slot_enum() {
        let slot = EquipmentSlot::Memory;
        assert_eq!(slot, EquipmentSlot::Memory);
    }
}
