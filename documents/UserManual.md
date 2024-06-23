# User Manual
## Introduction
The purpose of this document is to assist users in becomming familiar with our application and to ensure that they have a flawless experience using our various features throughout. We will break it down into simple components as to simplify the process.

## Account Management

<div align="center">
  <h3>Sign in</h3>
  <img src="/media/wireframes/Signin2_dark.png">
</div>

**Sign In with details:**
A user will be brought to this page either through an email link or when they open the app at their own volition, allowing them to take further action.
* Through the link:
  * The link will be received from the team admin when they have created and account for their company and added you to the team through the interface. 
* Through the users own initiative:
  * Users that want to sign in without the use of a link must either be an admin or they should have previously signed in using the link.
* The Process:
  * The user will use the email they were emailed the link with as the password the team leader has chosen and disclosed with the member.
  * Once the user has filled in their user name, email and password the user can click on remember me to avoid filling in details everytime they want to use the system.
  * The user will now be able to press the Sign In button to allow them to take further actions on the actual system(only if the details provided are correct). They will also be added to the correct team once they have been validated.
  * If the details are incorrect the user will be notified with error messages over the field that they have provided incorrect details to.
  * The user can choose to try again to correctly input the details.
    
<br>

**Forgot password:**
* If a user has not been given a password or has forgotten it they can press the 'forgot password?' link.
* This will firstly send the email to the admin user of the team the email provided is apart of to make them aware of the sign in attempt.
* The user asking for the change will also receive a mail to verify the account and to change the password.
* If a user is signed in the can also change the password in their settings.

<br>
  
**Create Account:**
* If an account has not been created the user can choose to click on the create account link to take them to the page to create an account.
* There the user should follow the create account steps provided below.

<br>

<div align="center">
  <h3>Create Account</h3>
  <img src="/media/wireframes/CreateAcc_dark.png">
  <img src="/media/wireframes/CreateAcc_light.png">
</div>

**Create Account with details:**
* An admin user will be brought to this page when they open the app at their own volition, allowing them to take further action.
* The admin user will enter their name, surname, the companies name, their email or the companies email, a password and be asked to repeat that same password in the corresponding fields.
* The admin is asked to repeat the password for validation purposes and to make sure correct password is given.
* Once the admin user has filled in these details they should agree on the terms and conditions as well to consent to the apps terms and conditions.
* The user will now be able to press the Create Account button to allow them to take further actions on the actual system(only if the details provided are correct).
* If the details are incorrect the admin user will be notified with error messages over the field that they have provided incorrect details to.
* The admin user can choose to try again to correctly input the details.
    
<br>
  
**Log In:**
* If an account has been created the user can choose to click on the Log In link to take them to the page to log into an account.
* There the user should follow the log in account steps provided above.

<br>

**Dark or Light mode display:**
* The user can also choose their page display setting through the toggle button in the bottom right corner according to their preference.
* This display preference can be changed in settings in the actual system when account has been created.

<br>

## System Overview

<div align="center">
  <h3>Dashboard</h3>
  <!-- <img src="/media/Pages/Dashboard/Dashboard - Dark.png"> -->
  <img src="/media/Pages/Dashboard/Dashboard - Light.png">
</div>

**Dashboard:**
Once an account is created or a user signs in they will be taken to the Dashboard page. It provides a comprehensive view of key performance indicators and metrics essential for managing inventory and order fulfillment. Below is a detailed explanation of each section and its functionality:

<br>

## Navigation
The side bar can be found on the left hand side of the page. 
* Close Sidebar:
  * The sidebars default is to be open to close it for more space you can click the hamburger button at the top of it which should colapse it.
* Open Siebar:
  * The sidebars default is to be open but if it has been closed you can click on the humburger menu to open it on your page once again. 
* The Sidebar Choices:
  * Dashboard: The home icon represents the dashboard. Overview of activities and customization of what activities you would like to keep track of in the same place.
  * Inventory: The table icon is used to represent the inventory tab. This is the inventory that the bussiness possesses. Here inventory can be added and removed. Exel spreadsheets can be imported or exported. User can also search for inventory as well as filter it.
  * Reports: Analytics and reports for diffrent types of information.
  * Requests: 
  * Suppliers: The truck icon represents the suppliers tab. This is where the suppliers for the company can be found. Suppliers can be added and removed. Suplliers can be contacted with here as well as track suppliers.
  * Orders: This is where the order for the company can be found. Orders can be added and removed. Orders can be tracked and excel spreedsheets can be imported and exported.
  * Settings: The gear icon is the settings choice. This is where personalization of your account is achieved.
  * Log Out: The bottom most button is the log out button so that a user can log out of their account for security purposes.
