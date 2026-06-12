# Contributing to Birthday Bubu Wishes

First off, thank you for considering contributing to Birthday Bubu Wishes! 🎉

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** and what you expected
- **Include screenshots or animated GIFs** if applicable
- **Include your environment details** (OS, browser, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List some examples** of how it would be used

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** and test thoroughly
4. **Follow the coding style** of the project
5. **Write or update tests** if applicable
6. **Update documentation** as needed
7. **Ensure the test suite passes**: `npm run lint`
8. **Create a pull request** with a clear description

## Development Process

### Setup Development Environment

1. Clone your fork:
   ```bash
   git clone https://github.com/your-username/bubu-wishes.git
   cd bubu-wishes
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy and configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Coding Standards

- **TypeScript**: Use TypeScript for type safety
- **Formatting**: Follow existing code style
- **Comments**: Add comments for complex logic
- **Naming**: Use descriptive variable and function names
- **Components**: Keep components small and focused
- **Hooks**: Follow React hooks best practices

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Examples:
```
Add user profile avatar upload feature
Fix card sharing link generation bug
Update README with deployment instructions
```

### Branch Naming

- `feature/description` - for new features
- `fix/description` - for bug fixes
- `docs/description` - for documentation updates
- `refactor/description` - for code refactoring

## Project Structure

Understanding the project structure will help you contribute effectively:

```
src/
├── components/       # React components
│   ├── pages/       # Page-level components
│   ├── layout/      # Layout components
│   └── ui/          # Reusable UI components
├── server/          # Backend code
│   ├── routes/      # API routes
│   ├── middleware/  # Express middleware
│   └── workers/     # Background workers
├── db/              # Database schema and connection
└── lib/             # Utility functions
```

## Testing

Before submitting a pull request:

1. **Type check**: `npm run lint`
2. **Test manually** in the browser
3. **Check both client and admin flows**
4. **Test on different screen sizes**

## Need Help?

- Check the [README](README.md) for setup instructions
- Review existing [issues](https://github.com/Dipendra2003/bubu-wishes/issues)
- Ask questions in your issue or pull request

## Recognition

Contributors will be recognized in the project README. Thank you for making Birthday Bubu Wishes better! 🙏
