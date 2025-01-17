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

### User Stories

<table>
  <tbody>
    <tr><td>As an administrator, I want to be able to securely login, and manage user accounts. So that I can ensure appropriate access levels are maintained.</td></tr>
    <tr><td>As an administrator, I want to manage user roles and permissions, so that users have appropriate access rights within the system.</td></tr>
    <tr><td>As an employee, I want to be able to securely sign in, and manage my own account settings. So that I can be able to adjust the application according to what I want.</td></tr>
    <tr><td>As an inventory controller, I want to be able to manage products and stock levels, so that I can ensure accurate inventory records.</td></tr>
    <tr><td>As a user responsible for inventory monitoring, I want the system to generate alerts when stock levels reach predefined thresholds. So that I can take timely action to replenish inventory</td></tr>
    <tr><td>As an administrator, of the inventory management system, I want to view a real-time dashboard showing current stock levels. So that I can have immediate visibility into inventory status.</td></tr>
    <tr><td>As a user managing inventory, I want to search for specific stock items by name, SKU, or supplier and sort them by name, SKU, quantity, or expiration date. So that I can quickly locate and organize inventory items.</td></tr>
    <tr><td>As an authorized user, I want to edit stock details for inventory items and have all edits logged in the stock transaction history. So that changes to inventory are accurately tracked.</td></tr>
    <tr><td>As a user of the inventory management system, I want the system to automatically detect when orders should be created based on predefined rules considering product usage and expiration dates. So that I can ensure timely replenishment of inventory.</td></tr>
  </tbody>
</table>

## Use Cases

### Use Case 1: User Modification

#### Actors:
- Administrator

#### Description:
Enable administrators to modify existing user accounts, such as updating user roles or permissions.

#### Preconditions:
- The administrator is logged into the dashboard.
- The administrator has the necessary permissions to modify user accounts.

#### Post-Conditions:
- The user account is updated with the new roles or permissions.

#### Normal Flow:
1. The administrator logs into the dashboard.
2. The administrator navigates to the user management section.
3. The administrator selects the user account to modify.
4. The administrator updates the user roles or permissions.
5. The administrator saves the changes.
6. The system confirms that the user account has been successfully updated.

#### Alternative Flow:
- If the administrator does not have the necessary permissions, the system displays an error message indicating insufficient permissions.

### Use Case 2: Password Change

#### Actors:
- User

#### Description:
Allow users to change their password while logged into their account.

#### Preconditions:
- The user is logged into their account.
- The user knows their current password.

#### Post-Conditions:
- The user's password is updated.

#### Normal Flow:
1. The user logs into their account.
2. The user navigates to the profile page.
3. The user selects the option to change their password.
4. The user enters their current password.
5. The user enters the new password and confirms it.
6. The user submits the password change request.
7. The system validates the current password and updates to the new password.
8. The system confirms that the password has been successfully changed.

#### Alternative Flow:
- If the current password is incorrect, the system displays an error message and does not update the password.

### Use Case 3: User Deactivation

#### Actors:
- Administrator

#### Description:
Implement the functionality for administrators to deactivate user accounts, preventing them from accessing the system.

#### Preconditions:
- The administrator is logged into the dashboard.
- The administrator has the necessary permissions to deactivate user accounts.

#### Post-Conditions:
- The user account is deactivated and the user can no longer access the system.

#### Normal Flow:
1. The administrator logs into the dashboard.
2. The administrator navigates to the user management section.
3. The administrator selects the user account to deactivate.
4. The administrator selects the option to deactivate the account.
5. The administrator confirms the deactivation.
6. The system deactivates the user account.
7. The system confirms that the user account has been successfully deactivated.

#### Alternative Flow:
- If the administrator does not have the necessary permissions, the system displays an error message indicating insufficient permissions.

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
  <ol>
    <li>
      Enforce strong password policies.
    </li>
    <li>
      Implement secure password storage.
    </li>
    <li>
      Prevent user error through repeat password and regression checks.
    </li>
    <li>
      Warn user on incorrect inputs provided and details as to why it might be incorrect.
    </li>
    </ol>
  </br>
  <li>Log in</li>
  <ol>
    <li>
      Provide secure login for different user roles.
    </li>
    <li>
      Enforce strong password policies.
    </li>
    <li>
      Implement secure password storage.
    </li>
    <li>
      Provide password recovery mechanism.
    </li>
    <li>
      Warn user on incorrect inputs provided and details as to why it might be incorrect.
    </li>
  </ol>
  </br>
  <li>
    Implement role-based access control (RBAC)
  </li>
  <ol>
    <li>
      Grant full access to administrators.
    </li>
    <li>
      Grant product and supplier management access to inventory controllers.
    </li>
    <li>
      Grant stock request and deprecation access to end users.
    </li>
  </ol>
  </br>
  <li>Log out.</li>
  <ol>
    <li>
      Allow users to log out of the system manually requiring re-login to access their account.
    </li>
    <li>
      Automatically log out inactive users requiring re-login to access their account.
    </li>
  </ol>
  </br>
  <li>Auditing.</li>
  <ol>
      <li>
        Maintain a detailed audit trail of user activities within the system for  accountability purposes.
    </li>
    <li>
      The system shall maintain an audit trail of user activities, including successful and failed login attempts, for security monitoring purposes.
    </li>
  </ol>
  </br>
