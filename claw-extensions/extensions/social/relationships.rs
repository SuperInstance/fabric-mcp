//! Agent relationship management

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Relationship type between agents
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum RelationshipType {
    /// Parent-child relationship
    ParentChild,
    /// Sibling relationship
    Sibling,
    /// Peer relationship
    Peer,
    /// Master-slave relationship
    MasterSlave,
    /// Co-worker relationship
    CoWorker,
    /// Observer relationship
    Observer,
}

/// Relationship metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Relationship {
    pub agent_a: String,
    pub agent_b: String,
    pub relationship_type: RelationshipType,
    pub metadata: HashMap<String, serde_json::Value>,
    pub established_at: chrono::DateTime<chrono::Utc>,
}

/// Relationship manager
pub struct RelationshipManager {
    relationships: HashMap<(String, String), Relationship>,
}

impl RelationshipManager {
    pub fn new() -> Self {
        Self {
            relationships: HashMap::new(),
        }
    }

    pub fn add_relationship(&mut self, relationship: Relationship) -> Result<(), crate::error::ExtensionError> {
        let key = (relationship.agent_a.clone(), relationship.agent_b.clone());
        self.relationships.insert(key, relationship);
        Ok(())
    }

    pub fn get_relationship(&self, agent_a: &str, agent_b: &str) -> Option<&Relationship> {
        self.relationships.get(&(agent_a.to_string(), agent_b.to_string()))
    }

    pub fn get_all_relationships(&self, agent_id: &str) -> Vec<&Relationship> {
        self.relationships
            .values()
            .filter(|r| r.agent_a == agent_id || r.agent_b == agent_id)
            .collect()
    }
}

impl Default for RelationshipManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add_relationship() {
        let mut manager = RelationshipManager::new();
        let relationship = Relationship {
            agent_a: "agent1".to_string(),
            agent_b: "agent2".to_string(),
            relationship_type: RelationshipType::Peer,
            metadata: HashMap::new(),
            established_at: chrono::Utc::now(),
        };

        manager.add_relationship(relationship).unwrap();
        assert_eq!(manager.relationships.len(), 1);
    }
}
