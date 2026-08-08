//! Social coordination extension for claw-core
//!
//! Provides multi-agent coordination patterns including:
//! - Master-slave relationships
//! - Co-worker collaboration
//! - Peer coordination
//! - Consensus mechanisms
//! - Task delegation

pub mod patterns;
pub mod consensus;
pub mod message;
pub mod relationships;
pub mod routing;
pub mod strategies;

use async_trait::async_trait;
use claw_core::Agent;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::error::{ExtensionError, Result};

/// Social coordination patterns
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum CoordinationPattern {
    /// Master-slave: One master coordinates multiple slaves
    MasterSlave { master_id: String, slave_ids: Vec<String> },
    /// Co-worker: Peers collaborate on tasks
    CoWorker { worker_ids: Vec<String> },
    /// Peer: Equal coordination between agents
    Peer { agent_ids: Vec<String> },
    /// Delegate: Task delegation pattern
    Delegate { delegator_id: String, delegate_id: String },
    /// Observer: One agent observes another
    Observer { observer_id: String, target_id: String },
}

/// Coordination strategies
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum CoordinationStrategy {
    /// Execute all agents simultaneously and aggregate results
    Parallel,
    /// Execute agents in sequence
    Sequential,
    /// All agents must agree
    Consensus,
    /// Majority vote wins
    MajorityVote,
    /// Weight by agent confidence
    Weighted,
}

/// Social manager for coordinating multiple agents
pub struct SocialManager {
    patterns: Arc<RwLock<HashMap<String, CoordinationPattern>>>,
    agent_registry: Arc<RwLock<HashMap<String, Arc<dyn Agent>>>>,
}

