# Software Requirement Specification
## Introduction
SmartInventory is a comprehensive web-based inventory management system designed
to streamline and automate the process of tracking, ordering, and managing stock for businesses, restaurants, and laboratories. The system aims to simplify inventory management by providing a user-friendly interface for administrators, inventory controllers, and end users to capture stock details, request stock, and generate insightful reports.

### Objectives
This document goes into the details of users firstly the type of users the system will have as well as what they might need and guides stakeholders through the qualities and functionalities of the Smart Inventory System. It details how client requirements are gathered and evaluated using a structured software engineering methodology.

## Users
### User Types
The users of SmartInventory can easily be split into these groups groups: 
* Business Owners/Managers(Administrators)
* Employees(Inventory Controllers/End-Users)
* Suppliers
### User Type Characteristics
**Business Owners/Managers(Aministrator):**

In today's fast-paced business environment, owners and managers need tools that empower them to manage their operations effectively. The ideal inventory management app should prioritize ease of use, offering a clear and intuitive interface that minimizes technical jargon and complex features. Furthermore, mobility is key, allowing access and management at the owner/mangers convenience. This functionality should not come at a premium.  Affordable pricing models that scale with business size ensure accessibility for all. The app should adapt to diverse business needs and product types. Finally, data-driven insights and reports are crucial for informed decision-making, while robust security measures ensure the protection of sensitive business information. 
* Minimize technical jargon and complex features.
* Allow access and management from smartphones and tablets.
* Offer a pricing model that fits the size and budget of the business.
* Adapt to different business needs and product types.
* Provide insights and reports to support informed decisions.
* Protect business data with strong security measures.
  
**Employees(Inventory Controllers/End-Users):**

In today's dynamic business world, empowering your employees is crucial for efficient inventory management.  A well-designed inventory management app can be a game-changer, streamlining processes and boosting productivity.  The ideal app prioritizes a user-friendly experience with minimal technical jargon and complex features. Instead of overwhelming employees with vast amounts of data, the focus should be on clear task management and visibility into relevant information like current stock levels. An intuitive interface further enhances efficiency, minimizing training time and ensuring everyone can contribute effectively.  Finally, the employee should not have to worry about security therefore robust security measures safeguard sensitive business information, providing both employees and managers peace of mind. By prioritizing user-friendliness and clear functionalities, inventory management apps can empower employees and become valuable tools for a more efficient and collaborative work environment.
* Minimize technical jargon and complex features for a smooth experience.
* Focus on specific tasks relevant to employees, like real-time stock checks or order fulfillment.
* A good design minimizes training time and ensures everyone can contribute effectively.
* Provide limited, relevant data insights that assist with daily tasks (e.g., current stock levels for specific products).
* Maintain strong security measures to protect sensitive business information.

**Suppliers:**

In the world of inventory management, reliable suppliers are a cornerstone of success. Ideal suppliers possess key characteristics that contribute to smooth business operations. They prioritize clear and timely communication, keeping businesses informed about stock availability, potential delays, and any other relevant updates. Additionally, they demonstrate a commitment to accuracy by providing detailed product specifications and ensuring orders are fulfilled according to exact requirements. Furthermore, reliable suppliers offer competitive pricing and flexible payment terms that suit the needs of the business. Finally, a strong track record of dependability and on-time deliveries is crucial for building trust and fostering a long-lasting partnership. By prioritizing communication, accuracy, competitive pricing, and reliable deliveries, suppliers become valuable assets for any business managing inventory effectively.
* Get notifications and clear details of new orders placed by businesses.
* Access detailed order specifications, including quantities, delivery timeframes, and specific product requirements.
* Track order status updates and shipment confirmations in real-time.
* Eliminate confusion through clear communication and accurate order information. This leads to fewer order fulfillment errors and delays.
* Foster a more collaborative relationship with businesses through streamlined communication and order management.

### User Stories

