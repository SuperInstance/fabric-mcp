//! Consensus mechanisms for multi-agent agreement

use serde::{Deserialize, Serialize};

/// Consensus algorithms
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ConsensusAlgorithm {
    /// All agents must agree
    Unanimous,
    /// Majority vote wins
    Majority,
    /// Weighted voting
    Weighted,
    /// Byzantine fault tolerance
    Byzantine { tolerance: u32 },
}

/// Consensus result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsensusResult {
    pub agreed: bool,
    pub agreement_value: Option<serde_json::Value>,
    pub votes_for: u32,
    pub votes_against: u32,
    pub abstain: u32,
}

/// Tripartite consensus implementation
pub struct TripartiteConsensus {
    algorithm: ConsensusAlgorithm,
}

impl TripartiteConsensus {
    pub fn new(algorithm: ConsensusAlgorithm) -> Self {
        Self { algorithm }
    }

    pub fn reach_consensus(
        &self,
        votes: Vec<serde_json::Value>,
    ) -> Result<ConsensusResult, crate::error::ExtensionError> {
        match self.algorithm {
            ConsensusAlgorithm::Unanimous => {
                let all_same = votes.windows(2).all(|w| w[0] == w[1]);
                Ok(ConsensusResult {
                    agreed: all_same,
                    agreement_value: if all_same { votes.first().cloned() } else { None },
                    votes_for: if all_same { votes.len() as u32 } else { 0 },
                    votes_against: if !all_same { votes.len() as u32 } else { 0 },
                    abstain: 0,
                })
            }
            ConsensusAlgorithm::Majority => {
                // Count occurrences
                let mut counts: std::collections::HashMap<String, u32> = std::collections::HashMap::new();
                for vote in &votes {
                    let key = serde_json::to_string(vote).unwrap_or_default();
                    *counts.entry(key).or_insert(0) += 1;
                }

                let majority_threshold = (votes.len() / 2) + 1;
                let majority = counts.values().max().copied().unwrap_or(0);
                let agreed = majority as usize >= majority_threshold;

                Ok(ConsensusResult {
                    agreed,
                    agreement_value: None,
                    votes_for: majority,
                    votes_against: votes.len() as u32 - majority,
                    abstain: 0,
                })
            }
            _ => Ok(ConsensusResult {
                agreed: false,
                agreement_value: None,
                votes_for: 0,
                votes_against: 0,
                abstain: votes.len() as u32,
            }),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_unanimous_consensus() {
        let consensus = TripartiteConsensus::new(ConsensusAlgorithm::Unanimous);
        let votes = vec![
            serde_json::json!("yes"),
            serde_json::json!("yes"),
            serde_json::json!("yes"),
        ];

        let result = consensus.reach_consensus(votes).unwrap();
        assert!(result.agreed);
        assert_eq!(result.votes_for, 3);
    }

    #[test]
    fn test_majority_consensus() {
        let consensus = TripartiteConsensus::new(ConsensusAlgorithm::Majority);
        let votes = vec![
            serde_json::json!("yes"),
            serde_json::json!("yes"),
            serde_json::json!("no"),
        ];

        let result = consensus.reach_consensus(votes).unwrap();
        assert!(result.agreed);
        assert_eq!(result.votes_for, 2);
        assert_eq!(result.votes_against, 1);
    }
}
