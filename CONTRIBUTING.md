# Contributing to Islakayd

First off, thank you for considering contributing to Islakayd! It's people like you that make Islakayd such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what behavior you expected**
- **Include screenshots if applicable**
- **Note your environment** (OS, browser, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List some examples of how it would be used**

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes**
4. **Add tests** if applicable
5. **Ensure tests pass**: `npm test`
6. **Run linter**: `npm run lint`
7. **Run type checker**: `npm run typecheck`
8. **Commit your changes** using conventional commits
9. **Push to your fork** and submit a pull request

#### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```
feat: add new booking feature
fix: resolve payment processing bug
docs: update README
style: format code
refactor: restructure auth service
test: add booking tests
chore: update dependencies
```

#### Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Update documentation for any changed functionality
- Add tests for new features
- Ensure all tests pass
- Keep commits atomic and well-described
- Link related issues in the PR description

## Development Process

### Setting Up Your Development Environment

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/islakaydpro.git
cd islakaydpro

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Project Structure

```
src/
├── components/     # React components
├── contexts/       # React contexts
├── hooks/          # Custom hooks
├── lib/            # External integrations
├── services/       # Business logic
├── types/          # TypeScript types
├── utils/          # Utility functions
└── __tests__/      # Test files
```

### Testing

We use Vitest for testing. Run tests with:

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Generate coverage report
npm run test:coverage
```

### Code Style

- We use ESLint for linting
- TypeScript strict mode is enabled
- Follow existing code patterns
- Write meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Database Changes

If your contribution requires database changes:

1. Create a new migration file in `supabase/migrations/`
2. Use the format: `YYYYMMDDHHMMSS_description.sql`
3. Include both the schema changes and RLS policies
4. Test thoroughly with local Supabase instance

## Documentation

- Update README.md for user-facing changes
- Update inline code comments for complex logic
- Add JSDoc comments for new functions
- Update type definitions as needed

## Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

## Recognition

Contributors will be recognized in our README and release notes.

Thank you for contributing! 🎉
