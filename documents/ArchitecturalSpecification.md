# Architectural Specification

## Introduction
This is the outline for the architectural blueprint for the SmartInventory system, a comprehensive web-based application designed to streamline and automate inventory management processes for businesses of various types, including restaurants and laboratories.  Building upon the functionalities outlined in the requirement specification.

### Objectives
The primary objective of this document is to guide stakeholders involved in the development of the Smart Inventory System. It aims to define the architectural framework, constraints and technologies used to successfully implement the desired features and functionalities. This document details the system architecture that will ensure:
* Reliability
* Scalability
* Security
* Usability
* Maintainability

## Quality Requirements

### 1. Security

The system must ensure data protection through end-to-end encryption, secure user authentication, and role-based access control to prevent unauthorized access and maintain data confidentiality.

#### How to quantify security
* Role based access control should be prevelant in all ends of the app including help and settings.
  
#### Measures to acheive Security 

API gateways: 
* Implement a central point of entry for all API calls. This enables enforcement of authentication and authorization policies before requests reach individual services.
  
Data encryption:
* Encrypt sensitive data at rest (stored in databases) and in transit (transferred between services) using industry-standard algorithms.

### 2. Reliability

The system should be reliable in terms of accurately tracking inventory levels, generating timely alerts, order placement and generating accurate reports.

#### How to quantify reliability
* A mean time between failures of two times within the same 30 days for two hours.
* Mean time to repair of lesss than five hours is our expectation.
  
#### Measures to acheive Reliability 
Fault tolerance: 
* Design the system to be fault-tolerant, meaning it can continue to operate even if some components fail.
  
Error handling:
* Implement robust error handling mechanisms to gracefully handle unexpected situations and prevent system crashes.

### 3. Usability

The web interface should be user-friendly and intuitive for administrators, inventory controllers, and end users to perform their respective tasks efficiently.

#### How to quantify usability
* success rate whether users can perform the task at all
  * A success rate of at least 70% will be expected of our app when tested.
* time a task requires
  * A time of acheiving a simple task should take no more than 2 minutes for a new user to acheive.
* users' subjective satisfaction
  * A 1-5 scale of how satisfied a user was using the app. A average higher than 3.7 is the goal.

#### Measures to acheive Usability 
User-centered design: 
* Involve potential users in the design process to understand their needs and preferences.
  
UI/UX best practices:
* Follow established UI/UX design principles to create interfaces that are visually appealing, easy to navigate, and consistent across different user roles and devices.
  
API design:
* Design APIs that are clear, consistent, and well-documented for developers integrating with the system.

### 4. Scalability

The system should be designed to handle growth in inventory, users, and transactions, ensuring that performance remains optimal as the business expands.

#### How to quantify scalability
* The system is designed to handle 40 user requests per second.
* The system must also have at least an 80% success rate with more than 20 users.
  
#### Measures to acheive scalability 
Scalable architecture: 
* Choose an architecture that can be easily scaled horizontally (adding more servers) or vertically (adding more resources to existing servers) as needed.
  
Cloud-based deployment:
* Deploying the system on a cloud platform that offers built-in scalability features.
  
Database optimization:
* Optimize the database schema and queries to handle increasing data volumes efficiently.

### 5. Maintainability

The system should be developed using best practices, such as modular design and comprehensive documentation, to facilitate easy maintenance, updates, and troubleshooting.

#### How to quantify Maintainability 
* fixing a bug should not cause more than two hours of un-needed time due to un-maintainable code.
* Adding a new feature should not cause more than two hours of un-needed time due to un-maintainable code.

#### Measures to Maintainability 

Clear documentation: 
* Document the system architecture, APIs, and code clearly.
* This facilitates understanding for future maintenance and upgrades by developers.
  
Modular design:
* Divide the system into loosely coupled modules with well-defined interfaces.
* This allows developers to modify or replace individual modules without impacting the entire system.

## Architectural Strategy

The team has decided to apply the strategy of design based on quality requirements for the project. Analyzing the system based on client requirements and user stories yields a large set of quality requirements to use for the project. A set of well defined quality requirements yields a good foundation for designing the architecture of the system.

## Architectural Styles
### Layered Architecture

#### Description
The SmartInventory system will employ a layered architecture, separating the application into distinct layers such as presentation, business logic, and data access. This promotes a clear separation of concerns, making the system more modular, maintainable, and easier to understand. The presentation layer will handle the user interface, the business logic layer will contain the core application logic, and the data access layer will manage interactions with the database.

#### Quality Requirements Addressed

Maintainability:
* The layered architecture facilitates easier maintenance by isolating changes to specific layers, reducing the impact on the overall system.
  
Scalability:
* Layers can be scaled independently based on the demands of the system, allowing for optimal performance as the business grows.