* Use Sidebar:
  * To use the sidebar to navigate all that is needed to do is if the sidebar is closed open it.
  * When the sidebar is open read which of the above choices you would like to navigate to click on it and it will navigate you to the page.

## Top Metrics

For each of the top metrics, when the mouse is placed above their respective icons, a tooltip that describe in short the metric will appear

- **Inventory Levels**: Displays the current inventory count. Clicking n its icon, can send a user to the inventory page for further details.
- **Avg Fulfillment Time**: Shows the average time taken to fulfill orders, measured in hours. A lower time indicates more efficient processing.
- **Backorders**: Indicates the number of orders that are currently backlogged and awaiting fulfillment.
- **Top Seller**: Highlights the top-selling product for quick reference.

## Graphs and Reports

### Requests
- **Total Requests**: Indicates the total number of requests received.
- **Fulfilled Requests**: Shows the number and percentage of requests that have been successfully fulfilled.
- **Pending Requests**: Displays the number of requests that are still being processed.

### Backorders
- **Current Backorders**: The number of orders that have not yet been fulfilled and are delayed.
- **Average Delay**: The average time delay, in days, that backordered items are experiencing.
- **Longest Backorder Item**: The specific item that has been backordered the longest, along with the number of days delayed.

### Detailed Monthly Report
- This bar chart displays the monthly distribution of requests or backorders, giving a month-by-month analysis that helps in forecasting and planning.

## Action Buttons

- **See Reports**: This button allows users to access more detailed reports and data analytics for deeper insights into the inventory and sales metrics.

## User Information

- The top right corner displays the current user's name (e.g., John Doe) and role (e.g., Admin), indicating who is logged into the dashboard.

## Help Options

The "Help Options" button located in the bottom right of the dashboard offers quick access to various support and configuration tools. Here's a breakdown of each option available in the menu:

### Chart Options
- **Bar Chart**: Select this option to add a bar chart widget to your dashboard.
- **Donut Chart**: Choose this option to add a donut chart widget to your dashboard.
- **Area Chart**: Select this to add an area chart widget to the dashboard.

### Widget Management
- **Add a Widget**: Hover over this option to see further choices such as 'Bar Chart', 'Donut Chart', and 'Area Chart' to add these specific widgets to the dashboard.
#### Delete a Widget
The "Delete a Widget" option allows you to remove widgets you no longer need from the dashboard. This action helps streamline your dashboard's interface by keeping only the most useful information visible. Here’s how to use this feature:

1. **Access the Widget Deletion Interface**: Select the "Delete a Widget" option from the Help Options menu. This will trigger a modal where all dashboard widgets are displayed.

2. **Mark Widgets for Deletion**:
   - Each widget in the deletion interface will have a small trash can icon next to it. 
   - Click the trash can icon for each widget you wish to delete. Clicking the icon will mark the widget for deletion, indicated by a visual change (such as the widget being greyed out or a checkmark appearing on the icon).

3. **Confirm or Undo Deletions**:
   - After selecting the widgets you want to delete, you have two options:
     - **Confirm Deletions**: Click the "Confirm Deletions" button to permanently remove the marked widgets from your dashboard.
     - **Undo**: If you change your mind, you can click the "Undo" button to unmark any widgets selected for deletion and keep them on your dashboard.

4. **Completion**:
   - Upon confirming the deletions, the widgets will be removed, and a user will be taken back to the dashboard.
   - If you choose to undo the deletion, the widgets will remain on your dashboard as before, and no changes will be made.

This feature provides a flexible way to customize the dashboard to fit your specific needs, ensuring that only relevant and necessary widgets are displayed.


### Additional Tools
- **Help**: By taking the user to the help page. Users will access detailed documentation and support resources to assist with any queries or issues you may encounter while using the dashboard.
- **Settings**: By taking the user to the settings page. Adjust settings related to your account and dashboard preferences.

