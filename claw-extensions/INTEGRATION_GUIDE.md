# Integration Guide: claw-core + claw-extensions

**How to combine claw-core (MVP) with claw-extensions (advanced features)**

---

## Overview

This guide explains how to integrate `claw-extensions` with `claw-core` to build production-scale agent systems.

```
claw-core (MVP)         claw-extensions (Advanced)
├── Agent trait     +   ├── Advanced equipment
├── Basic lifecycle     ├── Social coordination
├── Memory equipment    ├── Seed learning
└── Simple REST API     ├── Bot automation
                        ├── WebSocket server
                        ├── GPU acceleration
                        └── Advanced monitoring
```

---

## Installation

### 1. Add Dependencies

```toml
[dependencies]
claw-core = "0.1"
claw-extensions = { version = "0.1", features = ["full"] }
```

### 2. Feature Flags

Enable only the extensions you need:

```toml
# Only equipment and social
claw-extensions = { version = "0.1", features = ["equipment", "social"] }

# All extensions
claw-extensions = { version = "0.1", features = ["full"] }
```

Available features:
- `equipment` - Multi-slot equipment system
- `social` - Multi-agent coordination
- `learning` - Seed learning system
- `bot` - Bot automation
- `websocket` - WebSocket server
- `gpu` - GPU acceleration
- `monitoring` - Advanced monitoring
- `full` - All extensions

---

## Quick Start

### Basic Integration

```rust
use claw_core::{Agent, MinimalAgent, AgentConfig};
use claw_extensions::equipment::EquipmentManager;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 1. Create base agent from claw-core
    let config = AgentConfig {
        id: "my-agent".to_string(),
        cell_ref: "A1".to_string(),
        model: "deepseek-chat".to_string(),
        equipment: vec![],
        config: Default::default(),
    };

    let mut agent = MinimalAgent::new(config);

    // 2. Add extension: Equipment manager
    let mut equipment_mgr = EquipmentManager::new();
    equipment_mgr.equip(
        Box::new(claw_extensions::equipment::memory::HierarchicalMemory::new())
    ).await?;

    // 3. Use the extended agent
    // agent.set_equipment_manager(equipment_mgr);

    Ok(())
}
```

---

## Extension Integration Patterns

### Pattern 1: Composition

Add extensions to your agent by composition:

```rust
use claw_extensions::{
    equipment::EquipmentManager,
    social::SocialManager,
    monitoring::Monitor,
};

struct ExtendedAgent {
    core: claw_core::MinimalAgent,
    equipment: EquipmentManager,
    social: SocialManager,
    monitor: Monitor,
}

impl ExtendedAgent {
    fn new(config: claw_core::AgentConfig) -> Self {
        Self {
            core: claw_core::MinimalAgent::new(config),
            equipment: EquipmentManager::new(),
            social: SocialManager::new(),
            monitor: Monitor::new(),
        }
    }

    async fn process_with_extensions(&mut self, data: serde_json::Value) -> Result<()> {
        // Use equipment
        let mut map = std::collections::HashMap::new();
        map.insert("data".to_string(), data);
        let results = self.equipment.process_all(map).await?;

        // Use monitoring
        self.monitor.track_metric(
            "processing_time".to_string(),
            42.0,
            std::collections::HashMap::new()
        ).await;

        Ok(())
    }
}
```

### Pattern 2: Trait Extension

Extend the core Agent trait:

```rust
use claw_core::Agent;
use claw_extensions::equipment::EquipmentManager;

#[async_trait::trait]
pub trait ExtendedAgent: Agent {
    async fn equip(&mut self, equipment: Box<dyn claw_extensions::equipment::AdvancedEquipment>) -> Result<()>;
    async fn unequip(&mut self, slot: claw_extensions::equipment::EquipmentSlot) -> Result<()>;
}

pub struct MyExtendedAgent {
    core: claw_core::MinimalAgent,
    equipment: EquipmentManager,
}

#[async_trait]
impl Agent for MyExtendedAgent {
    // Delegate to core agent
    fn id(&self) -> &str { self.core.id() }
    fn status(&self) -> &claw_core::AgentStatus { self.core.status() }
    // ... other methods
}

#[async_trait]
impl ExtendedAgent for MyExtendedAgent {
    async fn equip(&mut self, equipment: Box<dyn claw_extensions::equipment::AdvancedEquipment>) -> Result<()> {
        self.equipment.equip(equipment).await
    }

    async fn unequip(&mut self, slot: claw_extensions::equipment::EquipmentSlot) -> Result<()> {
        self.equipment.unequip(slot).await
    }
}
```