</ol>

### 2. Team/User Management Subsystem

<ol>
  <li>Team Registration</li>
  <ol>
    <li>
      Allow administrators to register new users. Adding necessary user details during registration (name, email, role).
    </li>
    <li>
      Validate ensure unique details addresses.
    </li>
    <li>
      Corrections methods to well as prevent incorrect details.
    </li>
    <li>
      Send welcome email with login link to new team member. Containing instructions to set up their account, change their initial password and set their username.
    </li>
  </ol>
  </br>
<li>Team Member Management</li>
  <ol>
    <li>
      Allow administrators to create accounts.
    </li>
    <li>
      Allow administrators to modify exsisting accounts and permissions.
    </li> 
    <li>
      Allow administrators to deactivate/delete user accounts.
    </li>
  </ol>
  </br>
<li>User Profile Management</li>
  <ol>
    <li>Allow users to view their account and its details.</li>
    <li>
      Allow users to update their profile information, such as name, contact details, and preferences.
    </li>
    <li>
      Users are be able to change their password while logged into their account.
    </li>
  </ol>
  </br>
</ol>

### 3. Reporting Subsystem

<ol>
  <li>
    Generate inventory reports
  </li>
  <ol>
    <li>
      Provide a report on current stock levels for all products.
    </li>
    <li>
      Include details such as product name, supplier, quantity, and expiration date.
    </li>
    <li>
      Allow filtering and sorting of the inventory report based on various criteria (e.g., product category, supplier, expiration date)
    </li>
  </ol>
  </br>
  <li>
    Generate stock take reports
  </li>
  <ol>
    <li>
      Facilitate the process of performing stock takes by generating a report of all products and their expected quantities
    </li>
    <li>
      Allow inventory personnel to input actual quantities during the stock take process
    </li>
    <li>
      Highlight discrepancies between expected and actual quantities in the stock take report
    </li>
    <li>
      Provide a summary of stock take results, including total discrepancies and percentage accuracy
    </li>
  </ol>
  </br>
  <li>
    Generate expiration reports
  </li>
    <ol>
      <li>
        Identify products that are nearing their expiration dates
      </li>
      <li>
        Generate a report listing products due to expire within a configurable time frame (e.g., 30 days, 60 days)
      </li>
      <li>
        Include details such as product name, supplier, quantity, and expiration date
      </li>
      <li>
        Highlight products that have already expired or are critically close to expiration
      </li>
    </ol>
  </br>
<li>
  Generate order history reports
</li>
  <ol>
    <li>
      Provide a report on the order history for each product
    </li>
    <li>
      Include details such as order date, supplier, quantity ordered, and order status (e.g., pending, shipped, received)
    </li>
    <li>
      Allow filtering and sorting of the order history report based on various criteria (e.g., product, supplier, date range)
    </li>
  </ol>
  </br>
<li>
  Generate supplier performance reports
</li>
  <ol>
    <li>
      Track and report on the performance of suppliers in terms of order fulfillment and delivery timeliness
    </li>
    <li>
      Calculate key performance indicators (KPIs) such as order fill rate, on-time delivery percentage, and lead time
    </li>
  </ol>
  </br>
  <li>
    Enable the export of reports in various formats (e.g., CSV, PDF, Excel) for further analysis or sharing
  </li>
  </br>
<li>
  Allow anlytics for various reports.
</li>
  </br>
    <li>
      Allow for exporting of reports
    </li>
  </br>
</ol>

### 4. Inventory Management Subsystem

<ol>
  <li>Store inventory item details in a database:</li>
  <ol>
    <li>Allow admin or inventory controller to decide on table columns of choice</li>
    <li>Allow user to import excel or csv spreedsheet to initialise database</li>
    <li>Allow user to record supplier information</li>
    <li>Allow user to record Expiration dates</li>
    <li>Allow user to record current product quantity</li>
  </ol>
  </br>
    <li>
      Allow for exporting of inventory table.
    </li>
  </br>
<li>Monitor stock levels and expiration dates.</li> 
  <ol>
    <li>Generate alerts when stock levels reach predefined thresholds.</li>
  </ol>
  </br>
<li>Provide a real-time dashboard showing current stock levels.</li>
  </br>
<li>Allow for database matching</li> 
  <ol>
    <li>Allow searching for specific stock items by user choice.</li>
    <li>Enable filtering/sorting of stock items by user choice.</li>
  </ol>
  </br>
<li>Role based access control.</li>
  <ol>
    <li>Allow authorized users to edit stock details, logging all edits in the stock transaction history.</li>
    <li>Prevent unauthorized users to edit stock details, logging all edits in the stock transaction history.</li>
    <li>Allow unauthorized users to view inventory.</li>
  </ol>
  </br>
