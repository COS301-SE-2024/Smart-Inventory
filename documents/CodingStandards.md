# Coding Standards

## Table of Contents
[Introduction](#introduction) | [Git Strategy](#git-strategy) | [File Structure](#file-structure) | [Naming Conventions](#naming-conventions) | [Interface Schema](#interface-schema) | [Function Conventions](#function-conventions) | [Code Layout](#code-layout) | [Indentation and Spaces](#indentation-and-spaces) | [Testing and Debugging](#testing-and-debugging) | [Error Handling](#error-handling) | [Comments](#comments) | [Formatting](#formatting)

## Introduction
This document outlines coding standards for our project, aiming to ensure consistency, maintainability, reliability, scalability, efficiency, and collaboration.

## Git Strategy
- Use Git Flow with main branches (`main`, `develop`) and supporting branches (feature, release, hotfix, bugfix).
- Commit messages: `type(scope): description`
- Use Pull Requests for merging, with at least one review.
- Tag releases using semantic versioning.

## File Structure
Monorepo approach with `client`, `server`, `config`, `docs`, and `scripts` directories.

## Naming Conventions
- General: Use descriptive names, camelCase for variables/functions, PascalCase for classes/types, UPPER_CASE for constants.
- Angular: Suffix components with `Component`, services with `Service`, etc.
- DynamoDB: Use snake_case for tables and columns.
- Git: Use kebab-case for branch names.

## Interface Schema
- Use PascalCase for interface names, camelCase for properties.
- Use appropriate data types and descriptive names.

## Function Conventions
- Use camelCase, descriptive names, and follow single responsibility principle.
- Keep functions short (< 100 lines) and document complex ones.
- Use async/await for asynchronous operations.

## Code Layout
- Use consistent indentation (4 spaces for JS/TS).
- Limit line length to 100 characters.
- Use braces for all control structures.
- Organize imports and group related code.

## Indentation and Spaces

| Aspect | JS/TS (Angular) | CSS/SCSS | JSON/YAML |
|--------|-----------------|----------|-----------|
| Indentation | 2 spaces | 2 spaces | 2 spaces |
| Line Length | 80 characters | 80 characters | 80 characters |
| Braces | Same line opening, new line closing | Same as Angular | N/A |

## Testing and Debugging
- Use describe/it blocks for test structure.
- Use Cypress for end-to-end tests.

## Error Handling
- Use try-catch blocks and throw specific exceptions.
- Implement logging and graceful degradation.

## Comments
- Use single-line comments for brief notes, block comments for longer explanations.

## Formatting
- Follow language-specific indentation and spacing rules.
- Use consistent naming conventions and document functions.
- For CSS/SCSS, use BEM methodology and responsive design principles.

## Linting rules
- We use prettier as our code formatter to maintain consistent code styles across our projects
- This configuration ensures:
    - A maximum line width of 120 characters
    - Indentation using 4 spaces (not tabs)
    - Semicolons at the end of statements
    - Single quotes for strings
    - Spaces inside object literal braces
    - Parentheses around arrow function parameters
    - Unix-style line endings (LF)
- By adhering to these formatting rules, we maintain clean, consistent, and readable code across our codebase. All team members should integrate
- this Prettier configuration into their development environment to ensure uniformity in code style.