### Pattern 3: Wrapper

Wrap the core agent with extensions:

```rust
pub struct AgentWrapper {
    agent: claw_core::MinimalAgent,
    extensions: Vec<Box<dyn Extension>>,
}

#[async_trait]
trait Extension: Send + Sync {
    async fn before_process(&mut self, agent: &mut claw_core::MinimalAgent) -> Result<()>;
    async fn after_process(&mut self, agent: &mut claw_core::MinimalAgent) -> Result<()>;
}

impl AgentWrapper {
    pub async fn process(&mut self, message: claw_core::messages::Message) -> Result<claw_core::agent::ProcessingResult> {
        // Run before hooks
        for ext in &mut self.extensions {
            ext.before_process(&mut self.agent).await?;
        }

        // Process with core agent
        let result = self.agent.process(message).await?;

        // Run after hooks
        for ext in &mut self.extensions {
            ext.after_process(&mut self.agent).await?;
        }

        Ok(result)
    }
}
```

---

## Specific Extension Integrations

### Equipment System

```rust
use claw_extensions::equipment::{
    EquipmentManager, EquipmentSlot,
    memory::HierarchicalMemory,
    reasoning::EscalationEngine,
};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut equipment_mgr = EquipmentManager::new();

    // Equip memory
    equipment_mgr.equip(
        Box::new(HierarchicalMemory::new())
    ).await?;

    // Equip reasoning
    equipment_mgr.equip(
        Box::new(EscalationEngine::new())
    ).await?;

    // Check equipped slots
    let slots = equipment_mgr.equipped_slots().await;
    println!("Equipped: {:?}", slots);

    // Process with all equipment
    let mut data = std::collections::HashMap::new();
    data.insert("test".to_string(), serde_json::json!(42));
    let results = equipment_mgr.process_all(data).await?;

    Ok(())
}
```

### Social Coordination

```rust
use claw_extensions::social::{SocialManager, CoordinationPattern};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut social = SocialManager::new();

    // Create master-slave pattern
    let pattern = CoordinationPattern::MasterSlave {
        master_id: "master".to_string(),
        slave_ids: vec!["slave1".to_string(), "slave2".to_string()],
    };

    social.register_pattern(pattern).await?;

    // Coordinate work
    let mut data = std::collections::HashMap::new();
    data.insert("task".to_string(), serde_json::json!("process"));

    let result = social.coordinate(
        "master",
        claw_extensions::social::CoordinationStrategy::Parallel,
        data
    ).await?;

    Ok(())
}
```

### Seed Learning

```rust
use claw_extensions::learning::{Seed, SeedTrainer, LearningStrategy, TriggerType};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Define a seed
    let trigger = TriggerType::Data {
        source: "sensor".to_string(),
        conditions: vec!["temperature > 50".to_string()],
    };

    let seed = Seed::new(
        "Monitor temperature anomalies",
        trigger,
        LearningStrategy::Reinforcement,
    );

    // Train the seed
    let trainer = SeedTrainer::new();
    let training_data = vec![
        serde_json::json!({"temp": 45, "anomaly": false}),
        serde_json::json!({"temp": 55, "anomaly": true}),
    ];

    let learned = trainer.train(seed, &training_data).await?;
    println!("Learned behavior: {:?}", learned);

    Ok(())
}
```

### Bot Automation

```rust
use claw_extensions::bot::{Bot, BotConfig, LoopType};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create a polling bot
    let config = BotConfig {
        id: "sensor-poller".to_string(),
        name: "Sensor Poller".to_string(),
        loop_type: LoopType::Interval { interval_ms: 5000 },
        config: std::collections::HashMap::new(),
    };

    let bot = Bot::new(config);

    // Register handler
    bot.register_handler(std::sync::Arc::new(|data| {
        Ok(serde_json::json!({"processed": true}))
    })).await;

    // Start bot
    bot.start().await?;

    Ok(())
}
```

### WebSocket Server

```rust
use claw_extensions::websocket::{WebSocketServer, WebSocketConfig};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create WebSocket server
    let config = WebSocketConfig::new("127.0.0.1:8080");
    let ws_server = WebSocketServer::new(config);

    // Get broadcast channel
    let tx = ws_server.broadcast_channel();

    // Broadcast messages
    tokio::spawn(async move {
        let msg = claw_extensions::websocket::WsMessage {
            id: uuid::Uuid::new_v4(),
            msg_type: claw_extensions::websocket::WsMessageType::Broadcast,
            payload: serde_json::json!({"test": "data"}),
            timestamp: chrono::Utc::now(),
        };
        let _ = tx.send(msg);
    });

    // Start server
    ws_server.serve().await?;

    Ok(())
}
```