<li>Maintain a history of stock transactions for each item, including:</li>
  <ol>
    <li>Date/time</li>
    <li>Transaction type (add, remove, update)</li>
    <li>Quantity change</li>
    <li>User who performed the transaction.</li>
  </ol>
  </br>
  <li>Automatically detect when an order should be created based on predefined rules, considering product usage and expiration dates.</li>
  </br>
</ol>

### 5. Stock Request Subystem

<ol>
  <li>Role Based Access control</li>
  <ol>
    <li>Allow authorized all users to request stock from the system</li>
    <li>Capture details such as requester, item, quantity, and purpose (inventory controller can specify purposes) for audit trail.</li>
  </ol>
  </br>
  <li>Monitor Stock</li>
  <ol>
    <li>Validate stock availability before processing requests</li>
    <li>Notify requesters about the status of their requests.</li>
  </ol>
  </br>
  <li>Succesful Requests</li>
  <ol>
    <li>Update inventory levels.</li>
    <li>Notify inventory controllers of the requests.</li>
    <li>Update user activity as well as dashboard.</li>
  </ol>
  </br>
  <li>Unsuccesful Requests</li>
  <ol>
    <li>Notify inventory controllers of the requests.</li>
    <li>autonomously order more stock.</li>
  </ol>
  </br>
  <li>Allow admin to view audit trail.</li>
  </br>
</ol>

### 6. Supplier Management Subsystem

<ol>
<li>Store supplier details including name, contact information, and products offered.</li>
  <ol>
    <li>This information will be used to identify and communicate with suppliers when requesting quotes.</li> 
    <li>Push notifications to notify user about supplier communication or issues.</li>
  </ol>
  </br>
<li>Record and track supplier performance metrics</li>
  <ol>
    <li>This information will be used to evaluate supplier reliability</li>
    <li>Automtion uses this to make an informed decisions when placing orders.</li>
    <li>Performance metrics users can view are delivery time, product quality, and order fulfillment rates.</li>
    <li>When a supplier updates their progress so does the metrics</li>
  </ol>
  </br>
<li>Manage Suppliers.</li>
  <ol>
  <li>Provide a way for inventory controllers and admin to add suppliers</li>
  <li>Provide a way for inventory controllers and admin to edit</li>
  <li>Provide a way for inventory controllers and admin to remove suppliers</li>
  <li>Provide a way for users to search and filter supplier records for efficient retrieval of information</li>
  </ol>
  </br>
</ol>

### 7. Order Placement Subsystem

<ol>
  <li>Purchase order settings</li>
  <ol>
    <li>Edit quote layouts</li> 
    <li>Allow templates with product information and quantities already filled in, for suppliers based on products they have available.</li>
    <li>
      Allow to choose supplier or autonomously select the best choice in supplier.
    </li>
  </ol>
  </br>
  <li>Notified of low stock.</li>
  <ol>
    <li>
      Generate purchase orders autonomously using template when notified of low stock.
    </li>
    <li>
      Send purchase order via email or api to supplier for confirmation of details and order.
    </li>
    <li>
      Update purchase order autonomasly if supplier confirms thier details have changed.
    </li> 
  </ol>
  </br>
  <li>
    Manually generate purchase orders
  </li>
  </br>
  <ol>
    <li>
      Send purchase order via email or api to supplier for confirmation of details and order.
    </li>
    <li>
      Update purchase order autonomasly if supplier confirms thier details have changed.
    </li>
  </ol>
  </br>
<li>
  Track order status (ordered, received, canceled) and expected delivery dates.
</li>
  </br>
<li>
  As tracking order status starts update order fufilment metrics.
</li>
  </br>
<li>
  Maintain a history of placed orders for record-keeping for template use and confirmation of correct information.
</li>
  </br>
<li>
  Evaluate and rate received quotes based on predefined criteria (e.g., price, delivery time, etc.) to assist in selecting the best supplier for each order.
</li>
  </br>
</ol>

## Use Case Diagrams

<div align="center">
   <h3>1. Authentication and Authorization Subsystem</h3>
   <img src="/media/UseCases/_UseCase1.drawio.png">
</div>
<div align="center">
   <h3>2. Team/User Management Subsystem</h3>
   <img src="/media/UseCases/_UseCase2.drawio.png">
</div>
<div align="center"> 
   <h3>3. Reporting Subsystem</h3>
   <img src="/media/UseCases/_UseCase3.drawio.png">
</div>
<div align="center">
   <h3>4. Inventory Management Subsystem</h3>
   <img src="/media/UseCases/_UseCase4.drawio.png">
</div>
<div align="center">
   <h3>5. Stock Request Subystem</h3>
   <img src="/media/UseCases/_UseCase5.drawio.png">
</div>
<div align="center">
   <h3>6. Supplier Management Subsystem</h3>
   <img src="/media/UseCases/_UseCase6.drawio.png">
</div>
<div align="center">
   <h3>7. Order Placement Subsystem</h3>
   <img src="/media/UseCases/_UseCase7.drawio.png">
</div>
