# Contributing to Claw Extensions

Thank you for your interest in contributing to claw-extensions!

## Development Setup

```bash
# Clone repository
git clone https://github.com/SuperInstance/claw-extensions.git
cd claw-extensions

# Install dependencies
cargo fetch

# Run development build
cargo build --all-features

# Run tests
cargo test --all-features

# Run with coverage
cargo tarpaulin --all-features --out Html
```

## Code Style

- Use `cargo fmt` for formatting
- Use `cargo clippy` for linting
- Follow Rust naming conventions
- Add tests for new features
- Update documentation

## Adding Extensions

1. Create new module in `extensions/`
2. Implement extension traits
3. Add feature flag to `Cargo.toml`
4. Add tests
5. Update documentation

## Pull Requests

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Update documentation
6. Submit PR

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