<table>
  <thead>
    <tr>
      <th width="40%">User Story</th>
      <th width="70%">Acceptance Criteria</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>As an administrator, I want to be able to securely login, and manage user accounts. So that I can ensure appropriate access levels are maintained.</td>
      <td>
        <ul>
          <li>I can create new user accounts with specific roles (administrator, inventory controller, end-user).</li>
          <li> I can create, modify, and deactivate user accounts as necessary.</li>
          <li>I can disable or delete user accounts as needed.</li>
          <li>Changes to user accounts are logged in the audit trail for security monitoring.</li>
          <li>From the dashboard, I can see an overview of the team statictics and the team members.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th width="40%">User Story</th>
      <th width="70%">Acceptance Criteria</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>I want to manage user roles and permissions, so that users have appropriate access rights within the system.</td>
      <td>
        <ul>
          <li>The system supports different user roles such as administrator, inventory controller, and end user.</li>
          <li>Each user role has specific permissions and access rights.</li>
          <li>I can modify existing user accounts to update their roles or permissions.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th width="40%">User Story</th>
      <th width="70%">Acceptance Criteria</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>As an employee, I want to be able to securely sign in, and manage my own account settings. So that I can be able to adjust the application according to what I want.</td>
      <td>
        <ul>
          <li>I can view and update my profile information including name, contact details, and preferences.</li>
          <li>I can change my password while logged into my account.</li>
          <li>Dark and Light Mode prefrence example</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th width="40%">User Story</th>
      <th width="70%">Acceptance Criteria</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>As an inventory controller, I want to be able to manage products and stock levels, so that I can ensure accurate inventory records.</td>
      <td>
        <ul>
          <li>I can add new products to the inventory.</li>
          <li>I can add supplier information for each product.</li>
          <li>I can perform stocktake operations to update stock levels.</li>
          <li>I can approve stock requests for items that require approval.I can approve stock requests for items that require approval.</li>
          <li>All inventory-related activities are logged in the audit trail for monitoring purposes.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th width="40%">User Story</th>
      <th width="70%">Acceptance Criteria</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>As a user responsible for inventory monitoring, I want the system to generate alerts when stock levels reach predefined thresholds. So that I can take timely action to replenish inventory
</td>
      <td>
        <ul>
          <li>The system monitors stock levels and expiration dates.</li>
          <li>Alerts are generated when stock levels reach predefined thresholds and the appropriate amount is ordered.</li>
          <li>Alerts are generated when a certain stock reaches close to their expiration dates.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th width="40%">User Story</th>
      <th width="70%">Acceptance Criteria</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>As an administrator, of the inventory management system, I want to view a real-time dashboard showing current stock levels. So that I can have immediate visibility into inventory status.
</td>
      <td>
        <ul>
          <li>The system provides a real-time dashboard showing current stock levels.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th width="40%">User Story</th>
      <th width="70%">Acceptance Criteria</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>As a user managing inventory, I want to search for specific stock items by name, SKU, or supplier and sort them by name, SKU, quantity, or expiration date. So that I can quickly locate and organize inventory items.</td>
      <td>
        <ul>
          <li>The system allows searching for stock items by name, SKU, or supplier.</li>
          <li>Users can sort stock items by name, SKU, quantity, or expiration date.</li>
          <li>Users can filter stock items by supplier, quantity range, or expiration date range.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th width="40%">User Story</th>
      <th width="70%">Acceptance Criteria</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>As an authorized user, I want to edit stock details for inventory items and have all edits logged in the stock transaction history. So that changes to inventory are accurately tracked.
</td>
      <td>
        <ul>
          <li>Authorized users can edit stock details for inventory items.</li>
          <li>All edits are logged in the stock transaction history.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th width="40%">User Story</th>
      <th width="70%">Acceptance Criteria</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>As a user of the inventory management system, I want the system to automatically detect when orders should be created based on predefined rules considering product usage and expiration dates. So that I can ensure timely replenishment of inventory.</td>
      <td>
        <ul>
          <li>The system automatically detects when orders should be created based on predefined rules.</li>
          <li> Rules consider product usage and expiration dates.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>


## Subsystems
### 1. Authentication and Authorization Subsystem
### 2. Team/User Management Subsystem
### 3. Reporting Subsystem
### 4. Inventory Management Subsystem
### 5. Stock Request Subystem
### 6. Supplier Management Subsystem
### 7. Order Placement Subsystem

## Functional Requirements
### 1. Authentication and Authorization Subsystem

