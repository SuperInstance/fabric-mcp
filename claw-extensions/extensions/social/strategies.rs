//! Coordination strategy implementations

use crate::social::{CoordinationStrategy, CoordinationResult};
use crate::error::Result;

/// Strategy executor
pub struct StrategyExecutor;

impl StrategyExecutor {
    pub async fn execute_parallel(
        &self,
        tasks: Vec<tokio::task::JoinHandle<Result<serde_json::Value>>>,
    ) -> Result<CoordinationResult> {
        let results: Result<Vec<_>> = futures::future::join_all(tasks)
            .await
            .into_iter()
            .map(|r| r.map_err(|e| crate::error::ExtensionError::CoordinationFailed(e.to_string()))?)
            .collect();

        Ok(CoordinationResult {
            pattern_id: "parallel".to_string(),
            strategy: CoordinationStrategy::Parallel,
            results: results?,
            metadata: std::collections::HashMap::new(),
        })
    }

    pub async fn execute_sequential(
        &self,
        tasks: Vec<tokio::task::JoinHandle<Result<serde_json::Value>>>,
    ) -> Result<CoordinationResult> {
        let mut results = Vec::new();

        for task in tasks {
            let result = task.await
                .map_err(|e| crate::error::ExtensionError::CoordinationFailed(e.to_string()))?;
            results.push(result?);
        }

        Ok(CoordinationResult {
            pattern_id: "sequential".to_string(),
            strategy: CoordinationStrategy::Sequential,
            results,
            metadata: std::collections::HashMap::new(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_parallel_strategy() {
        let executor = StrategyExecutor;
        let tasks = vec![
            tokio::spawn(async { Ok(serde_json::json!(1)) }),
            tokio::spawn(async { Ok(serde_json::json!(2)) }),
        ];

        let result = executor.execute_parallel(tasks).await.unwrap();
        assert_eq!(result.results.len(), 2);
    }
}
