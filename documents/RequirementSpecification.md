# Software Requirement Specification

## Introduction

### Overview
This project involves creating a Smart Inventory web app for businesses.  SmartInventory is a comprehensive web-based inventory management system designed 
to streamline and automate the process of tracking, ordering, and managing stock for businesses, restaurants, and laboratories. The system aims to simplify inventory management by providing a user-friendly interface for administrators, inventory controllers, and end users to capture stock details, request stock, and generate insightful reports.

### Objectives
This document guides stakeholders through the qualities and functionalities of the Smart Inventory System. It details how client requirements are gathered and evaluated using a structured software engineering methodology.

## Users
### User Characteristics
The users of SmartInventory can easily be split into these groups groups: 
* Business Owners
* Employees
* Suppliers

**Business Owners:**

</br>

**Employees:**

</br>

**Suppliers:**

</br>

### User Stories

<table>
  <tr>
    <td>Administrator</td>
    <td>test</td>
  </tr>
</table>
</br>
<table>
  <tr>
    <td>Administrator</td>
    <td>test</td>
  </tr>
</table>
</br>
<table>
  <tr>
    <td>Administrator</td>
    <td>test</td>
  </tr>
</table>
</br>
<table>
  <tr>
    <td>Administrator</td>
    <td>test</td>
  </tr>
</table>

### User Interaction

## Subsystems
### 1. Authentication and Authorization subsystem
### 2. Team/User Management subsystem
### 3. Reporting subsystem
### 4. Inventory Management subsystem
### 5. Stock Request subystem
### 6. Supplier Management subsystem
### 7. Order Placement subsystem

## Functional Requirements

### 1. Authentication and Authorization subsystem

<ol>
  <li>Administrator should be able to create a new account securly for their entire business.</li>
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

### 2. Team/User Management subsystem

<ol>
  <li>Team Registration</li>
  <ol>
    <li>The system shall allow new users to be registered by administrators. </li>
    <li>Administrators shall provide the necessary details for user registration, such as name, email address, username, initial password and user role (administrator, inventory controller, or end user).</li>
    <li>The system shall validate the provided email address and ensure it is unique within the system.</li>
    <li>Upon successful registration, the system shall send a welcome email to the user's provided email address, containing instructions to set up their account and change their initial password.</li>
  </ol>
<li>User Roles and Permissions</li>
  <ol>
    <li>The system shall support different user roles, such as administrator, inventory controller and end user.</li>
    <li>Each user role shall have specific permissions and access rights within the system.</li>
    <li>Administrators shall have the ability to manage user accounts, including creating, modifying, and deactivating user accounts.</li>
  </ol>
<li>User Profile Management</li>
  <ol>
    <li>The system shall allow users to view and update their profile information, such as name, contact details, and preferences.</li>
    <li>Users shall be able to change their password while logged into their account.</li>
  </ol>
<li>User Deactivation and Deletion</li>
  <ol>  
    <li>The system shall allow administrators to deactivate user accounts, preventing them from accessing the system.</li>
    <li>Deactivated user accounts shall be retained in the system for a specified period before being permanently deleted.</li>
    <li>The system shall provide a mechanism for administrators to permanently delete user accounts when necessary.</li>
  </ol>
</ol>

### 3. Reporting subsystem

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

### 4. Inventory Management subsystem

### 5. Stock Request subystem

### 6. Supplier Management subsystem

### 7. Order Placement subsystem

## Use Case Diagrams

<div align="center">
   <h3>1. </h3>
   <img src="/media/">
</div>
<div align="center">
   <h3>2. </h3>
   <img src="/media/">
</div>
<div align="center"> 
   <h3>3. </h3>
   <img src="/media/">
</div>
<div align="center">
   <h3>4. </h3>
   <img src="/media/">
</div>
<div align="center">
   <h3>5. </h3>
   <img src="/media/">
</div>
<div align="center">
   <h3>6. </h3>
   <img src="/media/">
</div>
