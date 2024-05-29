# Coding Standards

### Table of Contents

[Introduction](#1)\
[Git Strategy](#2)\
[File Structure](#3)\
[Naming Conventions](#4)\
[Interface Schema Conventions](#5)\
[Function Conventions](#6)\
[Code Layout](#7)\
[Module Conventions and Code Prefixes](#8)\
[Indentation and Spaces](#9)\
[Testing and Debugging](#10)\
[Error Handling](#11)\
[Comments](#12)\
[Formatting](#13)\
[Miscellaneous](#14)

<a id="1"></a>
## Introduction

In software development, consistency and quality are crucial for the success of any project. As we develop our system, it is imperative to have a well-defined Coding Standards document. This document will serve as the foundation for our development practices, ensuring our codebase remains clean, efficient, and scalable.

Our coding standards cover best practices for the range of tools and frameworks, that will be  used in our system.

### Objectives

Adhering to these standards will help us meet several key quality requirements:

1. **Maintainability**: Consistent coding practices make it easier for developers to understand, modify, and extend the codebase.
2. **Reliability**: Structured testing and security practices ensure the system performs reliably under various conditions and threats.
3. **Scalability**: Clean and efficient code facilitates system scalability, allowing it to handle increasing loads and demands.
4. **Efficiency**: Optimal coding standards enhance performance and resource utilization.
5. **Collaboration**: Standardized code improves teamwork by reducing misunderstandings and conflicts among developers.

By committing to these standards, we aim to foster a collaborative and productive environment, accelerating development and ensuring the delivery of a reliable and high-quality product. 

<a id="2"></a>
## Git Strategy

### Branching

- **Main Branches**:
  - `main`: The production-ready branch. Only stable, release-quality code is merged here.
  - `develop`: The integration branch for feature development. All new features and bug fixes branch off from here and are merged back once complete.

- **Supporting Branches**:
  - **Feature Branches**: Used for developing new features. Branch off from `develop` and merge back into `develop`.
    - Naming: `feature/feature-name`
    - Example: `feature/login-page`
  - **Release Branches**: Used for preparing a new production release. Branch off from `develop` and merge into both `main` and `develop` after completion.
    - Naming: `release/release-version`
    - Example: `release/1.0.0`
  - **Hotfix Branches**: Used for quick fixes in production. Branch off from `main` and merge back into both `main` and `develop`.
    - Naming: `hotfix/hotfix-name`
    - Example: `hotfix/critical-bug-fix`
  - **Bugfix Branches**: Used for fixing bugs discovered during development. Branch off from `develop` and merge back into `develop`.
    - Naming: `bugfix/bug-name`
    - Example: `bugfix/ui-glitch`

### Commits

- **Commit Messages**:
  - Follow the format: `type(scope): description`
  - **Types**: `feat` (new feature), `fix` (bug fix), `docs` (documentation changes), `style` (formatting, missing semi-colons, etc.), `refactor` (code change that neither fixes a bug nor adds a feature), `test` (adding or correcting tests), `chore` (maintain).
  - **Example**: `feat(login): add user authentication`

- **Commit Frequency**:
  - Commit frequently with small, logical changes.
  - Ensure each commit compiles and passes all tests.

### Merging

- **Pull Requests (PRs)**:
  - Create a PR for merging branches into `develop` or `main`.
  - Provide a clear description of changes and link to relevant issues.
  - Request reviews from at least one team member.
  - Ensure all checks pass before merging.

- **Merge Strategy**:
  - Use `squash and merge` to combine commits into a single commit on the target branch.
  - Resolve conflicts before merging.

### Tags

- **Release Tags**:
  - Tag releases on the `main` branch using semantic versioning.
  - **Example**: `v1.0.0`

<a id="3"></a>
## File Structure

The file structure for our repository follows a monorepo approach, organizing the project components in a clear and logical manner. This structure is designed to accommodate the technologies we are using, such as Angular, Java with Spring Boot, REST APIs, PostgreSQL, AWS, TensorFlow, and various testing and security tools. The goal is to enhance maintainability, scalability, and collaboration across the development team.

### Top Level Structure

-   **client**: Contains the frontend code and related assets.
-   **server**: Contains the backend code and related configurations.
-   **config**: Contains configuration files for the project.
-   **docs**: Documentation and guides for the project.
-   **scripts**: Scripts for setup, deployment, and other automation tasks.

### Detailed Structure  

#### Client (Angular Frontend)  

```scss
client/
|
├── src/
│ ├── app/ 
│ │ ├── components/ 
│ │ ├── services/ 
│ │ ├── models/ 
│ │ ├── pages/ 
│ │ └── app.module.ts 
│ ├── assets/ 
│ ├── environments/ 
│ └── main.ts
├── e2e/ (Cypress tests) 
│ 
├── angular.json 
├── package.json 
└── tsconfig.json
```

#### Server (Spring Boot Backend)

```scss
server/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           ├── controller/ (REST API endpoints)
│   │   │           ├── model/ (Entities)
│   │   │           ├── repository/ (Database access)
│   │   │           ├── service/ (Business logic)
│   │   │           └── Application.java
│   │   └── resources/
│   │       ├── static/ (Static files)
│   │       ├── templates/ (HTML templates if any)
│   │       └── application.yml (Configuration)
│   ├── test/ (Spring tests)
│       ├── java/
│       └── resources/
│
├── Dockerfile
├── build.gradle
└── settings.gradle
```

#### Config

```scss
config/
│
├── aws/
│   ├── cloudformation/
│   └── terraform/
│
├── database/
│   ├── migrations/ (Flyway or Liquibase scripts)
│   └── init.sql
│
└── application.yml (Common configuration file)

```

#### Docs

```scss
docs/
│
├── ArchitecturalSpecification/
│   ├── diagrams/
│   └── specifications/
|
├── CodingStandards/
│
├── DesignSpecification/
│
├── RequirementSpecification/
|
├── TestingPolicy/
│
├── setup/
│   ├── frontend-setup.md
│   ├── backend-setup.md
│   └── deployment.md
│
└── usage/
    ├── api-guide.md
    ├── user-manual.md
    └── troubleshooting.md
```

#### Scripts

```scss
scripts/
│
├── build/
│   ├── build-client.sh
│   └── build-server.sh
│
├── deploy/
│   ├── deploy-client.sh
│   └── deploy-server.sh
│
├── test/
│   ├── run-tests.sh
│   ├── cypress-tests.sh
│   ├── postman-tests.sh
│   └── spring-tests.sh
│
└── setup.sh

```

<a id="4"></a>
## Naming Conventions

### General Naming Conventions

-   **Use meaningful and descriptive names**: Names should clearly describe the purpose of the variable, function, class, etc.
-   **Use camelCase for variables, functions, and methods**: e.g., `calculateTotal`, `userName`.
-   **Use PascalCase for classes and types**: e.g., `UserManager`, `OrderService`.
-   **Use UPPER_CASE for constants**: e.g., `MAX_RETRIES`, `DEFAULT_TIMEOUT`.
-   **Avoid abbreviations and single-character names**: Unless they are universally understood, like `i` for loop counters.

### Angular (TypeScript)

-   **Components**: Use `PascalCase` and suffix with `Component`. e.g., `UserProfileComponent`.
-   **Services**: Use `PascalCase` and suffix with `Service`. e.g., `UserService`.
-   **Directives**: Use `camelCase` and prefix with `app`, suffix with `Directive`. e.g., `appHighlightDirective`.
-   **Pipes**: Use `PascalCase` and suffix with `Pipe`. e.g., `DateFormatterPipe`.
-   **Modules**: Use `PascalCase` and suffix with `Module`. e.g., `AppModule`.

### Java with Spring Boot

-   **Packages**: Use lowercase and dot-separated. e.g., `com.example.projectname`.
-   **Classes**: Use `PascalCase`. e.g., `UserService`, `OrderController`.
-   **Interfaces**: Use `PascalCase` and prefix with `I` if needed. e.g., `IUserService`.
-   **Methods**: Use `camelCase`. e.g., `getUserById`, `calculateTotalAmount`.
-   **Variables**: Use `camelCase`. e.g., `userName`, `orderList`.
-   **Constants**: Use `UPPER_CASE` with underscores. e.g., `MAX_CONNECTIONS`.
-   **Properties (application.properties/yml)**: Use `lowercase` with dot separation. e.g., `server.port`, `spring.datasource.url`.

### REST API

-   **Endpoints**: Use `kebab-case` and plural nouns. e.g., `/api/users`, `/api/orders`.
-   **HTTP Methods**: Use appropriate HTTP methods for actions (GET, POST, PUT, DELETE). e.g., `GET /api/users`, `POST /api/orders`.
-   **Parameters**: Use `camelCase` for query parameters. e.g., `/api/users?userId=123`.

### PostgreSQL

-   **Tables**: Use `snake_case` and plural nouns. e.g., `users`, `order_items`.
-   **Columns**: Use `snake_case`. e.g., `first_name`, `order_date`.
-   **Primary Keys**: Use `snake_case` and suffix with `_id`. e.g., `user_id`.
-   **Foreign Keys**: Use `snake_case` and suffix with `_id`, reference the related table. e.g., `user_id` in `orders` table.
-   **Indexes**: Use `snake_case` and include table name and column name. e.g., `idx_users_last_name`.

### Git and GitHub

-   **Branch Names**: Use `kebab-case` and include feature or issue description. e.g., `feature/user-authentication`, `bugfix/login-issue`.
-   **Commit Messages**: Use imperative, present tense and include a short description. e.g., `Add user authentication feature`, `Fix login issue`.
-   **Tags**: Use semantic versioning. e.g., `v1.0.0`, `v2.1.3`.

### GitHub Project Board

-   **Project Names**: Use `PascalCase`. e.g., `UserAuthenticationProject`.
-   **Column Names**: Use `Title Case`. e.g., `To Do`, `In Progress`, `Done`.
-   **Card Titles**: Use `Sentence case`. e.g., `Implement login functionality`, `Fix signup bug`.

### GitHub Actions

-   **Workflow Names**: Use `Title Case`. e.g., `Build And Test`.
-   **Job Names**: Use `camelCase`. e.g., `buildApp`, `runTests`.
-   **Step Names**: Use `Sentence case`. e.g., `Checkout code`, `Run tests`.

### Testing (Spring Test, Postman, Jasmine, Cypress)

-   **Test Files**: Use `camelCase` or `PascalCase` as per the language norms. e.g., `UserServiceTest.java`, `userService.test.ts`.
-   **Test Cases**: Use descriptive names and `camelCase`. e.g., `shouldCreateUserSuccessfully`, `testUserLogin`.

### Security (Spring Security, JWT, HTTP/SSL, bcrypt)

-   **Security Classes**: Use `PascalCase`. e.g., `SecurityConfig`, `JwtTokenProvider`.
-   **Configuration Properties**: Use `lowercase` with dot separation. e.g., `security.jwt.secret`, `server.ssl.key-store`.

### TensorFlow

-   **Model Files**: Use `snake_case`. e.g., `image_classifier.py`, `data_preprocessing.py`.
-   **Variables**: Use `camelCase` for local variables, `UPPER_CASE` for constants. e.g., `learningRate`, `BATCH_SIZE`.
-   **Functions**: Use `snake_case`. e.g., `train_model`, `load_data`.

### ESLint

-   **Configuration Files**: Use `.eslintrc.js` or `.eslintrc.json`.
-   **Rule Names**: Use `kebab-case`. e.g., `no-console`, `no-unused-vars`.

<a id="5"></a>
## Interface Schema Conventions

### General Interface Schema Conventions

-   **Use meaningful and descriptive names**: Interfaces should clearly describe the structure and purpose of the data they represent.
-   **Use PascalCase for interface names**: e.g., `UserProfile`, `OrderDetails`.
-   **Use camelCase for property names**: e.g., `userName`, `orderDate`.
-   **Use appropriate data types**: Ensure properties have the correct and specific data types.

### Angular (TypeScript Interfaces)

-   **Interface Names**: Use `PascalCase` and prefix with `I` if needed. e.g., `IUserProfile`, `IOrderDetails`.
-   **Property Names**: Use `camelCase`. e.g., `userName`, `orderItems`.

### Java with Spring Boot (DTOs)

-   **Class Names**: Use `PascalCase` and suffix with `Dto` if needed. e.g., `UserProfileDto`, `OrderDetailsDto`.
-   **Property Names**: Use `camelCase`. e.g., `userName`, `orderItems`.

### REST API (JSON Schemas)

-   **Schema Names**: Use `PascalCase` and suffix with `Schema` if needed. e.g., `UserProfileSchema`, `OrderDetailsSchema`.
-   **Property Names**: Use `camelCase`. e.g., `userName`, `orderItems`.

### PostgreSQL (Tables and Columns)

-   **Table Names**: Use `snake_case` and plural nouns. e.g., `user_profiles`, `order_details`.
-   **Column Names**: Use `snake_case`. e.g., `user_name`, `order_date`.

### JSON Data (For API Communication)

-   **Schema Names**: Use `PascalCase` for complex types, and `camelCase` for property names.

### TensorFlow (Data Structures)

-   **Class Names**: Use `PascalCase` for class and model names. e.g., `ImageClassifier`, `DataPreprocessor`.
-   **Variable Names**: Use `camelCase` for variable names. e.g., `learningRate`, `batchSize`.

<a id="6"></a>
## Function Conventions

### General Function Conventions

-   **Function Naming**: Use `camelCase` for function names. Names should be descriptive and indicate the function's purpose.
-   **Parameters**: Use `camelCase` for parameter names and ensure they are descriptive.
-   **Single Responsibility**: Each function should perform a single task or responsibility.
-   **Documentation**: Include JSDoc or equivalent comments for complex functions, describing the purpose, parameters, and return values.
-   **Length**: Keep functions short and focused. Ideally, a function should not exceed 50 lines of code.
-   **Return Types**: Explicitly define return types where applicable.

### Angular (TypeScript) and JavaScript

-   **Function Declaration**: Use `function` keyword for named functions and `const` for anonymous functions or arrow functions.
-   **Async Functions**: Use `async/await` for asynchronous operations.

### Java with Spring Boot

-   **Method Declaration**: Use `camelCase` for method names.
-   **Visibility**: Explicitly define the visibility (public, private, protected).
-   **Static Methods**: Use `PascalCase` for class names and `camelCase` for static methods.

### REST API (JavaScript/TypeScript and Java with Spring Boot)

-   **Function Declaration**: Functions related to API calls should be descriptive.
-   **Async Functions**: Use `async/await` in JavaScript/TypeScript and `@Async` in Java.
-   **Error Handling**: Implement robust error handling using `try/catch` blocks.

### Testing (Jasmine, Cypress, Spring Test)

-   **Test Function Names**: Use descriptive names and `camelCase`.
    
-   **Test Structure**: Follow a consistent structure: Arrange, Act, Assert.

### Security Functions (Spring Security, JWT)

-   **Function Names**: Use `camelCase` and descriptive names.

### TensorFlow (Python Functions)

-   **Function Names**: Use `snake_case` for function names.

<a id="7"></a>
## Code Layout

### General Code Layout Conventions

-   **Indentation**: Use 2 spaces for indentation in JavaScript/TypeScript, and 4 spaces in Java and Python.
-   **Line Length**: Limit lines to a maximum of 80 characters.
-   **Braces**: Use braces for all control structures (if, else, for, while, etc.), even if they contain only one statement.
-   **Whitespace**: Use blank lines to separate sections of code, such as between methods, to improve readability.
-   **Comments**: Use single-line comments (`//`) for short comments and block comments (`/* */`) for longer descriptions. Keep comments concise and relevant.

### Angular (TypeScript) and JavaScript

-   **File Structure**: Organize files by feature or module.
-   **Import Statements**: Group imports by external libraries first, then internal modules, separated by a blank line.
-   **Component Layout**:
    -   **Selectors**: Place at the top.
    -   **Imports**: Grouped and sorted alphabetically.
    -   **Decorator**: Immediately above the class.
    -   **Properties**: Place at the top of the class.
    -   **Methods**: Place below properties, separated by blank lines.

### Java with Spring Boot

-   **File Structure**: Follow standard Maven/Gradle directory structure.
-   **Package Declaration**: At the top of the file.
-   **Import Statements**: Group imports logically (standard Java imports first, then third-party libraries, followed by project-specific imports), separated by a blank line.
-   **Class Layout**:
    -   **Annotations**: Immediately above the class.
    -   **Class-Level Javadoc**: Immediately below the package declaration and above the class declaration.
    -   **Static Fields**: At the top of the class.
    -   **Instance Fields**: Below static fields.
    -   **Constructors**: Below fields.
    -   **Methods**: Group methods logically and separate by blank lines.

### REST API (JavaScript/TypeScript and Java with Spring Boot)

-   **Controller Layout**:
    
    -   **Annotations**: Immediately above the class and method declarations.
    -   **Endpoint Methods**: Group by HTTP method (GET, POST, etc.), and separate by blank lines.
    -   **Request Handling**: Validate and handle request parameters and body at the top of the method.
    -   **Service Calls**: Place service calls in the middle of the method.
    -   **Response Handling**: Handle response formatting and error handling at the end.

### PostgreSQL (SQL)

-   **File Structure**: Organize SQL files by schema or feature.
-   **Comments**: Use `--` for single-line comments and `/* */` for block comments.
-   **Statement Separation**: Separate SQL statements with blank lines.
-   **Indentation**: Use consistent indentation for readability.

### TensorFlow (Python)

-   **File Structure**: Organize files by feature or model.
-   **Function Layout**: Define functions with a clear separation of configuration, training, and evaluation sections.
-   **Commenting**: Use docstrings for functions and classes, and inline comments for complex logic.

### Git and GitHub

-   **Commit Messages**: Use clear and descriptive commit messages. Follow the format: `[Component] Short description (50 characters)`. Include additional details in the body if necessary.
-   **Branch Naming**: Use `kebab-case` for branch names. Prefix with `feature/`, `bugfix/`, `hotfix/`, or `release/`.
-   **Pull Requests**: Ensure pull requests are small, focused, and contain a clear description of the changes. Link to related issues or tasks.

<a id="8"></a>
## Module Conventions and Code Prefixes


<a id="9"></a>
## Indentation and Spaces

<div style="text-align: center;">

| Aspect                | JavaScript/TypeScript (Angular) | Java (Spring Boot) | Python (TensorFlow) | SQL (PostgreSQL) | CSS/SCSS | JSON/YAML |
|-----------------------|---------------------------------|--------------------|---------------------|------------------|----------|-----------|
| **Indentation**       | 2 spaces                        | 4 spaces           | 4 spaces            | 2 spaces         | 2 spaces | 2 spaces  |
| **Line Length**       | 80 characters                   | 80 characters      | 80 characters       | 80 characters    | 80 characters | 80 characters |
| **Braces**            | Same line for opening, new line for closing | Same line for opening, new line for closing | Same line for opening, new line for closing | Same line for opening, new line for closing | Same line for opening, new line for closing | N/A |
| **Whitespace**        | Single space after keywords and before opening parentheses. No spaces inside parentheses, brackets, or braces. Single blank line to separate sections. Remove trailing whitespace. | Same as Angular | Same as Angular | Same as Angular | Same as Angular | Same as Angular |
| **Alignment**         | Align code for readability. | Same as Angular | Same as Angular | Same as Angular | Same as Angular | Same as Angular |
| **Function/Method Declarations** | Single space between signature and body. | Same as Angular | Same as Angular | Same as Angular | Same as Angular | Same as Angular |
| **Control Structures**| Always use braces `{}` | Same as Angular | Same as Angular | Same as Angular | Same as Angular | Same as Angular |
| **Operators**         | Space before and after binary operators. No spaces around unary operators. | Same as Angular | Same as Angular | Same as Angular | Same as Angular | Same as Angular |

</div>

<a id="10"></a>
## Testing and Debugging

### JavaScript/TypeScript (Angular), Jasmine, and Cypress

- **Test Structure**:
  - **Describe Blocks**: Group related tests using `describe` blocks.
  - **It Blocks**: Use `it` blocks for individual test cases.
  - **Setup/Teardown**: Use `beforeEach` and `afterEach` for setup and teardown logic.

- **Assertions**:
  - Use Jasmine matchers (e.g., `toEqual`, `toBe`, `toContain`) for assertions.

- **Mocking and Spies**:
  - Use Jasmine spies to mock functions and services.

- **End-to-End Testing**:
  - Use Cypress for end-to-end tests.
  - Organize tests in the `cypress/integration` directory.
  - Use `cy` commands to interact with the application.

### Java (Spring Boot), Spring Test, and Postman

- **Test Structure**:
  - Use JUnit 5 for unit and integration tests.
  - Use `@Test` annotation for test methods.
  - Organize tests in the `src/test/java` directory following the same package structure as the main code.

- **Assertions**:
  - Use JUnit assertions (e.g., `assertEquals`, `assertNotNull`, `assertTrue`).

- **Mocking**:
  - Use Mockito for mocking dependencies.

- **API Testing**:
  - Use Postman for manual API testing.
  - Create and organize Postman collections to group related API tests.
  - Use Postman scripts to automate testing sequences.

### Python (TensorFlow)

- **Test Structure**:
  - Use `unittest` or `pytest` for testing.
  - Organize tests in the `tests` directory.
  - Use `setUp` and `tearDown` for setup and teardown logic.

- **Assertions**:
  - Use `unittest` assertions (e.g., `assertEqual`, `assertTrue`, `assertIsNone`).

- **Mocking**:
  - Use `unittest.mock` for mocking dependencies.

### SQL (PostgreSQL)

- **Test Structure**:
  - Use migration tools (like Flyway or Liquibase) to manage database schema changes.
  - Write SQL scripts for testing in a dedicated test directory.
  - Use `psql` or other PostgreSQL clients to run and verify test scripts.

<a id="11"></a>
## Error Handling

### General Coding Standards

These standards apply to all technologies used in this project.

#### Syntax
- **Try-Catch Blocks**:
  - Use try-catch blocks to capture and handle exceptions.
  - Place risky code inside the try block and handle exceptions in catch blocks.

- **Throwing Exceptions**:
  - Throw exceptions with meaningful error messages to aid debugging.
  - Prefer specific exception types over general ones to provide more context.

#### Usage
- **Logging**:
  - Use logging frameworks (e.g., log4j, SLF4J, logging in Python) to record errors and events.
  - Log relevant information such as error messages, stack traces, and context details.

- **Graceful Degradation**:
  - Implement graceful degradation by providing fallback mechanisms or alternative workflows when errors occur.
  - Notify users about errors in a user-friendly manner and guide them on how to proceed.

<a id="12"></a>
## Comments

- **Single-Line Comments**:
  - Use single-line comments (`//` in JavaScript/TypeScript, Java, Python, SQL) for brief comments on the same line as the code.

- **Block Comments**:
  - Use block comments (`/* */` in JavaScript/TypeScript, Java, Python, SQL) for longer comments spanning multiple lines.

<a id="13"></a>
## Formatting

### General Formatting Standards

##### Indentation
- Use spaces for indentation.
- Set the indentation size to 2 spaces for JavaScript/TypeScript and CSS/SCSS, 4 spaces for Java and Python, and 2 spaces for SQL.

##### General Use
- Maintain a consistent line length of 80 characters.
- Use a single space after keywords and before opening parentheses.
- Avoid spaces inside parentheses, brackets, or braces.
- Utilize a single blank line to separate logical sections of the code.
- Remove trailing whitespace at the end of lines.

#### Operators
- Place a single space before and after binary operators.
- Avoid spaces around unary operators.

#### Expressions
- Format expressions to enhance readability.
- Break long expressions into multiple lines if needed.

#### Functions
- Use a clear and consistent naming convention for functions.
- Document functions using comments to describe their purpose, parameters, and return values.

#### Braces
- Place opening braces on the same line as the declaration.
- Place closing braces on a new line.

#### Whitespaces

| Aspect    | JavaScript/TypeScript (Angular) | Java (Spring Boot) and Python (TensorFlow) | SQL (PostgreSQL) |
|-----------|---------------------------------|---------------------------------------------|------------------|
| Whitespace| Indent using 2 spaces.          | Indent using 4 spaces.                      | Indent using 2 spaces. |


## Styling Standards and Folder Creation Standards

### Styling Standards

#### Units of Measurement
- **Font Sizes**: Use `rem` for font sizes to ensure scalability.
- **Widths and Heights**: Use `%` for widths and heights to ensure responsiveness.
- **Precision**: Use `px` for borders, padding, and margins where precision is necessary.

#### Color Variables
- Define color variables in `variables.scss` for consistency and easy theme switching.

#### Typography
- Use a consistent font family across the application.
- Define font sizes and weights in `variables.scss`.

#### Spacing
- Use a consistent spacing scale (e.g., 4px, 8px, 16px) defined in `variables.scss`.

#### BEM (Block Element Modifier) Methodology
- Use BEM for naming classes to ensure consistency and readability.
```css
/* Block component */
.btn {}

/* Element that depends upon the block */
.btn__price {}

/* Modifier that changes the style of the block */
.btn--orange {}
.btn--big {}
```

#### Component Styling
- Each component should have its own SCSS file.
- Use encapsulated styles to avoid conflicts.

#### Responsive Design
- Ensure all components are responsive using media queries and flexible layouts.

#### Theming
- Typescript/Javascript will be used as a mechanism for theme switching, declared in variables.scss. 

#### Folder Creation Standards

Sure, here is the detailed explanation of each main folder in your Angular/Ionic project structure formatted in Markdown:

## Folder Structure Explanation

### Core Folder

**Purpose:**
The `core` folder is intended for services, guards, interceptors, and other singleton classes that provide core functionality for the application. These are generally provided at the root level and are meant to be shared across the entire application.

**Contents:**
- **Services**: Singleton services used throughout the app (e.g., authentication, logging).
- **Guards**: Route guards to protect routes (e.g., AuthGuard).
- **Interceptors**: HTTP interceptors for modifying requests and responses.

**Generating Files:**
- **Service**: `ng generate service core/services/auth`
- **Guard**: `ng generate guard core/guards/auth`
- **Interceptor**: Create manually, as Angular CLI doesn’t have a direct command. You can create a file manually and then register it in your app module.

### Layout Folder

**Purpose:**
The `layout` folder contains components that define the overall layout of the application, such as headers, footers, and sidebars. These components are typically used in the root component to wrap the main content.

**Contents:**
- **Header**: The main navigation bar.
- **Footer**: The footer component.
- **Sidebar**: A side navigation component.

**Generating Files:**
```bash
ng generate component layout/header
ng generate component layout/footer
ng generate component layout/sidebar
```

### Pages Folder

**Purpose:**
The `pages` folder contains the different feature modules and their associated components, services, and other related files. Each feature module represents a distinct part of the application, such as a login page, home page, etc.

**Contents:**
- **Home**: Components, services, and routing related to the home page.
- **Login**: Components, services, and routing related to the login page.

**Generating Files:**
```bash
ionic generate page pages/home
```

### Shared Folder

**Purpose:**
The `shared` folder contains reusable components, directives, and pipes that can be shared across multiple feature modules. These are generally UI elements or utilities that are not tied to a specific feature.

**Contents:**
- **Components**: Reusable components (e.g., buttons, modals).
- **Directives**: Reusable directives (e.g., tooltips, highlight).
- **Pipes**: Reusable pipes (e.g., date formatting, currency formatting).

**Generating Files:**
```bash
ng generate module shared
ng generate component shared/components/button
ng generate directive shared/directives/tooltip
ng generate pipe shared/pipes/date-format
```
```scss
src/
|-- app/
| |-- core/
| | |-- services/api
| | |-- guards/
| | |-- interceptors/
| | |-- core.module.ts
| |
| |-- shared/
| | |-- components/
| | |-- directives/
| | |-- pipes/
| | |-- shared.module.ts
| |
| |-- pages/
| | |-- home/
| | | |-- components/
| | | |-- services/
| | | |-- pages/
| | | | |-- home.page.ts
| | | | |-- home.page.html
| | | | |-- home.page.scss
| | | | |-- home-routing.module.ts
| | | |-- home.module.ts
| | |
| | |-- login/
| | | |-- components/
| | | |-- services/
| | | |-- pages/
| | | | |-- login.page.ts
| | | | |-- login.page.html
| | | | |-- login.page.scss
| | | | |-- login-routing.module.ts
| | | |-- login.module.ts
| |
| |-- layout/
| | |-- header/
| | |-- footer/
| | |-- sidebar/
| | |-- layout.module.ts
| |
|-- assets/
| |-- images/
| |-- fonts/
|
|-- environments/
| |-- environment.ts
| |-- environment.prod.ts
|
|-- theme/
|-- global.scss
|-- index.html
|-- main.ts
|-- manifest.webmanifest
|-- polyfills.ts
|-- styles.scss
|-- test.ts
|-- zone-flags.ts
|-- angular.json
|-- package.json
|-- capacitor.config.ts
```

<a id="14"></a>
## Miscellaneous
