//! Message routing between agents

use crate::social::message::AgentMessage;
use crate::error::Result;

/// Message router
pub struct MessageRouter {
    routes: std::collections::HashMap<String, Vec<String>>,
}

impl MessageRouter {
    pub fn new() -> Self {
        Self {
            routes: std::collections::HashMap::new(),
        }
    }

    pub fn add_route(&mut self, from: String, to: String) {
        self.routes.entry(from).or_insert_with(Vec::new).push(to);
    }

    pub fn route(&self, message: &AgentMessage) -> Result<Vec<String>> {
        self.routes
            .get(&message.from)
            .cloned()
            .ok_or_else(|| crate::error::ExtensionError::RouteNotFound(message.from.clone()))
    }
}

impl Default for MessageRouter {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add_route() {
        let mut router = MessageRouter::new();
        router.add_route("agent1".to_string(), "agent2".to_string());

        assert_eq!(router.routes.len(), 1);
    }
}
