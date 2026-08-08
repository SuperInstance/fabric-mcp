//! Bot automation system for simple loops without ML models
//!
//! Bots are minimal automation loops that don't require ML models.
//! They're faster and simpler than full agents for basic tasks.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use tokio::time::{interval, Duration};

use crate::error::{ExtensionError, Result};

/// Bot configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BotConfig {
    pub id: String,
    pub name: String,
    pub loop_type: LoopType,
    pub config: HashMap<String, serde_json::Value>,
}

/// Loop types for bots
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(tag = "type")]
pub enum LoopType {
    /// Interval-based polling
    Interval { interval_ms: u64 },
    /// Event-driven
    Event { event_source: String },
    /// Scheduled (cron-like)
    Scheduled { cron_expression: String },
    /// One-shot
    OneShot,
}

/// Bot state
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum BotState {
    Idle,
    Running,
    Paused,
    Stopped,
    Error(String),
}

/// Bot automation loop
pub struct Bot {
    id: String,
    name: String,
    loop_type: LoopType,
    state: Arc<RwLock<BotState>>,
    handlers: Arc<RwLock<Vec<BotHandler>>>,
    config: HashMap<String, serde_json::Value>,
}

/// Bot handler function type
pub type BotHandler = Arc<dyn Fn(serde_json::Value) -> Result<serde_json::Value> + Send + Sync>;

impl Bot {
    /// Create a new bot
    pub fn new(config: BotConfig) -> Self {
        Self {
            id: config.id,
            name: config.name,
            loop_type: config.loop_type,
            state: Arc::new(RwLock::new(BotState::Idle)),
            handlers: Arc::new(RwLock::new(Vec::new())),
            config: config.config,
        }
    }

    /// Get bot ID
    pub fn id(&self) -> &str {
        &self.id
    }

    /// Get bot name
    pub fn name(&self) -> &str {
        &self.name
    }

    /// Get bot state
    pub async fn state(&self) -> BotState {
        self.state.read().await.clone()
    }

    /// Register a handler
    pub async fn register_handler(&self, handler: BotHandler) {
        let mut handlers = self.handlers.write().await;
        handlers.push(handler);
    }

    /// Start the bot
    pub async fn start(&self) -> Result<()> {
        let mut state = self.state.write().await;
        *state = BotState::Running;
        drop(state);

        match &self.loop_type {
            LoopType::Interval { interval_ms } => {
                self.start_interval_loop(*interval_ms).await?;
            }
            LoopType::Event { event_source } => {
                self.start_event_loop(event_source).await?;
            }
            LoopType::Scheduled { cron_expression } => {
                self.start_scheduled_loop(cron_expression).await?;
            }
            LoopType::OneShot => {
                self.run_once().await?;
            }
        }

        Ok(())
    }

    /// Pause the bot
    pub async fn pause(&self) -> Result<()> {
        let mut state = self.state.write().await;
        *state = BotState::Paused;
        Ok(())
    }

    /// Stop the bot
    pub async fn stop(&self) -> Result<()> {
        let mut state = self.state.write().await;
        *state = BotState::Stopped;
        Ok(())
    }

    /// Internal interval loop
    async fn start_interval_loop(&self, interval_ms: u64) -> Result<()> {
        let handlers = self.handlers.clone();
        let state = self.state.clone();
        let config = self.config.clone();

        tokio::spawn(async move {
            let mut timer = interval(Duration::from_millis(interval_ms));

            loop {
                timer.tick().await;

                // Check if still running
                {
                    let current_state = state.read().await;
                    if *current_state != BotState::Running {
                        continue;
                    }
                }

                // Execute handlers
                let current_handlers = handlers.read().await;
                for handler in current_handlers.iter() {
                    let data = serde_json::to_value(&config).unwrap_or_default();
                    if let Err(e) = handler(data) {
                        tracing::error!("Bot handler error: {}", e);
                    }
                }
            }
        });

        Ok(())
    }

    /// Internal event loop
    async fn start_event_loop(&self, event_source: &str) -> Result<()> {
        tracing::info!("Starting event loop for source: {}", event_source);
        // Event loop implementation would go here
        Ok(())
    }

    /// Internal scheduled loop
    async fn start_scheduled_loop(&self, cron_expression: &str) -> Result<()> {
        tracing::info!("Starting scheduled loop with cron: {}", cron_expression);
        // Scheduled loop implementation would go here
        Ok(())
    }

    /// Run once
    async fn run_once(&self) -> Result<()> {
        let handlers = self.handlers.read().await;
        let config = self.config.clone();

        for handler in handlers.iter() {
            let data = serde_json::to_value(&config).unwrap_or_default();
            handler(data)?;
        }

        let mut state = self.state.write().await;
        *state = BotState::Stopped;

        Ok(())
    }
}

/// Bot manager for managing multiple bots
pub struct BotManager {
    bots: Arc<RwLock<HashMap<String, Bot>>>,
}

impl BotManager {
    pub fn new() -> Self {
        Self {
            bots: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn add_bot(&self, bot: Bot) -> Result<()> {
        let mut bots = self.bots.write().await;
        bots.insert(bot.id().to_string(), bot);
        Ok(())
    }

    pub async fn get_bot(&self, id: &str) -> Option<Bot> {
        let bots = self.bots.read().await;
        // Note: This is simplified - actual implementation would need cloning
        None
    }

    pub async fn start_bot(&self, id: &str) -> Result<()> {
        let bots = self.bots.read().await;
        if let Some(bot) = bots.get(id) {
            bot.start().await?;
        }
        Ok(())
    }

    pub async fn stop_bot(&self, id: &str) -> Result<()> {
        let bots = self.bots.read().await;
        if let Some(bot) = bots.get(id) {
            bot.stop().await?;
        }
        Ok(())
    }

    pub async fn list_bots(&self) -> Vec<String> {
        let bots = self.bots.read().await;
        bots.keys().cloned().collect()
    }
}

impl Default for BotManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_bot_creation() {
        let config = BotConfig {
            id: "test-bot".to_string(),
            name: "Test Bot".to_string(),
            loop_type: LoopType::Interval { interval_ms: 1000 },
            config: HashMap::new(),
        };

        let bot = Bot::new(config);
        assert_eq!(bot.id(), "test-bot");
        assert_eq!(bot.name(), "Test Bot");
    }

    #[tokio::test]
    async fn test_bot_manager() {
        let manager = BotManager::new();
        assert_eq!(manager.list_bots().await.len(), 0);
    }
}