Usability:
* The presentation layer can be designed to provide a user-friendly interface.

Security:
* Allowing layered controls like firewalls, access controls, and encryption at different layers make it harder to breach the system. Data protection as data is secured at rest and in transit using encryption. Allows for separation of duties limiting user access based on roles, minimizing damage from compromised accounts.

### Service-Oriented Architecture (SOA) 

#### Description
The system will be designed using SOA principles, breaking down the functionality into discrete, loosely coupled services. Each service will encapsulate a specific business capability, such as inventory management, order placement, or reporting. Services will communicate through well-defined interfaces, enabling flexibility and reusability.

#### Quality requirements addressed

Scalability: 
* Services can be scaled independently, allowing the system to handle increased load and adapt to changing business needs.
  
Maintainability:
* SOA promotes loose coupling, making it easier to update or replace individual services without affecting the entire system.
  
Reliability:
* Services can be designed with fault tolerance and redundancy in mind, ensuring the system remains operational even if individual components fail.

### Event-Driven Architecture (EDA)
#### Description
The SmartInventory system will incorporate event-driven architecture to enable real-time responsiveness and asynchronous processing. Key events, such as low stock levels or expiring products, will trigger appropriate actions, such as generating alerts or initiating automatic order placement.

#### Quality Requirements addressed

Reliability: 
* EDA allows for asynchronous processing, ensuring that critical events are handled promptly and reliably, even under high load.
  
Scalability:
* The event-driven approach enables the system to scale efficiently by processing events in parallel and distributing the workload across multiple components.

#### Diagram

### Serverless Architecture
#### Description
The SmartInventory system can benefit from a serverless architecture by leveraging cloud-based services to handle backend logic and infrastructure management. This approach eliminates the need to provision and manage servers, reducing operational overhead and costs. Here's how serverless architecture can be implemented in the SmartInventory system:

API Gateway:
* A single API gateway will serve as the entry point for all external requests to the system. This gateway can handle authentication, authorization, and routing of requests to appropriate serverless functions.
  
Lambda Functions:
* Core functionalities of the system, like processing inventory updates, generating reports, or fulfilling stock requests, can be implemented as serverless functions. These functions are event-driven and only execute when triggered by specific events (e.g., an API call, a database update).

Database:
* A cloud-based database service can be used to store inventory data, user information, and other system data. Serverless architectures often integrate seamlessly with managed database services offered by cloud providers.

#### Quality Requirements Addressed

Maintainability: 
* Serverless functions are typically small, focused pieces of code. This promotes maintainability and easier debugging compared to complex monolithic applications.

Scalability: 
* Serverless architecture scales automatically based on demand. The cloud provider allocates resources on-the-fly as needed to handle increased workloads, eliminating the need for manual server provisioning.
  
Security Considerations while serverless architecture offers benefits, security needs to be carefully addressed:
* API Gateway Security: 
  * Secure the API Gateway with authentication and authorization mechanisms to control access to system functionalities.
* Data Security:
  * Utilize secure cloud storage services that offer encryption for data at rest and in transit.

## Architectural Constraints
A core architectural constraint for this project is the requirement to **utilize only open-source libraries**. This decision fosters an open-source development philosophy for the project itself. This contraint might actually provide greater advantages than disadvantages. Here's why this constraint is important:

* Transparency and Collaboration:
  * Open-source libraries offer the advantage of publicly available code.
  * This transparency allows for deeper understanding, easier debugging, and potential contributions from the broader developer community.
* Alignment with Open-Source Project Goals:
  * By relying solely on open-source libraries, we ensure compatibility with an open-source project philosophy.
  * This means the project itself can potentially be released as open-source, allowing others to benefit from and contribute to its development.
* Long-Term Sustainability:
  * Open-source libraries often have active communities and ongoing maintenance.
  * This reduces the risk of relying on proprietary libraries that might become unsupported or unavailable in the future.

While this constraint might limit the available options for libraries, the benefits of transparency, collaboration, and long-term sustainability contribute to a robust and maintainable project foundation.

## Archtectural Diagram

<div align="center">
   <img src="/media/ArchitecturalDiagrams/ArchDiagram.drawio.png">
</div>

## Technology Decisions
### Frontend
#### Angular
* Usability:
  * Angular excels at building Single-Page Applications (SPAs) that provide a responsive and user-friendly experience.
  * Aligning with the quality requirement for a user-friendly web interface for various user roles.
* Maintainability:
  * Angular's architecture promotes modularity and clear separation of concerns.
  * Making the codebase easier to maintain and update in the long run.
* Scalability:
  * Angular SPAs can handle complex data flows and functionalities efficiently.
  * Allowing the application to scale as the business grows.
* Open-Source:
  * Angular is a mature open-source framework with a large and active community.
  * This aligns with the project's open-source constraint.

