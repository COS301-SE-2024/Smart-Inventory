# Testing Manual for Smart Inventory Web App

## Index
1. [Introduction](#introduction)
2. [Types of Tests](#types-of-tests)
3. [Test Tools](#test-tools)
4. [Quality Assurance Requirements](#quality-assurance-requirements)
5. [Testing Processes](#testing-processes)
   - [Unit Tests](#unit-tests-cypress)
   - [Component Tests](#component-tests-cypress)
   - [End-to-End (E2E) Tests](#end-to-end-e2e-tests-cypress)
   - [API Tests](#api-tests-postman)
   - [AWS-specific Testing](#aws-specific-testing)

## Introduction

We'll use Postman for API testing and Cypress for unit, component, and end-to-end (E2E) testing.

## Types of Tests

1. **Unit Tests**: Test individual components in isolation for reliability and usability.
2. **Component Tests**: Verify isolated components function correctly, addressing reliability and usability.
3. **End-to-End (E2E) Tests**: Simulate real user scenarios, validating entire application workflow for reliability, usability, security, and privacy.
4. **API Tests**: Verify the functionality of AWS backend services.

**Test Coverage Goal**: Minimum 75%

## Test Tools

### Cypress
- For unit, component, integration, and E2E testing
- Tests directly in browser environment
- Creates automated test scripts

### Postman
- Simulates HTTP requests to API endpoints
- Tests API functionality and validates responses
- Manages environments & collections
- Automates API test scripts

## Quality Assurance Requirements

- **Reliability**: Ensured by all test types. Unit and component tests verify individual parts, E2E tests uncover real-world errors.
- **Usability**: Primarily addressed by E2E tests simulating user workflows. Unit and component tests contribute by ensuring expected functionality.
- **Efficiency**: Improved through automated testing in both Cypress and Postman.
- **Maintainability**: Enhanced by well-documented tests, serving as code documentation.
- **Scalability**: E2E tests help identify performance bottlenecks early, ensuring design accommodates future growth.

## Testing Processes

### Unit Tests (Cypress):
1. Use Cypress for unit testing
2. Write tests for individual functions and methods
3. Mock dependencies and external services
4. Run tests with `npx cypress run --component`
5. Aim for >80% code coverage

### Component Tests (Cypress):
1. Use Cypress Component Testing
2. Mount individual components in isolation
3. Interact with component using Cypress commands
4. Assert expected behavior and DOM changes
5. Run with `npx cypress run --component`

### End-to-End (E2E) Tests (Cypress):
1. Write tests simulating user journeys
2. Interact with UI elements using Cypress commands
3. Assert expected application state and API responses
4. Mock AWS services when necessary
5. Run tests with `npx cypress run`

### API Tests (Postman):
1. Use Postman to test AWS API Gateway endpoints
2. Create a collection for each API resource
3. Write tests for different HTTP methods (GET, POST, PUT, DELETE)
4. Test both success and error scenarios
5. Use environment variables for different stages (dev, staging, prod)
6. Run tests manually or integrate with CI/CD pipeline

### AWS-specific Testing:
1. Use Cypress for mocking AWS services in tests
2. Test Lambda functions by mocking their responses in Cypress
3. Implement IAM role testing to ensure proper permissions
4. Test S3 bucket operations if used for file storage
5. Verify DynamoDB operations if used as database

Note: Regularly update and maintain test suites as the application evolves. Integrate tests into the CI/CD pipeline for continuous quality assurance.