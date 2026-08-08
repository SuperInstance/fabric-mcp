//! Coordination pattern implementations

use crate::social::{CoordinationPattern, CoordinationStrategy, CoordinationResult};
use crate::error::Result;

/// Master-slave pattern implementation
pub struct MasterSlave {
    master_id: String,
    slave_ids: Vec<String>,
    strategy: CoordinationStrategy,
}

impl MasterSlave {
    pub fn new(master_id: String, slave_ids: Vec<String>, strategy: CoordinationStrategy) -> Self {
        Self {
            master_id,
            slave_ids,
            strategy,
        }
    }

    pub fn to_pattern(&self) -> CoordinationPattern {
        CoordinationPattern::MasterSlave {
            master_id: self.master_id.clone(),
            slave_ids: self.slave_ids.clone(),
        }
    }
}

/// Co-worker pattern implementation
pub struct CoWorker {
    worker_ids: Vec<String>,
    strategy: CoordinationStrategy,
}

impl CoWorker {
    pub fn new(worker_ids: Vec<String>, strategy: CoordinationStrategy) -> Self {
        Self {
            worker_ids,
            strategy,
        }
    }

    pub fn to_pattern(&self) -> CoordinationPattern {
        CoordinationPattern::CoWorker {
            worker_ids: self.worker_ids.clone(),
        }
    }
}

/// Peer coordination pattern implementation
pub struct Peer {
    agent_ids: Vec<String>,
    strategy: CoordinationStrategy,
}

impl Peer {
    pub fn new(agent_ids: Vec<String>, strategy: CoordinationStrategy) -> Self {
        Self {
            agent_ids,
            strategy,
        }
    }

    pub fn to_pattern(&self) -> CoordinationPattern {
        CoordinationPattern::Peer {
            agent_ids: self.agent_ids.clone(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_master_slave_creation() {
        let pattern = MasterSlave::new(
            "master".to_string(),
            vec!["slave1".to_string()],
            CoordinationStrategy::Parallel,
        );

        assert_eq!(pattern.master_id, "master");
        assert_eq!(pattern.slave_ids.len(), 1);
    }
}