<ol>
  <li>Create Account</li>
  <li>Administrator should be able to create a new account securely for their entire business.</li>
  </br>
  <li>The system shall provide a secure login mechanism for administrators and inventory controllers and end users to access the web interface.</li>
  </br>
  <li>The system shall support role-based access control (RBAC) to differentiate between administrators,  inventory controllers and end users.
  <ol>
    </br>
    <li>Administrators shall have full access to all system features and configurations.</li>
    </br>
    <li>Inventory controllers shall have access to add products and supplier information, perform stocktake operations, approve stock requests for some items that have that requirement and also request stock from the system.</li>
    </br>
    <li>End users shall have access to request stock from the system and deprecate the amount used.</li>
  </ol>
  </br>
  <li>The system shall enforce strong password policies for user accounts, including minimum length, complexity, and periodic password changes.</li>
  </br>
  <li>The system shall implement secure password storage using industry-standard encryption techniques, such as salted hashing algorithms.</li>
  </br>
  <li>The system shall provide a password recovery mechanism for users who forget their login credentials.</li>
  </br>
  <li>The system shall automatically log out users after a specified period of inactivity to prevent unauthorized access.</li>
  </br>
  <li>Users should be able to log out of their account, ending the session and requiring re-login to access their account to stop unintended users from accesing system when the correct users are gone.</li>
  </br>
  <li>The system shall maintain an audit trail of user activities, including successful and failed login attempts, for security monitoring purposes.</li>
</ol>

### 2. Team/User Management Subsystem

<ol>
  <li>Team Registration</li>
  <ol>
    </br>
    <li>The system shall allow new users to be registered by administrators. </li>
    </br>
    <li>Administrators shall provide the necessary details for user registration, such as name, email address, username, initial password and user role (administrator, inventory controller, or end user).</li>
    </br>
    <li>The system shall validate the provided email address and ensure it is unique within the system.</li>
    </br>
    <li>Upon successful registration, the system shall send a welcome email to the user's provided email address, containing instructions to set up their account and change their initial password.</li>
  </ol>
  </br>
<li>User Roles and Permissions</li>
  <ol>
    </br>
    <li>The system shall support different user roles, such as administrator, inventory controller and end user.</li>
    </br>
    <li>Each user role shall have specific permissions and access rights within the system.</li>
    </br>
    <li>Administrators shall have the ability to manage user accounts, including creating, modifying, and deactivating user accounts.</li>
  </ol>
  </br>
<li>User Profile Management</li>
  <ol>
    </br>
    <li>The system shall allow users to view and update their profile information, such as name, contact details, and preferences.</li>
    </br>
    <li>Users shall be able to change their password while logged into their account.</li>
  </ol>
  </br>
<li>User Deactivation and Deletion</li>
  <ol>  
    </br>
    <li>The system shall allow administrators to deactivate user accounts, preventing them from accessing the system.</li>
    </br>
    <li>Deactivated user accounts shall be retained in the system for a specified period before being permanently deleted.</li>
    </br>
    <li>The system shall provide a mechanism for administrators to permanently delete user accounts when necessary.</li>
  </ol>
</ol>

### 3. Reporting Subsystem

<ol>
  <li>Generate inventory reports</li>
  <ol>
    </br>
    <li>Provide a report on current stock levels for all products.</li>
    </br>
    <li>Include details such as product name, supplier, quantity, and expiration date.</li>
    </br>
    <li>Allow filtering and sorting of the inventory report based on various criteria (e.g., product category, supplier, expiration date)</li>
  </ol>
  </br>
  <li>Generate stock take reports</li>
  <ol>
    </br>
    <li>Facilitate the process of performing stock takes by generating a report of all products and their expected quantities</li>
    </br>
    <li>Allow inventory personnel to input actual quantities during the stock take process</li>
    </br>
    <li>Highlight discrepancies between expected and actual quantities in the stock take report</li>
    </br>
    <li>Provide a summary of stock take results, including total discrepancies and percentage accuracy</li>
  </ol>
  </br>
  <li>Generate expiration reports</li>
    <ol>
      </br>
      <li>Identify products that are nearing their expiration dates</li>
      </br>
      <li>Generate a report listing products due to expire within a configurable time frame (e.g., 30 days, 60 days)</li>
      </br>
      <li>Include details such as product name, supplier, quantity, and expiration date</li>
      </br>
      <li>Highlight products that have already expired or are critically close to expiration</li>
    </ol>
  </br>
