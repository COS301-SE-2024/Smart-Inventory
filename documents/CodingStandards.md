# Code Standards

### Table of Contents

[Introduction](#1)
[Git Strategy](#2)
[File Structure](#3)
[Naming Conventions](#4)
[Interface Schema Conventions](#5)
[Function Conventions](#6)
[Code Layout](#7)
[Module Conventions and Code Prefixes](#8)
[Indentation and Spaces](#9)
[Testing and Debugging](#10)
[Error Handling](#11)
[Comments](#12)
[Formatting](#13)
[Standards Technology](#14)
[Miscellaneous](#15)

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

### Constructions

### Construction Exceptions

### Name Choices


<a id="5"></a>
## Interface Schema Conventions


<a id="6"></a>
## Function Conventions


<a id="7"></a>
## Code Layout


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

