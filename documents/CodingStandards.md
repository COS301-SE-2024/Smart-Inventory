# Code Standards

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
[Standards Technology](#14)\
[Miscellaneous](#15)\

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
- Example 

```typescript
export interface IUserProfile {
    userId: number;
    userName: string;
    email: string;
    dateOfBirth: Date;
    isActive: boolean;
}
```

### Java with Spring Boot (DTOs)

-   **Class Names**: Use `PascalCase` and suffix with `Dto` if needed. e.g., `UserProfileDto`, `OrderDetailsDto`.
-   **Property Names**: Use `camelCase`. e.g., `userName`, `orderItems`.
- Example

```java
public class UserProfileDto {
    private Long userId;
    private String userName;
    private String email;
    private LocalDate dateOfBirth;
    private Boolean isActive;

    // Getters and Setters
}
```

### REST API (JSON Schemas)

-   **Schema Names**: Use `PascalCase` and suffix with `Schema` if needed. e.g., `UserProfileSchema`, `OrderDetailsSchema`.
-   **Property Names**: Use `camelCase`. e.g., `userName`, `orderItems`.
- Example

```json
{
    "UserProfileSchema": {
        "type": "object",
        "properties": {
            "userId": {
                "type": "integer"
            },
            "userName": {
                "type": "string"
            },
            "email": {
                "type": "string"
            },
            "dateOfBirth": {
                "type": "string",
                "format": "date"
            },
            "isActive": {
                "type": "boolean"
            }
        },
        "required": ["userId", "userName", "email"]
    }
}
```

### PostgreSQL (Tables and Columns)

-   **Table Names**: Use `snake_case` and plural nouns. e.g., `user_profiles`, `order_details`.
-   **Column Names**: Use `snake_case`. e.g., `user_name`, `order_date`.
- Example

```sql
CREATE TABLE user_profiles (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    is_active BOOLEAN DEFAULT TRUE
);
```
### JSON Data (For API Communication)

-   **Schema Names**: Use `PascalCase` for complex types, and `camelCase` for property names.
- Example
```json
{
    "orderDetails": {
        "orderId": 456,
        "orderDate": "2023-05-01T12:00:00Z",
        "userId": 123,
        "items": [
            {
                "itemId": 1,
                "quantity": 2,
                "price": 19.99
            }
        ]
    }
}
```

### TensorFlow (Data Structures)

-   **Class Names**: Use `PascalCase` for class and model names. e.g., `ImageClassifier`, `DataPreprocessor`.
-   **Variable Names**: Use `camelCase` for variable names. e.g., `learningRate`, `batchSize`.
- Example
```python
class ImageClassifier:
    def __init__(self, learning_rate: float):
        self.learning_rate = learning_rate
        self.model = self._build_model()

    def _build_model(self):
        model = tf.keras.Sequential([
            tf.keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
            tf.keras.layers.MaxPooling2D((2, 2)),
            tf.keras.layers.Flatten(),
            tf.keras.layers.Dense(128, activation='relu'),
            tf.keras.layers.Dense(10, activation='softmax')
        ])
        model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=self.learning_rate),
                      loss='sparse_categorical_crossentropy',
                      metrics=['accuracy'])
        return model
```

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


<a id="10"></a>
## Testing and Debugging


<a id="11"></a>
## Error Handling


<a id="12"></a>
## Comments

### Syntax

### Uses

<a id="13"></a>
## Formatting

### Whitespace

#### Indentation

#### General Use

### Operators
   
### Expressions

### Functions
   
### Braces

<a id="14"></a>
## Standards Technology
### Prettier

<a id="15"></a>
## Miscellaneous

