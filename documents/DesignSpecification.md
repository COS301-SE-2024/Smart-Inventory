# Design Specification
## Introduction
SmartInventory is a comprehensive web-based application designed to revolutionize inventory management for businesses of all sizes, including restaurants and laboratories. This design specification outlines the visual elements and functionalities that will shape the user experience within SmartInventory. 
* Wireframes and detailed design mockups will illustrate the user interface, navigation flow, and interaction patterns for each user role.
* Additionally, this document will include a section dedicated to the design of the database schema for Amazon DynamoDB, the NoSQL database service that will power SmartInventory's data storage and retrieval capabilities.
The document aims to provide a clear roadmap for developers to translate the vision of SmartInventory into a user-centric and efficient application.

## Wireframes
### Sign in and Create Account
### Settings
### Help
### Dashboard
### Inventory
### Reports
### Requests
### Suppliers
### Orders

## Database Design
The SmartInventory system will utilize Amazon DynamoDB, a fully managed NoSQL database service provided by Amazon Web Services (AWS). DynamoDB offers high scalability, low latency, and flexible data modeling, making it suitable for the inventory management system. The key tables and their sample data are as follows:

### Users Table:
| userID | createdAt | email | name | passwordHash | Permissions | surname | updatedAt |
|--------|------------|-------|------|--------------|-------------|---------|-----------|
| 123e4567-e89b-12d3-a456-426614174000 | 1621234567890 | john.doe@gmail.com | John | asjsd92j$sk2 | ["manageInventory", "manageProducts", "requestStock"] | Doe | 1621234567890 |

### Suppliers Table:
| supplierID | Address | contactEmail | contactPhone | createdAt | name | updatedAt |
|------------|---------|--------------|--------------|-----------|------|-----------|
| 2c918730-38ae-4a7b-ae13-04002f2b9283 | ["city: Pretoria", "street: 123 Street"] | supplier.name@gmail.com | 831234567 | 1621234567890 | Supplier Name | 1621234567890 |

### Products Table:
| productID | category | createdAt | description | name | sku | updatedAt |
|-----------|----------|-----------|-------------|------|-----|-----------|
| 6a9c12a1-22fc-4f6d-92ad-bc1c86c3466f | Electronics | 1621234567890 | ["100mm x 100mm", "Green", "Retractable"] | Example Item | EX123 | 1621234567890 |

### Inventory Table:
| productID | supplierID | createdAt | expirationDate | quantity | updatedAt |
|-----------|------------|-----------|----------------|----------|-----------|
| 6a9c12a1-22fc-4f6d-92ad-bc1c86c3466f | 2c918730-38ae-4a7b-ae13-04002f2b9283 | 1621234567890 | 2022-12-31 | 100 | 1621234567890 |

The sample data provided showcases the structure and attributes of each table. DynamoDB's flexible schema allows for storing complex data types, such as arrays and objects, within a single attribute (e.g., Permissions in the Users table and Address in the Suppliers table).

DynamoDB's primary key consists of a partition key and an optional sort key. In this design:
- The Users table uses userID as the partition key.
- The Suppliers table uses supplierID as the partition key.
- The Products table uses productID as the partition key.
- The Inventory table uses a composite primary key with productID as the partition key and supplierID as the sort key, enabling efficient querying of inventory items by product and supplier.

DynamoDB's powerful querying capabilities, such as the ability to query by partition key and sort key, and its seamless integration with other AWS services, make it a suitable choice for the SmartInventory system. The database design can evolve as the system grows, leveraging DynamoDB's scalability and flexibility.

## Design Decisions
The design of the SmartInventory system is based on the following key decisions:

### Technology Stack:
The system will be developed using an open-source technology stack, ensuring cost-effectiveness, flexibility, and community support. The specific technologies will be selected based on their suitability for the project requirements, scalability, and maintainability.

### Security Measures:
Data security is a top priority for the SmartInventory system. End-to-end encryption will be implemented to protect sensitive data both in transit and at rest. Secure user authentication mechanisms, such as password hashing and secure storage, will be employed. Role-based access control (RBAC) will be enforced to ensure that users have access only to the features and data relevant to their roles.

### Modular Design:
The system will follow a modular design approach, breaking down the functionality into smaller, independent modules. This promotes code reusability, maintainability, and easier testing. Modular design also allows for the incremental development and deployment of features.

### Automated Testing:
Comprehensive automated testing will be incorporated into the development process to ensure code quality and minimize bugs. Unit tests, integration tests, and end-to-end tests will be written to cover critical functionality and edge cases. Automated testing will be run as part of the continuous integration and deployment pipeline.

### Scalability Considerations:
The SmartInventory system will be designed with scalability in mind. The architecture will allow for horizontal scaling, enabling the addition of more instances to handle increased load. Caching mechanisms will be employed to improve performance and reduce the load on the database. The system will be designed to handle a growing number of users, products, and transactions.

## Conclusion
The SmartInventory system design specification outlines the objectives, functional requirements, database design, architecture, and key design decisions. By leveraging a combination of layered architecture, service-oriented architecture, and event-driven architecture, the system aims to achieve modularity, flexibility, and scalability. The use of open-source technologies, strong security measures, modular design, automated testing, and scalability considerations will contribute to the development of a robust and maintainable inventory management solution. This design specification serves as a blueprint for the implementation phase, guiding the development team in building a system that meets the specified requirements and quality standards.

