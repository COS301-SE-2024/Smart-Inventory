# Testing Manual for X Clone

## Introduction

In our development of an X clone we will utilise Deno for testing API endpoints and Cypress for unit testing, component testing, and end-to-end (E2E) testing. 

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

We aim to achieve a test coverage of at least 60%, ensuring that most of our codebase is thoroughly tested and free from critical issues.

## Test Tools

#### Cypress: 

Cypress is a testing framework that allows component testing, integration testing, and E2E testing for web applications. Its ability to perform tests directly in the browser environment makes it ideal for ensuring the reliability, usability, security, and privacy of our application.

#### Deno

Deno, with its built-in TypeScript support, secure runtime environment, and simplified dependency management, is suitable for API testing due to its ability to easily handle HTTP requests, run tests in isolation, and ensure reliable, maintainable, and consistent test results. Deno's ability to create and test mock Supabase instances makes it well-suited for testing Supabase-related functionality.

## Quality Assurance Requirements

**Reliability:**\
Ensures that the application performs consistently and reliably under various conditions.\
**Usability:**\
Focuses on making the application intuitive and user-friendly.\
**Privacy:**\
Ensures that user data is handled securely and respects privacy.

### Testing Processes

### Unit Tests:
**Quality Assurance Requirement:** Reliability, Usability
  - Unit tests will cover individual components, functions, and utilities in the application. They will verify that each unit behaves correctly under different inputs and scenarios.

**Function Unit Tests:**

Reliability: 
  - Test individual functions to ensure they produce the expected output for different inputs and edge cases. Verify error handling and boundary conditions to ensure reliability under various scenarios.
Usability: 
  - Validate that functions are designed with user experience in mind, such as providing clear and concise error messages or intuitively handling inputs.

**Component Unit Tests:**

Quality Assurance Requirements: Reliability, Usability
  - Component tests will focus on testing interactions between different modules or layers of the application, such as frontend and backend integration.

Reliability: 
  - Test React components to ensure they render correctly and behave as expected based on their props and state. Verify that component logic, such as event handling and state management, is reliable and error-free.

**API Integration Tests:**

Reliability: 
  - Ensure that API endpoints return the expected response under various conditions, such as valid inputs, invalid inputs, and error scenarios. Verify that the API contracts are maintained and that data integrity is preserved.
    
Usability: 
  - Test API responses to ensure they provide clear and understandable information to frontend components. Validate that error messages are user-friendly and informative.

**Frontend-Backend Integration Tests:**

Reliability: 
  - Test communication between the frontend and backend systems to ensure that data is transmitted accurately and securely. Verify that frontend components correctly display data received from the backend.

Usability: 
  - Validate that user interactions on the frontend trigger the appropriate backend actions and updates. 
  - Ensure that the user interface remains responsive and intuitive during interactions with backend services.

### End-to-End (E2E) Tests:

**Quality Assurance Requirement:** Reliability, Usability, Privacy
  - E2E tests will simulate user interactions with the application from start to finish. They cover critical user workflows, such as registration, authentication, data manipulation, and more. These tests ensure that the application functions correctly, and respects user privacy throughout the entire user journey.

**Registration and Authentication Tests:**

Reliability: 
  - Test the registration and authentication process to ensure that users can create accounts and log in reliably without encountering errors or issues.

Usability: 
  - Validate that the registration and authentication flows are intuitive and user-friendly, with clear instructions and feedback for users.

Security: 
  - Test for secure handling of user credentials.

Privacy:
  - We test privacy by covering data privacy compliance to ensure that the system complies with relevant data protection regulations by assessing data handling practices and privacy policies. 
  - Anonymity is also tested to evaluate whether personally identifiable information is adequately anonymised to protect user privacy.

**Data Manipulation Tests:**

Reliability: 
  - Test data manipulation features, such as creating, updating, and deleting posts, likes, and bookmarks, to ensure they perform reliably without data loss or corruption.

Usability: 
- Validate that data manipulation flows are easy to understand and use, with clear UI elements and error handling for input validation.

**Compatibility Tests:**

Reliability: 
  - Test the application's compatibility across different web browsers and devices to ensure consistent behavior and performance.

Usability: 
  - Validate that the application renders correctly and remains usable across various browsers and desktop screen sizes

Privacy: 
  - Verify that user privacy is maintained across different browsers and devices, with consistent handling of sessions and local storage.


# Testing Policy

## Introduction

## Types of Tests

### Unit Tests:

### Integrations Tests 

### End-to-End (E2E) Tests

### Mocked Tests

### Test Coverage

## Test Tools

#### Postman: 

#### Cypress: 

## Quality Assurance Requirements

**1. :**
**2. :**
**3. :**
**4. :**

### Testing Processes

### Unit Tests:
**Quality Assurance Requirement:**

**Function Unit Tests:**

**Component Unit Tests:**

**Async Function Unit Tests:**

### Integration Tests:

**API Integration Tests:**

**Database Integration Tests:**

**Frontend-Backend Integration Tests:**

**Load Tests:**

### End-to-End (E2E) Tests

**Registration and Authentication Tests:**

**Data Manipulation Tests:**

**Compatibility Tests:**
