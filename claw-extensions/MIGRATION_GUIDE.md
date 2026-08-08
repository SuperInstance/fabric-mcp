# Migration Guide: From claw-full to claw-core + claw-extensions

**For users upgrading from the monolithic claw to the split architecture**

---

## Overview

The claw project has been split into two repositories:

- **claw-core**: Minimal MVP (<5,000 LOC) - essential features only
- **claw-extensions**: Advanced features - optional extensions for production

This guide helps you migrate from the old monolithic claw to the new split architecture.

---

## What Changed?

### Removed from claw-core

The following features have been extracted to `claw-extensions`:

| Feature | claw-core | claw-extensions |
|---------|-----------|-----------------|
| **Equipment Slots** | 1 (Memory) | 6 (Memory, Reasoning, Consensus, Spreadsheet, Distillation, Coordination) |
| **Social Coordination** | ❌ | ✅ (Master-slave, Co-worker, etc.) |
| **Seed Learning** | ❌ | ✅ (Training, distillation) |
| **Bot System** | ❌ | ✅ (Automation loops) |
| **WebSocket Server** | ❌ | ✅ (Real-time communication) |
| **GPU Acceleration** | ❌ | ✅ (CUDA/WGPU) |
| **Advanced Monitoring** | ❌ | ✅ (Metrics, telemetry) |

### Kept in claw-core

- Basic Agent trait and MinimalAgent
- Agent lifecycle (create, start, stop, delete)
- Single Memory equipment slot
- Simple REST API (5 endpoints)
- Basic trigger processing

---

## Migration Steps

### Step 1: Update Dependencies

**Before (monolithic claw):**
```toml
[dependencies]
claw = "0.1"
```

**After (split architecture):**
```toml
[dependencies]
claw-core = "0.1"
claw-extensions = { version = "0.1", features = ["full"] }
```

### Step 2: Update Imports

**Before:**
```rust
use claw::{
    Agent, MinimalAgent, AgentConfig,
    EquipmentManager, SocialManager, SeedTrainer
};
```

**After:**
```rust
use claw_core::{Agent, MinimalAgent, AgentConfig};
use claw_extensions::{
    equipment::EquipmentManager,
    social::SocialManager,
    learning::SeedTrainer,
};
```

### Step 3: Update Equipment Usage

**Before (6 slots):**
```rust
let mut manager = EquipmentManager::new();
manager.equip(EquipmentSlot::Memory, memory).await?;
manager.equip(EquipmentSlot::Reasoning, reasoning).await?;
manager.equip(EquipmentSlot::Consensus, consensus).await?;
```

**After (1 slot in core, 6 in extensions):**
```rust
// Core: Only Memory
let mut agent = MinimalAgent::new(config);
agent.equip_memory(Box::new(SimpleMemoryEquipment::new())).await?;

// Extensions: All 6 slots
use claw_extensions::equipment::EquipmentManager;
let mut manager = EquipmentManager::new();
manager.equip(Box::new(HierarchicalMemory::new())).await?;
manager.equip(Box::new(EscalationEngine::new())).await?;
manager.equip(Box::new(TripartiteConsensus::new())).await?;
```

### Step 4: Update Social Coordination

**Before:**
```rust
use claw::social::SocialManager;
let mut social = SocialManager::new();
```

**After:**
```rust
use claw_extensions::social::SocialManager;
let mut social = SocialManager::new();
```

### Step 5: Update Seed Learning

**Before:**
```rust
use claw::learning::{Seed, SeedTrainer};
```

**After:**
```rust
use claw_extensions::learning::{Seed, SeedTrainer};
```

### Step 6: Update Bot System

**Before:**
```rust
use claw::bot::{Bot, BotConfig};
```

**After:**
```rust
use claw_extensions::bot::{Bot, BotConfig};
```

### Step 7: Update WebSocket

**Before:**
```rust
use claw::websocket::WebSocketServer;
```

**After:**
```rust
use claw_extensions::websocket::WebSocketServer;
```

### Step 8: Update GPU Code

**Before:**
```rust
use claw::gpu::GpuExecutor;
```

**After:**
```rust
use claw_extensions::gpu::GpuExecutor;
```

### Step 9: Update Monitoring

**Before:**
```rust
use claw::monitoring::Monitor;
```

**After:**
```rust
use claw_extensions::monitoring::Monitor;
```

---

## Code Examples

### Example 1: Basic Agent (No Extensions)

**Before:**
```rust
use claw::{Agent, MinimalAgent, AgentConfig};

let config = AgentConfig {
    id: "my-agent".to_string(),
    cell_ref: "A1".to_string(),
    model: "deepseek-chat".to_string(),
    equipment: vec![EquipmentSlot::Memory],
    config: Default::default(),
};

let mut agent = MinimalAgent::new(config);
```

**After:**
```rust
use claw_core::{Agent, MinimalAgent, AgentConfig};

let config = AgentConfig {
    id: "my-agent".to_string(),
    cell_ref: "A1".to_string(),
    model: "deepseek-chat".to_string(),
    equipment: vec![],
    config: Default::default(),
};

let mut agent = MinimalAgent::new(config);
```

### Example 2: Agent with Equipment

**Before:**
```rust
use claw::{Agent, MinimalAgent, AgentConfig, EquipmentManager};

let mut agent = MinimalAgent::new(config);
let mut manager = EquipmentManager::new();
manager.equip(EquipmentSlot::Reasoning, reasoning).await?;
```

**After:**
```rust
use claw_core::{Agent, MinimalAgent, AgentConfig};
use claw_extensions::equipment::EquipmentManager;

let mut agent = MinimalAgent::new(config);
let mut manager = EquipmentManager::new();
manager.equip(Box::new(EscalationEngine::new())).await?;
```

### Example 3: Full-Featured Agent

**Before:**
```rust
use claw::{
    Agent, MinimalAgent, AgentConfig,
    EquipmentManager, SocialManager, SeedTrainer,
    WebSocketServer, Monitor
};

let mut agent = MinimalAgent::new(config);
let mut equipment = EquipmentManager::new();
let mut social = SocialManager::new();
let mut ws = WebSocketServer::new(config);
let monitor = Monitor::new();
```

**After:**
```rust
use claw_core::{Agent, MinimalAgent, AgentConfig};
use claw_extensions::{
    equipment::EquipmentManager,
    social::SocialManager,
    learning::SeedTrainer,
    websocket::WebSocketServer,
    monitoring::Monitor,
};

let mut agent = MinimalAgent::new(config);
let mut equipment = EquipmentManager::new();
let mut social = SocialManager::new();
let mut ws = WebSocketServer::new(config);
let monitor = Monitor::new();
```

---

## API Changes

### Equipment Slots

**Before:**
```rust
pub enum EquipmentSlot {
    Memory,
    Reasoning,
    Consensus,
    Spreadsheet,
    Distillation,
    Coordination,
}
```

**After (core):**
```rust
pub enum EquipmentSlot {
    Memory, // Only one slot
}
```

**After (extensions):**
```rust
pub enum EquipmentSlot {
    Memory,
    Reasoning,
    Consensus,
    Spreadsheet,
    Distillation,
    Coordination,
}
```

### Agent Config

**Before:**
```rust
pub struct AgentConfig {
    pub id: String,
    pub cell_ref: String,
    pub model: String,
    pub equipment: Vec<EquipmentSlot>, // 6 slots
    pub config: HashMap<String, serde_json::Value>,
}
```

**After:**
```rust
pub struct AgentConfig {
    pub id: String,
    pub cell_ref: String,
    pub model: String,
    pub equipment: Vec<EquipmentSlot>, // 1 slot (Memory)
    pub config: HashMap<String, serde_json::Value>,
}
```

---

## Feature Flags

If you were using the monolithic claw, you might have had all features enabled by default. Now you need to explicitly enable extensions:

```toml
# Enable all extensions
claw-extensions = { version = "0.1", features = ["full"] }

# Enable specific extensions
claw-extensions = { version = "0.1", features = ["equipment", "social"] }

# Enable minimal (no extensions)
claw-extensions = "0.1"
```

---

## Testing Your Migration

### 1. Update Tests

**Before:**
```rust
use claw::{Agent, MinimalAgent};

#[test]
fn test_agent() {
    let agent = MinimalAgent::new(config);
    assert_eq!(agent.id(), "test");
}
```

**After:**
```rust
use claw_core::{Agent, MinimalAgent};

#[test]
fn test_agent() {
    let agent = MinimalAgent::new(config);
    assert_eq!(agent.id(), "test");
}
```

### 2. Run Tests

```bash
# Test core
cargo test --package claw-core

# Test extensions
cargo test --package claw-extensions --all-features
```

### 3. Verify Functionality

Create a simple test to verify your migration:

```rust
#[tokio::test]
async fn test_migration() {
    // Test core agent
    let config = AgentConfig {
        id: "test".to_string(),
        cell_ref: "A1".to_string(),
        model: "test".to_string(),
        equipment: vec![],
        config: Default::default(),
    };

    let agent = MinimalAgent::new(config);
    assert_eq!(agent.id(), "test");

    // Test equipment extension
    #[cfg(feature = "equipment")]
    {
        use claw_extensions::equipment::EquipmentManager;
        let mut manager = EquipmentManager::new();
        assert_eq!(manager.equipped_slots().await.len(), 0);
    }
}
```

---

## Rollback Plan

If you encounter issues during migration:

1. **Revert to monolithic claw:**
   ```toml
   [dependencies]
   claw = "0.1"  # Old version
   ```

2. **Report issues:**
   - GitHub: https://github.com/SuperInstance/claw-extensions/issues
   - Include error messages and code samples

3. **Get help:**
   - Documentation: https://docs.rs/claw-extensions
   - Examples: https://github.com/SuperInstance/claw-extensions/tree/main/examples

---

## Benefits of Migration

Despite the migration effort, the split architecture provides:

1. **Smaller core** - Faster builds, easier to understand
2. **Modular extensions** - Use only what you need
3. **Better testing** - Each extension tested independently
4. **Flexible deployment** - Deploy with/without extensions
5. **Clear separation** - Core vs. advanced features

---

## Need Help?

- **Integration Guide:** See `INTEGRATION_GUIDE.md`
- **API Documentation:** https://docs.rs/claw-extensions
- **Examples:** https://github.com/SuperInstance/claw-extensions/tree/main/examples
- **Issues:** https://github.com/SuperInstance/claw-extensions/issues

---

**Last Updated:** 2026-03-18