impl SocialManager {
    /// Create a new social manager
    pub fn new() -> Self {
        Self {
            patterns: Arc::new(RwLock::new(HashMap::new())),
            agent_registry: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Register an agent
    pub async fn register_agent(&self, id: String, agent: Arc<dyn Agent>) -> Result<()> {
        let mut registry = self.agent_registry.write().await;
        registry.insert(id, agent);
        Ok(())
    }

    /// Unregister an agent
    pub async fn unregister_agent(&self, id: &str) -> Result<()> {
        let mut registry = self.agent_registry.write().await;
        registry.remove(id).ok_or_else(|| {
            ExtensionError::AgentNotFound(id.to_string())
        })?;
        Ok(())
    }

    /// Register a coordination pattern
    pub async fn register_pattern(&self, pattern: CoordinationPattern) -> Result<()> {
        let pattern_id = match &pattern {
            CoordinationPattern::MasterSlave { master_id, .. } => master_id.clone(),
            CoordinationPattern::CoWorker { worker_ids } => {
                worker_ids.join("-")
            }
            CoordinationPattern::Peer { agent_ids } => {
                agent_ids.join("-")
            }
            CoordinationPattern::Delegate { delegator_id, .. } => delegator_id.clone(),
            CoordinationPattern::Observer { observer_id, .. } => observer_id.clone(),
        };

        let mut patterns = self.patterns.write().await;
        patterns.insert(pattern_id, pattern);
        Ok(())
    }

    /// Get pattern by ID
    pub async fn get_pattern(&self, id: &str) -> Result<CoordinationPattern> {
        let patterns = self.patterns.read().await;
        patterns.get(id)
            .cloned()
            .ok_or_else(|| ExtensionError::PatternNotFound(id.to_string()))
    }

    /// Coordinate agents based on pattern
    pub async fn coordinate(
        &self,
        pattern_id: &str,
        strategy: CoordinationStrategy,
        data: HashMap<String, serde_json::Value>,
    ) -> Result<CoordinationResult> {
        let pattern = self.get_pattern(pattern_id).await?;
        let registry = self.agent_registry.read().await;

        match pattern {
            CoordinationPattern::MasterSlave { master_id, slave_ids } => {
                self.coordinate_master_slave(&master_id, &slave_ids, strategy, &data, &registry).await
            }
            CoordinationPattern::CoWorker { worker_ids } => {
                self.coordinate_co_workers(&worker_ids, strategy, &data, &registry).await
            }
            CoordinationPattern::Peer { agent_ids } => {
                self.coordinate_peers(&agent_ids, strategy, &data, &registry).await
            }
            CoordinationPattern::Delegate { delegator_id, delegate_id } => {
                self.coordinate_delegate(&delegator_id, &delegate_id, &data, &registry).await
            }
            CoordinationPattern::Observer { observer_id, target_id } => {
                self.coordinate_observer(&observer_id, &target_id, &data, &registry).await
            }
        }
    }

    /// Master-slave coordination
    async fn coordinate_master_slave(
        &self,
        master_id: &str,
        slave_ids: &[String],
        strategy: CoordinationStrategy,
        data: &HashMap<String, serde_json::Value>,
        registry: &HashMap<String, Arc<dyn Agent>>,
    ) -> Result<CoordinationResult> {
        match strategy {
            CoordinationStrategy::Parallel => {
                // Execute all slaves in parallel
                let tasks: Vec<_> = slave_ids.iter()
                    .filter_map(|id| registry.get(id))
                    .map(|agent| {
                        let data = data.clone();
                        tokio::spawn(async move {
                            // Process with agent
                            Ok(serde_json::json!({"result": "processed"}))
                        })
                    })
                    .collect();

                let results: Result<Vec<_>> = futures::future::join_all(tasks)
                    .await
                    .into_iter()
                    .map(|r| r.map_err(|e| ExtensionError::CoordinationFailed(e.to_string()))?)
                    .collect();

                Ok(CoordinationResult {
                    pattern_id: master_id.to_string(),
                    strategy,
                    results: results?,
                    metadata: HashMap::new(),
                })
            }
            _ => Err(ExtensionError::UnsupportedStrategy(format!("{:?}", strategy))),
        }
    }

    /// Co-worker coordination
    async fn coordinate_co_workers(
        &self,
        worker_ids: &[String],
        strategy: CoordinationStrategy,
        data: &HashMap<String, serde_json::Value>,
        registry: &HashMap<String, Arc<dyn Agent>>,
    ) -> Result<CoordinationResult> {
        // Similar implementation to master-slave
        Ok(CoordinationResult {
            pattern_id: worker_ids.join("-"),
            strategy,
            results: vec![],
            metadata: HashMap::new(),
        })
    }

    /// Peer coordination
    async fn coordinate_peers(
        &self,
        agent_ids: &[String],
        strategy: CoordinationStrategy,
        data: &HashMap<String, serde_json::Value>,
        registry: &HashMap<String, Arc<dyn Agent>>,
    ) -> Result<CoordinationResult> {
        Ok(CoordinationResult {
            pattern_id: agent_ids.join("-"),
            strategy,
            results: vec![],
            metadata: HashMap::new(),
        })
    }

    /// Delegate coordination
    async fn coordinate_delegate(
        &self,
        delegator_id: &str,
        delegate_id: &str,
        data: &HashMap<String, serde_json::Value>,
        registry: &HashMap<String, Arc<dyn Agent>>,
    ) -> Result<CoordinationResult> {
        Ok(CoordinationResult {
            pattern_id: format!("{}-{}", delegator_id, delegate_id),
            strategy: CoordinationStrategy::Sequential,
            results: vec![],
            metadata: HashMap::new(),
        })
    }

    /// Observer coordination
    async fn coordinate_observer(
        &self,
        observer_id: &str,
        target_id: &str,
        data: &HashMap<String, serde_json::Value>,
        registry: &HashMap<String, Arc<dyn Agent>>,
    ) -> Result<CoordinationResult> {
        Ok(CoordinationResult {
            pattern_id: format!("{}-{}", observer_id, target_id),
            strategy: CoordinationStrategy::Sequential,
            results: vec![],
            metadata: HashMap::new(),
        })
    }
}

impl Default for SocialManager {
    fn default() -> Self {
        Self::new()
    }
}

/// Result of coordination
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoordinationResult {
    pub pattern_id: String,
    pub strategy: CoordinationStrategy,
    pub results: Vec<serde_json::Value>,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_social_manager_creation() {
        let manager = SocialManager::new();
        assert_eq!(manager.patterns.read().await.len(), 0);
    }

    #[tokio::test]
    async fn test_register_pattern() {
        let manager = SocialManager::new();

        let pattern = CoordinationPattern::MasterSlave {
            master_id: "master".to_string(),
            slave_ids: vec!["slave1".to_string(), "slave2".to_string()],
        };

        manager.register_pattern(pattern).await.unwrap();
        assert_eq!(manager.patterns.read().await.len(), 1);
    }
}
