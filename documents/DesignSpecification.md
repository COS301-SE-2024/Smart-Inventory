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
# Database Design (DynamoDB)

- The system will use DynamoDB for storing inventory data, user information, and other relevant data.
- Data will be organized into separate tables for optimal performance and access patterns (e.g., products, users, orders, inventory transactions).
- Partition and sort keys will be carefully designed for efficient querying and data retrieval.
- Global Secondary Indexes (GSIs) and Local Secondary Indexes (LSIs) will be used to enable querying on non-key attributes and support complex querying requirements.
- DynamoDB Streams will capture data modification events in real-time, enabling integration with other components for data synchronization, auditing, or analytics.

# Technology Stack

- The system will use an open-source technology stack, leveraging AWS services like Lambda, API Gateway, and DynamoDB.
- The front-end will be built with modern JavaScript frameworks like React or Angular for a responsive interface.
- The back-end will use a serverless architecture, with Lambda functions handling business logic and interacting with DynamoDB and other AWS services.
- API Gateway will handle request routing, authentication, and rate limiting.
- Additional AWS services like CloudWatch, X-Ray, and CloudFormation may be used for monitoring, tracing, and infrastructure provisioning.

# Modular Design

- The system will follow a modular design approach, with functionality broken down into smaller, independent modules or Lambda functions.
- Each module or Lambda function will have a well-defined responsibility, promoting code reusability, maintainability, and easier testing.
- Modules will communicate through well-defined interfaces or event-driven architectures (e.g., using AWS EventBridge or SNS/SQS).
- This approach allows for incremental development and deployment of features and easier integration of third-party services or components.

# Automated Testing

- Comprehensive automated testing will ensure code quality and minimize bugs.
- Unit tests will be written for individual Lambda functions, API Gateway configurations, and other components in isolation.
- Integration tests will test interactions between different components, such as Lambda functions and DynamoDB.
- End-to-end tests will simulate real-world scenarios and test the complete application flow, from front-end to back-end services.
- Automated testing will be part of the continuous integration and deployment pipeline.

# Scalability Considerations

- The system will leverage AWS's scalability features.
- DynamoDB's built-in partitioning and automatic scaling will handle increasing workloads without manual intervention.
- Lambda functions will automatically scale based on incoming request traffic.
- API Gateway caching can improve response times and reduce the load on downstream services.
- CloudFront can cache responses at edge locations, improving performance for geographically distributed clients.

# Security Measures

- End-to-end encryption will protect sensitive data in transit and at rest.
- Secure user authentication mechanisms, such as password hashing and secure storage, will be employed.
- Role-based access control (RBAC) will ensure users access only relevant features and data.
- API Gateway will use AWS IAM for authentication and authorization.
- API Gateway will enforce HTTPS communication.
- Lambda functions will have minimal necessary permissions (using IAM roles) to interact with other AWS services.
- DynamoDB table access will be controlled through IAM policies.
- Sensitive data will be stored in AWS Systems Manager Parameter Store or AWS Secrets Manager for secure storage and retrieval.

### Interface Design


#### UI and UX design:


#### User-centric design:


#### Intuitive navigation:


#### Design consistency:


#### Trends and historical considerations:
