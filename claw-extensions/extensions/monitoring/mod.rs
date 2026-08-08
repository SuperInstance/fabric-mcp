//! Advanced monitoring extension for claw-core
//!
//! Provides metrics collection, performance profiling, and telemetry.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Instant;
use tokio::sync::RwLock;

use crate::error::Result;

/// Monitoring metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Metric {
    pub name: String,
    pub value: f64,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub labels: HashMap<String, String>,
}

/// Health status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum HealthStatus {
    Healthy,
    Degraded,
    Unhealthy,
}

/// Health check result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthCheck {
    pub status: HealthStatus,
    pub checks: HashMap<String, CheckResult>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

/// Individual check result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckResult {
    pub name: String,
    pub status: HealthStatus,
    pub message: Option<String>,
    pub duration_ms: u64,
}

/// Monitor for collecting metrics
pub struct Monitor {
    metrics: Arc<RwLock<Vec<Metric>>>,
    health_checks: Arc<RwLock<HashMap<String, CheckResult>>>,
}

impl Monitor {
    /// Create a new monitor
    pub fn new() -> Self {
        Self {
            metrics: Arc::new(RwLock::new(Vec::new())),
            health_checks: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Track a metric
    pub async fn track_metric(&self, name: String, value: f64, labels: HashMap<String, String>) {
        let metric = Metric {
            name,
            value,
            timestamp: chrono::Utc::now(),
            labels,
        };

        let mut metrics = self.metrics.write().await;
        metrics.push(metric);

        // Keep only last 1000 metrics
        if metrics.len() > 1000 {
            metrics.drain(0..metrics.len() - 1000);
        }
    }

    /// Get all metrics
    pub async fn get_metrics(&self) -> Vec<Metric> {
        self.metrics.read().await.clone()
    }

    /// Get metrics by name
    pub async fn get_metrics_by_name(&self, name: &str) -> Vec<Metric> {
        let metrics = self.metrics.read().await;
        metrics.iter().filter(|m| m.name == name).cloned().collect()
    }

    /// Record a health check
    pub async fn record_health_check(&self, check: CheckResult) {
        let mut checks = self.health_checks.write().await;
        checks.insert(check.name.clone(), check);
    }

    /// Get health status
    pub async fn health_check(&self) -> Result<HealthCheck> {
        let checks = self.health_checks.read().await;
        let checks_clone = checks.clone();

        let overall_status = if checks_clone.values().all(|c| c.status == HealthStatus::Healthy) {
            HealthStatus::Healthy
        } else if checks_clone.values().any(|c| c.status == HealthStatus::Unhealthy) {
            HealthStatus::Unhealthy
        } else {
            HealthStatus::Degraded
        };

        Ok(HealthCheck {
            status: overall_status,
            checks: checks_clone,
            timestamp: chrono::Utc::now(),
        })
    }

    /// Measure execution time
    pub async fn measure<F, Fut, T>(&self, name: String, f: F) -> Result<T>
    where
        F: FnOnce() -> Fut,
        Fut: std::future::Future<Output = Result<T>>,
    {
        let start = Instant::now();
        let result = f().await;
        let duration = start.elapsed().as_millis() as u64;

        let mut labels = HashMap::new();
        labels.insert("operation".to_string(), name.clone());

        let status = if result.is_ok() { "success" } else { "error" };
        labels.insert("status".to_string(), status.to_string());

        self.track_metric(name, duration as f64, labels).await;

        result
    }
}

impl Default for Monitor {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_monitor_creation() {
        let monitor = Monitor::new();
        assert_eq!(monitor.get_metrics().await.len(), 0);
    }

    #[tokio::test]
    async fn test_track_metric() {
        let monitor = Monitor::new();
        monitor.track_metric("test".to_string(), 42.0, HashMap::new()).await;
        assert_eq!(monitor.get_metrics().await.len(), 1);
    }
}
