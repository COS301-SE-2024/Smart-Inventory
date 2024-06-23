# Testing Manual for X Clone

## Introduction

In our development of the Smart Inventory web app we will utilise Postman for testing API endpoints and Cypress for unit/component testing, and end-to-end (E2E) testing. 

## Types of Tests

### Unit Tests: 

Focus on testing individual units or components of the application in isolation. They verify that each unit performs as expected, meeting reliability and usability requirements.

### Component Tests

Component tests are designed to verify the individual units or components of the system in isolation, ensuring they function correctly according to their specifications. They ensure components function as intended, addressing reliability and usability concerns.

### End-to-End (E2E) Tests: 

E2E tests simulate real user scenarios by testing the entire application workflow from start to finish. They validate the application's behavior from the user's perspective, covering reliability, usability, security, and privacy concerns.

### Mocked Tests

Mocked tests will be utilised to simulate external dependencies such as API responses. This allows us to isolate components for testing and ensure that each unit behaves as expected, without relying on external resources.

### Test Coverage

We aim to achieve a test coverage of at least 80%, ensuring that most of our codebase is thoroughly tested and free from critical issues.

## Test Tools

#### Cypress: 

Cypress is a testing framework that allows component testing, integration testing, and E2E testing for web applications. Its ability to perform tests directly in the browser environment makes it ideal for ensuring the reliability, usability, security, and privacy of our application.
* Automate Tests: Create automated test scripts to streamline the testing process and improve efficiency.

#### Postman
Postman is a powerful API testing tool that enables us to:
* Send HTTP Requests: Simulate various HTTP requests (GET, POST, PUT, DELETE) to interact with the Smart Inventory API endpoints.
* Test API Functionality: Verify the behavior of API endpoints under different conditions (success, error scenarios).
* Validate Responses: Ensure API responses are formatted correctly and contain the expected data.
* Manage Environments & Collections: Organize API requests into collections and manage different testing environments (development, staging, production).
* Automate Tests: Create automated test scripts to streamline the testing process and improve efficiency.

## Quality Assurance Requirements

**Reliability:**
* Unit Tests: By ensuring individual units function as expected, unit tests contribute significantly to overall application reliability.
* Component Tests: Similar to unit tests, component tests help identify issues within isolated components, improving reliability of the integrated system.
* E2E Tests: By simulating real user workflows, E2E tests uncover errors that might affect application stability and reliability in real-world scenarios.
* Mocked Tests: By isolating components from external dependencies, mocked tests aid in building reliable units that function consistently regardless of external factors.

**Usability:**
* Unit Tests: While unit tests primarily focus on functionality, they can also indirectly improve usability by ensuring core functionalities work as expected, leading to a more predictable and usable experience.
* Component Tests: By verifying components function correctly according to specifications, component tests help identify usability issues within individual components that might hinder the overall user experience.
* E2E Tests: E2E tests are particularly valuable for usability testing. By simulating real user workflows, they expose usability issues in the entire application flow, ensuring a smooth and intuitive user experience.

**Efficiency:**
* Automated Tests: Provided by both Cypress and Postman, automated testing scripts significantly improve efficiency by streamlining the testing process and reducing manual effort.

**Maintainability:**
* Unit Tests: Well-written unit tests act as documentation for the code, making it easier for developers to understand the purpose and behavior of individual units. This improves code maintainability by providing clear reference points for future modifications.
* Component Tests: Similar to unit tests, component tests document the expected behavior of components, aiding in maintainability by providing a clear understanding of how components interact and function within the system.

**Scalability:**
* E2E Tests: By identifying performance bottlenecks or limitations early on, E2E tests can help ensure the application is designed with scalability in mind. This allows for future growth and increased user load without compromising functionality.

## Testing Processes
### Unit Tests:
### End-to-End (E2E) Tests:
### API Tests:
