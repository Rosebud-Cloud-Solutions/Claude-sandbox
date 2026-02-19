# CLAUDE.md

This file provides guidance for AI assistants (Claude Code and similar tools) working in this repository.

## Repository Overview

**Repository:** Rosebud-Cloud-Solutions/Claude-sandbox
**Organization:** Rosebud Cloud Solutions
**Purpose:** Sandbox environment for experimentation, prototyping, and AI-assisted development workflows.

This repository is currently in an early/empty state. It contains only a minimal README and serves as a starting point for development work.

## Current State

- Single tracked file: `README.md`
- No source code, dependencies, build system, or CI/CD pipeline configured yet
- All development conventions below apply as this repository grows

## Git Workflow

### Branch Naming

- AI-generated feature branches follow the pattern: `claude/<task-slug>-<session-id>`
  - Example: `claude/claude-md-mltw5eru7dnkdji2-ATqDG`
- Human-created feature branches should use: `feature/<short-description>`
- Bug fixes: `fix/<short-description>`
- The default/stable branch is `master`

### Commit Conventions

- Write clear, descriptive commit messages in the imperative mood
  - Good: `Add authentication module`
  - Avoid: `Added stuff`, `WIP`, `fix`
- Each commit should represent a single logical change
- Commit messages are signed with SSH keys (configured in this environment)

### Push Workflow

When working as an AI assistant:
1. Develop changes on the designated `claude/` branch
2. Commit with descriptive messages
3. Push with: `git push -u origin <branch-name>`
4. Never push directly to `master` without explicit permission

## Development Guidelines

Since this repository has no established stack yet, follow these general principles when code is added:

### Code Quality

- Prefer simple, readable solutions over clever abstractions
- Avoid over-engineering: build only what is currently needed
- Do not add configuration options or feature flags for hypothetical future needs
- Delete unused code rather than commenting it out

### Security

- Never commit secrets, credentials, API keys, or tokens
- Validate all user/external input at system boundaries
- Follow OWASP Top 10 guidelines when implementing web-facing code
- Use environment variables for configuration that varies by environment

### Testing

- Write tests alongside new functionality when a testing framework is configured
- Prefer unit tests for pure functions and integration tests for API/DB boundaries
- Test files should live in a `tests/` or `__tests__/` directory, or co-located with source using `.test.*` / `.spec.*` suffixes

### Documentation

- Update this `CLAUDE.md` file when significant architectural decisions are made or new workflows are established
- Keep `README.md` up to date with setup and usage instructions

## When Adding a Technology Stack

If this repository evolves to use a specific language or framework, add a section here covering:

1. **Setup commands** — how to install dependencies and run the project locally
2. **Test commands** — how to run the test suite
3. **Lint/format commands** — any linters or formatters in use
4. **Build commands** — how to produce artifacts
5. **Key architecture decisions** — notable design patterns or conventions

### Example Structure (fill in when applicable)

```bash
# Install dependencies
<install command>

# Run tests
<test command>

# Lint
<lint command>

# Build
<build command>
```

## AI Assistant Notes

- Read files before proposing edits to them
- Prefer editing existing files over creating new ones
- Do not create documentation files proactively unless asked
- Avoid adding comments, docstrings, or type annotations to code you did not write
- Keep changes minimal and focused on the stated task
- If unsure about requirements, ask before implementing
