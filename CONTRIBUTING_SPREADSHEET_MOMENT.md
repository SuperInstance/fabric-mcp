# Contributing to Spreadsheet Moment

Thank you for your interest in contributing to Spreadsheet Moment! We welcome contributions from everyone, and we appreciate your help in making this project better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) in all your interactions with the project.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**
```markdown
### Description
A clear and concise description of what the bug is.

### Reproduction Steps
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

### Expected Behavior
A clear and concise description of what you expected to happen.

### Screenshots
If applicable, add screenshots to help explain your problem.

### Environment
- OS: [e.g. Ubuntu 22.04]
- Version: [e.g. 1.0.0]
- Hardware: [e.g. NVIDIA RTX 4090]

### Additional Context
Add any other context about the problem here.
```

### Suggesting Enhancements

We love feature suggestions! Please provide:

1. **Use Case**: Describe the problem you're trying to solve
2. **Proposed Solution**: How you envision the feature working
3. **Alternatives**: Any alternative solutions you've considered
4. **Impact**: How this would benefit users

### Pull Requests

We actively welcome pull requests! Here's how to contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Ensure tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

See [Pull Request Process](#pull-request-process) for more details.

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Rust toolchain (for desktop app)
- Python 3.11+ (for AI/ML components)
- Git

### Initial Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/spreadsheet-moment.git
cd spreadsheet-moment

# Install dependencies
npm install

# Setup git hooks (optional but recommended)
npm run setup:githooks

# Run tests
npm test

# Start development server
npm run dev
```

### Project Structure

```
spreadsheet-moment/
├── desktop/              # Tauri desktop application
│   ├── src/             # React frontend
│   └── src-tauri/       # Rust backend
├── workers/             # Cloudflare Workers API
│   └── src/            # TypeScript API code
├── research/           # Research prototypes
├── deployment/         # Infrastructure as code
├── docs/              # Documentation
└── tests/             # Test files
```

## Pull Request Process

### 1. Before You Start

- Check existing [issues](https://github.com/SuperInstance/spreadsheet-moment/issues) and [PRs](https://github.com/SuperInstance/spreadsheet-moment/pulls)
- Discuss large changes in an issue first
- Ensure your change aligns with project goals

### 2. Making Changes

1. **Create a branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes** following our [coding standards](#coding-standards)

3. **Write tests** for your changes (see [Testing Guidelines](#testing-guidelines))

4. **Update documentation** if needed

5. **Run tests** and ensure they pass
   ```bash
   npm test
   npm run lint
   ```

### 3. Submitting Your PR

1. **Update your branch** with latest main
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your changes**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request** with our [PR template](.github/pull_request_template.md)

4. **Wait for review** - We'll respond within 48 hours

### 4. After Review

- Address review comments
- Make requested changes
- Push updates to your branch
- Request review again when ready

### PR Review Criteria

- **Code Quality**: Clean, readable, well-commented code
- **Tests**: Comprehensive test coverage
- **Documentation**: Updated docs for user-facing changes
- **Performance**: No significant performance regressions
- **Style**: Consistent with project style

## Coding Standards

### TypeScript/JavaScript

```typescript
// Use meaningful variable names
const userInputCount = 10;  // Good
const n = 10;  // Bad

// Use const/let appropriately
const API_URL = 'https://api.example.com';  // Immutable
let currentPage = 1;  // Mutable

// Use arrow functions for callbacks
array.forEach((item) => {  // Good
  console.log(item);
});

// Use async/await over promises
async function fetchData() {  // Good
  const data = await fetch(url);
  return data.json();
}

// Add JSDoc comments for functions
/**
 * Calculates the sum of two numbers
 * @param a - First number
 * @param b - Second number
 * @returns Sum of a and b
 */
function add(a: number, b: number): number {
  return a + b;
}
```

### Rust

```rust
// Use meaningful names
fn calculate_user_count(users: &[User]) -> usize {  // Good
fn count(u: &[User]) -> usize {  // Bad

// Use Result for error handling
fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("Cannot divide by zero".to_string())
    } else {
        Ok(a / b)
    }
}

// Add documentation comments
/// Performs matrix multiplication on two 2D arrays
///
/// # Arguments
/// * `a` - First matrix (m x k)
/// * `b` - Second matrix (k x n)
///
/// # Returns
/// Result matrix (m x n) or error if dimensions don't match
///
/// # Examples
/// ```
/// let result = matmul(&a, &b)?;
/// ```
fn matmul(a: &Vec<Vec<f64>>, b: &Vec<Vec<f64>>) -> Result<Vec<Vec<f64>>, String> {
    // ...
}
```

### File Naming

- **Components**: PascalCase (e.g., `TensorGrid.tsx`)
- **Utilities**: camelCase (e.g., `tensorUtils.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_CONSTANTS.ts`)
- **Tests**: *.test.ts or *.spec.ts

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

**Examples:**
```bash
feat(tensor): add einsum operation for tensor contraction
fix(nlp): resolve issue with multi-turn conversation context
docs(readme): update installation instructions for Ubuntu
perf(matmul): optimize matrix multiplication for large tensors
test(collaboration): add tests for CRDT merge operations
```

## Testing Guidelines

### Test Structure

```typescript
// tests/unit/tensorEngine.test.ts
import { TensorEngine } from '../src/tensorEngine';

describe('TensorEngine', () => {
  let engine: TensorEngine;

  beforeEach(() => {
    engine = new TensorEngine();
  });

  describe('matmul', () => {
    it('should multiply two matrices correctly', () => {
      const a = new Float32Array([1, 2, 3, 4]);
      const b = new Float32Array([5, 6, 7, 8]);
      const result = engine.matmul([2, 2], a, [2, 2], b);

      expect(result.data).toEqual(new Float32Array([19, 22, 43, 50]));
    });

    it('should throw on shape mismatch', () => {
      expect(() => {
        engine.matmul([2, 3], new Float32Array(6), [2, 2], new Float32Array(4));
      }).toThrow('Shape mismatch');
    });
  });
});
```

### Test Coverage

- Aim for **80%+ code coverage**
- Test edge cases and error conditions
- Mock external dependencies
- Use descriptive test names

### Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# With coverage
npm run test:coverage

# Watch mode (development)
npm run test:watch
```

## Documentation

### Code Comments

- Document complex algorithms
- Explain non-obvious implementations
- Add examples for public APIs
- Keep comments up to date

### README Sections

When adding significant features, update relevant README sections:
- Feature overview
- Installation instructions
- Usage examples
- API reference links

### API Documentation

For public APIs, include:
- Function description
- Parameter descriptions
- Return value description
- Usage examples
- Error conditions

## Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discord**: For real-time help and discussion
- **Email**: team@superinstance.ai

## Recognition

Contributors will be:
- Listed in [CONTRIBUTORS.md](CONTRIBUTORS.md)
- Acknowledged in release notes
- Eligible for contributor badges
- Featured in monthly spotlights

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for contributing to Spreadsheet Moment! 🎉