<li>Generate order history reports</li>
  <ol>
    </br>
    <li>Provide a report on the order history for each product</li>
    </br>
    <li>Include details such as order date, supplier, quantity ordered, and order status (e.g., pending, shipped, received)</li>
    </br>
    <li>Allow filtering and sorting of the order history report based on various criteria (e.g., product, supplier, date range)</li>
  </ol>
  </br>
<li>Generate supplier performance reports</li>
  <ol>
    </br>
    <li>Track and report on the performance of suppliers in terms of order fulfillment and delivery timeliness</li>
    </br>
    <li>Calculate key performance indicators (KPIs) such as order fill rate, on-time delivery percentage, and lead time</li>
  </ol>
  </br>
  <li>Enable the export of reports in various formats (e.g., CSV, PDF, Excel) for further analysis or sharing</li>
</br>
<li>Allow anlytics for various reports.</li>
</ol>

### 4. Inventory Management Subsystem

<ol>
  <li>Store inventory item details in a database, including:</li>
  <ol>
    </br>
    <li>Record Product name, description, and SKU</li>
    </br>
    <li>Record Supplier information</li>
    </br>
    <li>Record Expiration dates</li>
    </br>
    <li>Record Current product quantity</li>
  </ol>
  </br>
<li>Monitor stock levels and expiration dates. Generate alerts when stock levels reach predefined thresholds.</li>
  </br>
<li>Provide a real-time dashboard showing current stock levels.</li>
  </br>
<li>Allow searching for specific stock items by name, SKU, or supplier.</li>
  </br>
<li>Enable sorting of stock items by name, SKU, quantity, or expiration date, and filtering by supplier, quantity range, or expiration date range.</li>
  </br>
<li>Allow authorized users to edit stock details, logging all edits in the stock transaction history.</li>
  </br>
<li>Maintain a history of stock transactions for each item, including:</li>
  <ol>
    </br>
    <li>Date/time</li>
    </br>
    <li>Transaction type (add, remove, update)</li>
    </br>
    <li>Quantity change</li>
    </br>
    <li>User who performed the transaction.</li>
    </br>
  </ol>
  <li>Automatically detect when an order should be created based on predefined rules, considering product usage and expiration dates.</li>
</ol>

### 5. Stock Request Subystem

<ol>
<li>Allow authorized end users to request stock from the system, capturing details such as requester, item, quantity, and purpose (inventory controller can specify purposes).</li>
  </br>
<li>Validate stock availability before processing requests and notify requesters about the status of their requests.</li>
  </br>
<li>Update inventory levels upon successful stock requests and notify inventory controllers of the requests.</li>
  </br>
<li>Maintain a history of stock requests for auditing purposes.</li>
</ol>

### 6. Supplier Management Subsystem

<ol>
<li>Store supplier details including name, contact information, and products offered.</li>
  <ol>
    <li> This information will be used to identify and communicate with suppliers when requesting quotes.</li> 
    <li>Push notifications to notify user about supplier communication or issues.</li>
  </ol>
<li>Record and track supplier performance metrics such as delivery time, product quality, and order fulfillment rates.</li>
  <ol>
    <li>This information will be used to evaluate supplier reliability and make informed decisions when placing orders.</li>
  </ol>
<li>Provide an interface for inventory controllers to add, edit, and remove suppliers, as well as search and filter supplier records for efficient retrieval of information.</li>
  <ol>
  <li>This will allow for the maintenance of accurate and up-to-date supplier information.</li>
  </ol>
</ol>

### 7. Order Placement Subsystem

## Use Case Diagrams

<div align="center">
   <h3>1. Authentication and Authorization Subsystem</h3>
   <img src="/media/UseCases/_UseCase1.drawio.png">
</div>
<div align="center">
   <h3>2. </h3>
   <img src="/media/UseCases/_UseCase2.drawio.png">
</div>
<div align="center"> 
   <h3>3. </h3>
   <img src="/media/UseCases/_UseCase3.drawio.png">
</div>
<div align="center">
   <h3>4. </h3>
   <img src="/media/UseCases/_UseCase4.drawio.png">
</div>
<div align="center">
   <h3>5. </h3>
   <img src="/media/UseCases/_UseCase5.drawio.png">
</div>
<div align="center">
   <h3>6. </h3>
   <img src="/media/UseCases/_UseCase6.drawio.png">
</div>
<div align="center">
   <h3>7. </h3>
   <img src="/media/UseCases/_UseCase7.drawio.png">
</div>

## Conslusion
