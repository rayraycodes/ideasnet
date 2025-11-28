# Contributing to Ideas.net

Thank you for your interest in contributing to Ideas.net! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/YOUR_GITHUB/ideas.net/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check existing feature requests
2. Create a new issue with:
   - Clear description of the feature
   - Use case and benefits
   - Potential implementation approach (if you have ideas)

### Contributing Code

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes:**
   - Follow the existing code style
   - Write clear, self-documenting code
   - Add comments for complex logic
   - Update documentation as needed

4. **Test your changes:**
   ```bash
   npm run lint
   npm test
   ```

5. **Commit your changes:**
   ```bash
   git commit -m "Add: descriptive commit message"
   ```
   Use conventional commit messages:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for updates to existing features
   - `Refactor:` for code refactoring
   - `Docs:` for documentation changes

6. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request:**
   - Provide a clear description
   - Reference related issues
   - Include screenshots for UI changes

## Development Setup

See [SETUP.md](SETUP.md) for detailed setup instructions.

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use meaningful variable and function names

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in objects/arrays
- Use semicolons
- Maximum line length: 100 characters

### React Components

- Use functional components with hooks
- Extract reusable logic into custom hooks
- Keep components small and focused
- Use TypeScript interfaces for props

### Backend Routes

- Follow RESTful conventions
- Validate all inputs
- Handle errors gracefully
- Return consistent response formats
- Add proper error logging

## Testing

- Write tests for new features
- Ensure all tests pass before submitting
- Aim for meaningful test coverage

## Documentation

- Update README.md for user-facing changes
- Update ARCHITECTURE.md for architectural changes
- Add JSDoc comments for public functions
- Keep code comments up to date

## Pull Request Process

1. Ensure your code follows the coding standards
2. All tests must pass
3. Code must be linted (`npm run lint`)
4. Update documentation as needed
5. Request review from maintainers
6. Address review feedback
7. Once approved, maintainers will merge

## Areas for Contribution

### High Priority

- Bug fixes
- Performance improvements
- Security enhancements
- Documentation improvements

### Feature Ideas

- AI-powered features (summaries, validation)
- Advanced search and filtering
- Analytics dashboard
- Mobile app (React Native)
- Email notifications
- Social features (sharing, following)

### Code Quality

- Test coverage improvements
- Code refactoring
- Performance optimization
- Accessibility improvements

## Questions?

- Open a [Discussion](https://github.com/YOUR_GITHUB/ideas.net/discussions)
- Check existing issues and discussions
- Reach out to maintainers

Thank you for contributing to Ideas.net! 🚀

