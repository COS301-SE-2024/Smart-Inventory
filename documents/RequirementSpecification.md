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
  1. Administrator should be able to create a new account securly for their entire business. 

  2. The system shall provide a secure login mechanism for administrators and inventory controllers and end users to access the web interface.

  3. The system shall support role-based access control (RBAC) to differentiate between administrators,  inventory controllers and end users.
    1. Administrators shall have full access to all system features and configurations.
    2. Inventory controllers shall have access to add products and supplier information, perform stocktake operations, approve stock requests for some items that have that requirement and also request stock from the system.
    3. End users shall have access to request stock from the system and deprecate the amount used.

  4. The system shall enforce strong password policies for user accounts, including minimum length, complexity, and periodic password changes.

  5. The system shall implement secure password storage using industry-standard encryption techniques, such as salted hashing algorithms.

  6. The system shall provide a password recovery mechanism for users who forget their login credentials.

  7. The system shall automatically log out users after a specified period of inactivity to prevent unauthorized access.

  8. Users should be able to log out of their account, ending the session and requiring re-login to access their account to stop unintended users from accesing system when the correct users are gone.

  9. The system shall maintain an audit trail of user activities, including successful and failed login attempts, for security monitoring purposes.

### 2. Team/User Management subsystem

### 3. Reporting subsystem
1. Generate inventory reports
  1. Provide a report on current stock levels for all products.
  2. Include details such as product name, supplier, quantity, and expiration date.
  3. Allow filtering and sorting of the inventory report based on various criteria (e.g., product category, supplier, expiration date)

2. Generate stock take reports
  1. Facilitate the process of performing stock takes by generating a report of all products and their expected quantities
  2. Allow inventory personnel to input actual quantities during the stock take process
  3. Highlight discrepancies between expected and actual quantities in the stock take report
  4. Provide a summary of stock take results, including total discrepancies and percentage accuracy

3. Generate expiration reports
  1. Identify products that are nearing their expiration dates
  2. Generate a report listing products due to expire within a configurable time frame (e.g., 30 days, 60 days)
  3. Include details such as product name, supplier, quantity, and expiration date
  4. Highlight products that have already expired or are critically close to expiration

4. Generate order history reports
  1. Provide a report on the order history for each product
  2. Include details such as order date, supplier, quantity ordered, and order status (e.g., pending, shipped, received)
  3. Allow filtering and sorting of the order history report based on various criteria (e.g., product, supplier, date range)


6. Generate supplier performance reports
  1. Track and report on the performance of suppliers in terms of order fulfillment and delivery timeliness
  2. Calculate key performance indicators (KPIs) such as order fill rate, on-time delivery percentage, and lead time

7. Enable the export of reports in various formats (e.g., CSV, PDF, Excel) for further analysis or sharing

8. Allow anlytics for various reports.

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