### GPU Acceleration

```rust
use claw_extensions::gpu::{GpuExecutor, GpuConfig};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create GPU executor
    let config = GpuConfig::CUDA { device_id: 0 };
    let executor = GpuExecutor::new(config)?;

    // Process batch on GPU
    let data = vec![
        serde_json::json!(1),
        serde_json::json!(2),
        serde_json::json!(3),
    ];

    let results = executor.process_batch(data).await?;
    println!("GPU results: {:?}", results);

    // Get GPU info
    let info = executor.gpu_info();
    println!("GPU: {} ({} MB used)", info.backend, info.memory_used);

    Ok(())
}
```

### Advanced Monitoring

```rust
use claw_extensions::monitoring::{Monitor, HealthStatus, CheckResult};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let monitor = Monitor::new();

    // Track metrics
    let mut labels = std::collections::HashMap::new();
    labels.insert("agent".to_string(), "agent1".to_string());

    monitor.track_metric(
        "processing_time".to_string(),
        42.0,
        labels
    ).await;

    // Record health check
    monitor.record_health_check(CheckResult {
        name: "database".to_string(),
        status: HealthStatus::Healthy,
        message: Some("Connected".to_string()),
        duration_ms: 5,
    }).await;

    // Get overall health
    let health = monitor.health_check().await?;
    println!("Health: {:?}", health.status);

    Ok(())
}
```

---

## Best Practices

### 1. Lazy Extension Loading

Load extensions only when needed:

```rust
pub struct LazyAgent {
    core: claw_core::MinimalAgent,
    equipment: Option<EquipmentManager>,
    social: Option<SocialManager>,
}

impl LazyAgent {
    pub async fn get_equipment(&mut self) -> &EquipmentManager {
        if self.equipment.is_none() {
            self.equipment = Some(EquipmentManager::new());
        }
        self.equipment.as_ref().unwrap()
    }
}
```

### 2. Extension Health Checks

Monitor extension health:

```rust
pub async fn check_extensions_health(agent: &ExtendedAgent) -> HealthStatus {
    // Check equipment health
    let equipment_health = /* check equipment */;
    if equipment_health != HealthStatus::Healthy {
        return HealthStatus::Degraded;
    }

    // Check social connections
    let social_health = /* check social */;
    if social_health != HealthStatus::Healthy {
        return HealthStatus::Degraded;
    }

    HealthStatus::Healthy
}
```

### 3. Graceful Degradation

Handle extension failures gracefully:

```rust
pub async fn process_with_fallback(&mut self, data: serde_json::Value) -> Result<serde_json::Value> {
    // Try with equipment
    match self.equipment.process_all(data.clone()).await {
        Ok(results) => Ok(serde_json::json!(results)),
        Err(_) => {
            // Fallback to core processing
            tracing::warn!("Equipment failed, using core processing");
            self.core.process(/* ... */).await
        }
    }
}
```

---

## Testing

### Test with Extensions

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_agent_with_equipment() {
        let mut agent = ExtendedAgent::new(config);
        agent.equip(Box::new(HierarchicalMemory::new())).await.unwrap();
        // Test agent behavior
    }

    #[tokio::test]
    async fn test_social_coordination() {
        let social = SocialManager::new();
        social.register_pattern(pattern).await.unwrap();
        // Test coordination
    }
}
```

---

## Troubleshooting

### Common Issues

**Issue:** Extension not found

**Solution:** Enable the correct feature flag:
```toml
claw-extensions = { version = "0.1", features = ["equipment"] }
```

**Issue:** Version mismatch

**Solution:** Use compatible versions:
```toml
claw-core = "0.1"
claw-extensions = "0.1"
```

**Issue:** Extension fails to load

**Solution:** Check extension initialization:
```rust
let mut equipment_mgr = EquipmentManager::new();
// Verify equipment is properly initialized
```

---

## Performance Tips

1. **Use lazy loading** - Load extensions only when needed
2. **Cache extension instances** - Reuse extension instances
3. **Monitor extension performance** - Use the monitoring extension
4. **Profile before optimizing** - Measure before adding complexity

---

## Next Steps

- Read extension-specific guides in `claw-extensions/docs/`
- Check examples in `claw-extensions/examples/`
- Review API documentation at `https://docs.rs/claw-extensions`

---

**Last Updated:** 2026-03-18