<div align="center">
  <h3>Settings</h3>
  <!-- <img src="/media/Pages/Dashboard/Dashboard - Dark.png"> -->
  <img src="/media/Pages/Settings/Settings - Profile.png">
</div>

**Settings:**
The Settings page allows users to manage their personal details, account security, and application preferences. This guide provides step-by-step instructions on how to use each feature within the Settings page.

## Profile Tab

### Personal Details
- **Updating Name and Email**:
  1. Within the Profile tab, locate the fields for 'Name' and 'Email'.
  2. Enter the new details into the appropriate fields.

### Password
- **Changing Your Password**:
  1. In the 'Password' section, input your current password.
  2. Type your new password and confirm it in the designated fields.
  3. Click 'Change Password' to secure your account with the new password.

### Delete Account
- **How to Delete Your Account**:
  1. Scroll to the 'Delete Account' button at the bottom of the Profile tab.
  2. Click 'Delete Account' and confirm your decision with the correct details.
  3. Please note that this action is irreversible.

## Settings Tab

### Theme Settings
- **Choosing a Theme**:
  1. Toggle between 'Light Mode' and 'Dark Mode' to suit your visual preference.
  2. The interface will update immediately to reflect your choice.

### Notification Triggers
- **Setting Up Notifications**:
  1. Under 'Notification Triggers', you can opt to receive notifications for specific inventory-related events.
  2. Check the boxes next to events like 'Low Stock', 'New Inventory Added', or specific updates you wish to be alerted about.

### Tips for Effective Configuration:
- **Stay Updated**: Regularly review and update your personal information to ensure that all communications and notifications are correctly received.
- **Enhance Security**: Change your password periodically to maintain account security.
- **Customize Your Experience**: Adjust theme settings and notification preferences to make the app more comfortable and useful to you.


<div align="center">
  <h3>Help</h3>
  <!-- Container for images -->
  <div style="display: flex; flex-wrap: wrap; justify-content: space-around; align-items: center; gap: 20px; max-width: 800px; margin: auto;">
    <!-- First Row -->
    <div style="flex: 1 1 50%; text-align: center; min-height: 300px;">
      <img src="/media/Pages/Help/FAQs.png" style="width: 100%; max-width: 300px; max-height: 300px;">
    </div>

  </div>
</div>



**Help:**
The Help page is designed to provide users with quick access to frequently asked questions (FAQs) and guides across various categories related to the application's functionality. 

## Navigating the Help Page

- **FAQs**: This section is divided into tabs corresponding to different aspects of the application, such as General, Dashboard, Inventory, Team, Suppliers, and Orders. Each tab contains a list of common questions related to that category.

- **Troubleshooting**: Users can find solutions to common issues and troubleshooting tips to resolve common problems quickly.

- **User Guides**: Detailed guides are available to assist users in navigating through the application's features and functionalities.

## FAQs

Here is a brief overview of the types of questions and guides you can find under each category:

### General

- **How to reset my password?**
  - Navigate to settings in your profile and find the password section.
  - Click on the "Change Password" button and fill in the required details to change your password.

- **How to remember my password on sign in?**
  - Currently, remembering a forgotten password is not possible, but you can replace it with a new one.
  - Navigate to the login page, log out, and click on "forget password".
  - You will receive an email with a verification code to change it.

- **How to change my email?**
  - Go to settings in your profile and locate the "Details" section.
  - Click on the "Change Email" button and fill in the required details to update your email.

- **How to change my name?**
  - In your profile settings under the "Details" section, find the name input box.
  - Type in your new name and save the changes.

### Dashboard

- **How to add a widget?**
  - On the dashboard, click the "Help Options" button.
  - From the dropdown menu, select "Add Widget" and choose the type of widget you want.
  - The new widget will appear at the bottom of the page.

- **How to move a widget?**
  - Click and hold a widget, then drag it to a new location on the dashboard to rearrange for better visibility or workflow.

- **How to remove a widget?**
  - Click on the widget and while highlighted, click on "Help Options".
  - Choose the delete option from the dropdown.

### Inventory

- **How to add inventory?**
  - On the inventory page, click the "Quick Actions" button.
  - Select "Add Item" from the dropdown, which opens a pop-up window where you can enter item details.
  - Fill out the form and click "Submit".

