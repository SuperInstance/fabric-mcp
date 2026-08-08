//! Advanced memory equipment with hierarchical caching

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::equipment::{AdvancedEquipment, EquipmentSlot, EquipmentHealth};
use crate::error::Result;

/// Hierarchical memory with L0/L1/L2 caching
pub struct HierarchicalMemory {
    name: String,
    // L0: Register-level cache (fastest)
    l0_cache: HashMap<String, serde_json::Value>,
    // L1: L1 cache (fast)
    l1_cache: HashMap<String, serde_json::Value>,
    // L2: Main memory (slower)
    l2_memory: HashMap<String, serde_json::Value>,
    // Cache size limits
    l0_size: usize,
    l1_size: usize,
}

impl HierarchicalMemory {
    pub fn new() -> Self {
        Self {
            name: "HierarchicalMemory".to_string(),
            l0_cache: HashMap::new(),
            l1_cache: HashMap::new(),
            l2_memory: HashMap::new(),
            l0_size: 10,
            l1_size: 100,
        }
    }

    pub fn with_cache_sizes(l0_size: usize, l1_size: usize) -> Self {
        Self {
            name: "HierarchicalMemory".to_string(),
            l0_cache: HashMap::new(),
            l1_cache: HashMap::new(),
            l2_memory: HashMap::new(),
            l0_size,
            l1_size,
        }
    }

    /// Get value from cache hierarchy
    pub fn get_cached(&self, key: &str) -> Option<&serde_json::Value> {
        // Check L0 first
        if let Some(value) = self.l0_cache.get(key) {
            return Some(value);
        }
        // Check L1
        if let Some(value) = self.l1_cache.get(key) {
            return Some(value);
        }
        // Check L2
        self.l2_memory.get(key)
    }

    /// Set value in cache hierarchy
    pub fn set_cached(&mut self, key: String, value: serde_json::Value) {
        // Add to L0
        if self.l0_cache.len() >= self.l0_size {
            // Evict from L0 to L1
            if let Some((k, v)) = self.l0_cache.drain().next() {
                self.l1_cache.insert(k, v);
            }
        }
        self.l0_cache.insert(key, value);

        // Evict from L1 to L2 if needed
        if self.l1_cache.len() >= self.l1_size {
            if let Some((k, v)) = self.l1_cache.drain().next() {
                self.l2_memory.insert(k, v);
            }
        }
    }
}

impl Default for HierarchicalMemory {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl AdvancedEquipment for HierarchicalMemory {
    fn slot(&self) -> EquipmentSlot {
        EquipmentSlot::Memory
    }

    fn name(&self) -> &str {
        &self.name
    }

    async fn process(&self, data: HashMap<String, serde_json::Value>) -> Result<String> {
        Ok(format!("Processed {} items in hierarchical memory", data.len()))
    }

    fn get_memory(&self) -> &HashMap<String, serde_json::Value> {
        &self.l2_memory
    }

    fn set_memory(&mut self, memory: HashMap<String, serde_json::Value>) {
        self.l2_memory = memory;
    }

    fn extract_muscle_memory(&self) -> Result<Vec<String>> {
        // Extract frequently accessed keys
        let mut triggers = Vec::new();
        for key in self.l0_cache.keys() {
            triggers.push(key.clone());
        }
        Ok(triggers)
    }

    fn health(&self) -> EquipmentHealth {
        let total_usage = self.l0_cache.len() + self.l1_cache.len() + self.l2_memory.len();
        if total_usage > (self.l0_size + self.l1_size) * 2 {
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
    fn test_hierarchical_memory_creation() {
        let memory = HierarchicalMemory::new();
        assert_eq!(memory.slot(), EquipmentSlot::Memory);
    }

    #[test]
    fn test_cache_hierarchy() {
        let mut memory = HierarchicalMemory::new();
        memory.set_cached("key1".to_string(), serde_json::json!(1));
        assert!(memory.get_cached("key1").is_some());
    }
}