#### Typescript
* Maintainability:
  * TypeScript leads to fewer runtime errors and improving code maintainability in the long run compared to that of javascript.
  * Adhering to the maintainability requirement.
* Security:
  * TypeScript can help identify potential security vulnerabilities early in the development process by:
    * Catching type errors that could lead to unexpected behavior.

### Database
#### AWS DynamoDB
* Scalability: A core requirement for the SmartInventory system is scalability to handle growing inventory data. DynamoDB is a NoSQL database specifically designed for high scalability and performance. It can efficiently handle increasing data volumes without compromising speed.
* Flexibility: The schema in DynamoDB is flexible, allowing for easy adaptation to future changes in data structures without significant database modifications. This caters to the evolving nature of inventory data as business needs change.
Fast Performance: DynamoDB excels in performing reads and writes for frequently accessed data, which is crucial for the SmartInventory system where users regularly update and retrieve inventory information.

#### AWS S3
* Cost-Effectiveness:
  * S3 offers a cost-efficient storage solution for large, infrequently accessed data objects.
* High Availability:
  * S3 provides highly durable and fault-tolerant storage, ensuring data redundancy and minimizing the risk of data loss.
  * Adhering to reliability quality requirement.
* Object Storage:
  * S3 is optimized for storing objects of any size and type, making it suitable for various file formats associated with inventory management.
* Provides a solution to DynamoDB analytic deffeciancies.
  
### API
#### AWS Lambda Functions and API Gateway
* Scalabilty:
  * Serverless architecture with Lambda functions eliminates server provisioning and scales automatically based on demand.
  * This ensures efficient resource utilization for varying workloads.
* Maintainability:
  * Promotes maintainability due to their focus on single functionalities and smaller codebases.
* Event-Driven:
  * Ideal for the SmartInventory system where actions might be triggered by events like low stock or order placement.
* Open-Source Compatible.

#### API Gateway
* Scalability:
  * A single entry point for all API requests simplifies development and scales efficiently to handle increasing traffic.
* API Management:
  * Provides a central point for managing and securing APIs, simplifying development and reducing complexity.
* Security:
  * Acts as a central point for enforcing authentication and authorization policies before requests reach backend functions, improving access control.

#### AWS Step Functions
* Workflow Orchestration:
  * If the SmartInventory system involves complex workflows (e.g., order fulfillment with multiple steps), Step Functions can orchestrate these steps efficiently.
  * Useful for the event driven architecture.
* Error Handling:
  * Step Functions can handle errors gracefully and ensure workflows are retried or rolled back if necessary.
  * Adhering to reliability quality requirement.

### Standards

> [!NOTE]  
> Read more about standards in coding standards document.

**Prettier:**
* Prettier is our code formatter used to maintain our linter rules to uphold our coding standards.
  
**ESLint:**
<br>
For code quality and consistency, we integrate ESLint into our development process. 
* ESLint is a widely-used static code analysis tool that helps identify and fix common programming errors and enforce coding standards.
* With ESLint, we ensure our codebase remains clean, readable, and maintainable.

### Testing
#### Cypress
Cypress component and end-to-end testing for frontend.
* Usability(Usability testing):
  * Cypress is an excellent tool for testing the user interface (UI) of the SmartInventory web application.
  * Following User-centered design principles (as explained above), Cypress allows manual and automated testing to ensure the UI is intuitive and functions as expected for various user roles.
* Testing also generally increases reliability.

#### Postman
Postman to facilitate API testing.
* API Testing:
  * The chosen architecture utilizes AWS API Gateway and serverless functions (Lambdas) for backend logic.
    * Postman is a powerful tool for testing these APIs.
* Testing also generally increases reliability.
  
### Miscellaneous
#### AWS Cognito
* Security:
  * Addresses the need for secure user authentication as specified in the document's objectives.
  * Cognito provides features like user registration, login, and role-based access control (RBAC).

#### Amplify
Amplify simplifies cloud integration as well as allowing for deployment.
* Simplifies Backend Development:
  * Amplify provides pre-built components and libraries for building mobile and web applications, streamlining backend development and reducing boilerplate code.
* Modular Design:
  * Amplify promotes a modular approach, aligning with the project's maintainability goal.
* Scalability:
  * Amplify simplifies integration with various AWS services like DynamoDB and Lambda functions, fostering scalability as the system grows.

#### Amplify Cloud Sandbox
* Rapid Prototyping and Development:
  * Amplify Cloud Sandbox allows developers to quickly set up and test backend resources in a sandbox environment, accelerating development and reducing time spent on infrastructure management.
* Maintainability:
  * The sandbox facilitates iterative development and testing cycles within a controlled environment, promoting maintainability.
  * It leverages open-source tools under the hood.