- **How to remove inventory?**
  - On the inventory page, left click on the row you want to remove.
  - Click "Quick Actions" and select "Remove Item" from the dropdown.
  - Confirm the deletion in the pop-up window.

- **How to edit inventory?**
  - Double click on the cell you want to change.
  - After editing, press enter to save the changes.

### Team

- **How to add a member to my team?**
  - On the team page, click "Quick Actions".
  - Choose "Add Member", fill in the details in the pop-up, and submit.

- **How to remove a member from my team?**
  - On the team page, select the delete option in the corresponding row of the person you want to remove.
  - Confirm the deletion.

- **How to edit a member of my team's details?**
  - Double click on the cell you want to change.
  - After editing, press enter to finalize the changes.

### Suppliers

- **How to add a supplier?**
  - On the supplier page, click "Quick Actions".
  - Choose "Add Supplier", fill in the details in the pop-up, and submit.

- **How to remove a supplier?**
  - On the supplier page, left click on the row you want to remove.
  - Click "Quick Actions" and select "Remove Item" from the dropdown.
  - Confirm the deletion in the pop-up window.

- **How to edit supplier details?**
  - Double click on the cell you want to change.
  - After editing, press enter to finalize the changes.

### Orders

- **How to cancel orders?**
  - Navigate to the orders page.
  - Select the order you wish to cancel and follow the steps provided to cancel it.

## Troubleshooting

This section addresses common problems that users might encounter, providing clear instructions on how to resolve them.

### Common Issues

- **Cannot login**
  - Ensure you have a good network connection.
  - Verify that you are providing the correct login details.
  - If the password is still reported as incorrect, click on "forgot password."
  - For persistent issues, please contact us.

- **Forget password verification code not sent**
  - Confirm you are checking the correct email address.
  - Ensure you have an internet connection.
  - If the code does not arrive, click "resend code."
  - If issues persist, please contact us.

- **Cannot create an account**
  - If you received a login link, there's no need to create an account as it has been created by your admin. Just verify your email and set your password.
  - If you are an admin, ensure you are not using an email that's already registered.
  - For additional help, please contact us.

- **Cannot add or remove from tables**
  - End-Users do not have the permission to modify tables.
  - Inventory Controllers and Administrators should ensure they are following the correct procedures (refer to [FAQs](#faqs) or [User Guides](#user-guides)).
  - For more complex issues, please contact us.

- **Cannot add or remove team member**
  - Only Administrators have the ability to manage team members.
  - Verify that you are following the correct procedures (refer to [FAQs](#faqs) or [User Guides](#user-guides)).
  - For unresolved issues, please contact us.

- **Error Codes**
  - **404**: Server is down or not found. Check the server status or URL.

- **Bugs**
  - If you identify a bug, please do contact us immediately so we can address the issue promptly.

## User Guides

Detailed step-by-step guides are provided for various functionalities of the system. These guides are designed to help users fully utilize all aspects of the software.

### Key Areas Covered

- **Introduction**
  - Overview of SmartInventory capabilities and design philosophy.

- **Roles**
  - Detailed descriptions of different user roles and their permissions.

- **Dashboard**
  - Instructions on how to customize and manage the dashboard widgets.

- **Inventory**
  - Guidelines on how to manage inventory, including adding, editing, and removing items.

- **Reports**
  - How to generate various types of reports.

- **Team**
  - Managing team members including adding, removing, and editing team profiles.

- **Suppliers**
  - Steps for managing supplier information.

- **Orders**
  - Instructions on how to process orders, including modifications and cancellations.

- **Video Tutorial**
  - Links to video tutorials that provide visual guidance on using the system.

## Contact Support

For direct assistance or when you encounter issues not covered in the manuals or troubleshooting:

- **How can we help?**
  - Access the contact form to submit any queries directly to support.
  - Fill out your name, email address, and a detailed message describing your issue or question.
  - Click 'Send' to submit your request. Support staff will respond to your inquiries as quickly as possible.



The Help page is an essential resource for users to understand how to utilize the application effectively, troubleshoot issues, and get detailed instructions for specific tasks. Users are encouraged to explore this section to enhance their proficiency with the application.

