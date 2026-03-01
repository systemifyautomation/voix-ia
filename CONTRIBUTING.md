# Contributing to Voix-IA

Thank you for your interest in contributing to Voix-IA! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Setup Development Environment

1. Fork the repository on GitHub

2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/voix-ia.git
   cd voix-ia
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/systemifyautomation/voix-ia.git
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Create `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

6. Run tests to verify setup:
   ```bash
   npm test
   ```

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update tests as needed

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run linter
npm run lint

# Build TypeScript
npm run build

# Run in development mode
npm run dev
```

### 4. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "Add feature: description of what you added"
```

Commit message format:
```
<type>: <short description>

<longer description if needed>

<reference to issue if applicable>
```

Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test updates
- `chore:` - Build/config changes

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Provide explicit types for function parameters and returns
- Use interfaces for object shapes
- Avoid `any` type when possible

**Good:**
```typescript
interface User {
  name: string;
  age: number;
}

function greetUser(user: User): string {
  return `Hello, ${user.name}!`;
}
```

**Bad:**
```typescript
function greetUser(user: any) {
  return `Hello, ${user.name}!`;
}
```

### Naming Conventions

- **Classes**: PascalCase (`ReservationService`)
- **Functions/Methods**: camelCase (`createReservation`)
- **Variables**: camelCase (`phoneNumber`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_PARTY_SIZE`)
- **Interfaces**: PascalCase with 'I' prefix optional (`Reservation` or `IReservation`)
- **Private members**: Prefix with `_` (`_internalMethod`)

### File Organization

```
src/
├── controllers/     # HTTP request handlers
├── services/        # Business logic
├── models/          # Data models and interfaces
├── utils/           # Helper functions
└── __tests__/       # Test files
```

### Comments

- Use JSDoc for public APIs
- Explain "why" not "what"
- Keep comments up to date

**Good:**
```typescript
/**
 * Check availability for a specific date and time.
 * Uses a simple capacity model: max party size × 3
 */
checkAvailability(date: string, time: string, partySize: number): boolean {
  // Implementation
}
```

### Error Handling

- Always handle errors gracefully
- Log errors with context
- Return meaningful error messages

```typescript
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  throw new Error('Failed to complete operation');
}
```

## Testing Guidelines

### Writing Tests

- Test file naming: `*.test.ts`
- One test file per source file
- Use descriptive test names

```typescript
describe('ReservationService', () => {
  describe('createReservation', () => {
    it('should create a reservation with valid data', () => {
      // Test implementation
    });

    it('should throw error with invalid data', () => {
      // Test implementation
    });
  });
});
```

### Test Coverage

- Aim for >80% code coverage
- Test happy paths and error cases
- Test edge cases

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Pull Request Guidelines

### Before Submitting

- [ ] Tests pass (`npm test`)
- [ ] Linter passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Code is documented
- [ ] Commit messages are clear
- [ ] Branch is up to date with main

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How have you tested this?

## Checklist
- [ ] Tests pass
- [ ] Linter passes
- [ ] Documentation updated
- [ ] Breaking changes documented
```

### Review Process

1. Automated checks run (tests, linting)
2. Code review by maintainers
3. Address feedback
4. Approval and merge

## Adding New Features

### 1. Plan Your Feature

- Open an issue to discuss the feature
- Get feedback from maintainers
- Design the API/interface

### 2. Implement

- Follow existing patterns
- Keep changes focused
- Add tests

### 3. Document

- Update README if needed
- Add API documentation
- Include usage examples

## Reporting Bugs

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. ...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS:
- Node version:
- npm version:

## Additional Context
Any other relevant information
```

## Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How would this feature work?

## Alternatives Considered
What other approaches did you consider?
```

## Project Structure

```
voix-ia/
├── src/
│   ├── controllers/          # HTTP controllers
│   │   ├── VoiceController.ts
│   │   └── ReservationController.ts
│   ├── services/             # Business logic services
│   │   ├── AIService.ts
│   │   ├── TwilioService.ts
│   │   └── ReservationService.ts
│   ├── models/               # Data models
│   │   └── Reservation.ts
│   ├── utils/                # Utilities
│   │   └── helpers.ts
│   ├── __tests__/            # Tests
│   │   └── *.test.ts
│   └── index.ts              # Application entry
├── dist/                     # Compiled JavaScript (git-ignored)
├── node_modules/             # Dependencies (git-ignored)
├── .env                      # Environment variables (git-ignored)
├── .env.example              # Environment template
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── jest.config.js
├── README.md
├── ARCHITECTURE.md
├── DEPLOYMENT.md
├── API_EXAMPLES.md
└── CONTRIBUTING.md
```

## Common Tasks

### Adding a New Service

1. Create file in `src/services/`
2. Export class with clear interface
3. Add tests in `src/__tests__/`
4. Update documentation

### Adding a New API Endpoint

1. Add method to controller
2. Register route in `src/index.ts`
3. Add tests
4. Update API_EXAMPLES.md

### Adding Database Support

1. Create database client service
2. Update ReservationService to use database
3. Add migration scripts
4. Update documentation

## Resources

### Documentation

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Twilio Voice API](https://www.twilio.com/docs/voice)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

### Tools

- [VS Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/) - API testing
- [ngrok](https://ngrok.com/) - Local webhook testing

## Getting Help

- Open an issue on GitHub
- Ask in discussions
- Check existing issues and PRs

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes
- README (for significant contributions)

Thank you for contributing to Voix-IA! 🎉
