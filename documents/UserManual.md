# User Manual
## Introduction
The purpose of this document is to assist users in becomming familiar with our application and to ensure that they have a flawless experience using our various features throughout. We will break it down into simple components as to simplify the process.

## Account Management

<hr>
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
* Then redirects them to the reset password page.
  * There they should follow the reset password section of the manual.

<br>
  
**Create Account:**
* If an account has not been created the user can choose to click on the create account link to take them to the page to create an account.
* There the user should follow the create account steps provided below.

<br>

<div align="center">
  <h3>Create Account</h3>
  <img src="/media/wireframes/CreateAcc_dark.png">
</div>

**Create Account with details:**
* An admin user will be brought to this page when they open the app at their own volition, allowing them to take further action.
* The admin user will enter their name, surname, the companies name, their email or the companies email, a password and be asked to repeat that same password in the corresponding fields.
* The admin is asked to repeat the password for validation purposes and to make sure correct password is given.
* The user will now be able to press the Create Account button to allow them to take further actions on the actual system(only if the details provided are correct).
* If the details are incorrect the admin user will be notified with error messages over the field that they have provided incorrect details to.
* The admin user can choose to try again to correctly input the details.
    
<br>
  
**Log In:**
* If an account has been created the user can choose to click on the Log In link to take them to the page to log into an account.
* There the user should follow the log in account steps provided above.

<br>

<div align="center">
  <h3>Reset Password</h3>
  <img src="/media/wireframes/CreateAcc_dark.png">
</div>

**Reset Pasword:**
* A user will be brought to this page either through when "forgot password?" link is pressed on the sign in page.
* The user will need to provide their email to get email for verification code.
  *  Once input is provided and is correct they can press the send code button to recive the code to change their password.
    
**If a user wants to go back to sign in:**
*  User should click on he "Back to sign in" link redirecting them to sign in.

<div align="center">
  <h3>Dashboard</h3>
  <img src="/media/Pages/Dashboard/Dashboard - Dark.png">
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
  <h3>Inventory</h3>
  <img src="/media/wireframes/CreateAcc_dark.png">
</div>

**Sidebar:**
* To direct to the inventory page a user should go to the sidebar and click on the inventory icon.
    
**Quick Actions:**
The "Quick Actions" button is located in the top right corner. Most of the functionality for all pages can be found here. More information on the actions can be found below:
* Export To Excel:
  * To export to excel the user should click on quick actions to see the drop down.
  * Then they should select the "Export to excel" option.
  * This will automatically download the file to thier downloads on their device.
* Import To Excel:
  * To import to excel the user should click on quick actions to see the drop down.
  * Then they should select the "Import to excel" option.
  * This will open a pop up for the user to select a file to import into the table.
* Add Item:
  * To add an item to inventory the user should click on quick actions to see the drop down.
  * Then they should select the "Add iTem" option.
  * This will open a pop up for the user to add details regarding the item they would like to add.
  * Once filled in the user can enter the tem by clicking the submit button.
* Remove Item
  * Firstly a user should click on the item they would like to remove. Once the row is highlighted in blue. 
  * To remove an item from inventory the user should click on quick actions to see the drop down.
  * Then they should select the "Remove Item" option.
  * This will open a pop up for the user to verify that they want to delete the item.
  * If user does want to delete the item they can click on yes otherwise no.
* Remove Multiple Items
  * Firstly a user should "CTRL" click the items they would like to remove. Once the rows are highlighted in blue. 
  * To remove the items from inventory the user should click on quick actions to see the drop down.
  * Then they should select the "Remove Item" option.
  * This will open a pop up for the user to verify that they want to delete the item.
  * If user does want to delete the item they can click on yes otherwise no.
* Request Item:
  * Firstly a user should click on the item they would like to request. Once the row is highlighted in blue.
  * To request an item to inventory the user should click on quick actions to see the drop down.
  * Then they should select the "Request Item" option.
  * This will open a pop up for the user to choose the quantity of the item they would like to request.
  * Once filled in the user can request the item by clicking the submit button.
    
**Search and Select:**
The search and select options can be found in the top left side of the page how to use it will be described below:
* A user can search for and item by fristly selecting a column they would like to search.
* Once they have selected the column from the dropdown they must enter what they would like to search for in the serach bar.
* As the user types it will adapat the table to contain the matching results.

**Sorting and Filtering:**
* To sort a column all a user has to do is click on the column heading of the column they want to sort according to.
* The arrow will be visible so a user can be aware of if its ascendimg or decending order.
* To filter the user must press on the filter icon that will be visible when hovering over the column heading and filter accrding to their choice.

**Editing:**
* To edit a user must simply double click on the cell that they would like to adjust.
* This will highlight the cells contents in blue allowing them to chnage the contents.
* Once a user is satisfied the user should press enter to update the value.

<div align="center">
  <h3>Suppliers</h3>
  <img src="/media/wireframes/CreateAcc_dark.png">
</div>
**Sidebar:**
* To direct to the suppliers page a user should go to the sidebar and click on the supplier icon.
    
**Quick Actions:**
The "Quick Actions" button is located in the top right corner. Most of the functionality for all pages can be found here. More information on the actions can be found below:
* Export To Excel:
  * To export to excel the user should click on quick actions to see the drop down.
  * Then they should select the "Export to excel" option.
  * This will automatically download the file to thier downloads on their device.
* Import To Excel:
  * To import to excel the user should click on quick actions to see the drop down.
  * Then they should select the "Import to excel" option.
  * This will open a pop up for the user to select a file to import into the table.
* Add Supplier:
  * To add an item to inventory the user should click on quick actions to see the drop down.
  * Then they should select the "Add Supplier" option.
  * This will open a pop up for the user to add details regarding the supplier they would like to add.
  * Once filled in the user can enter the supplier by clicking the submit button.
* Remove Supplier
  * Firstly a user should click on the supplier they would like to remove. Once the row is highlighted in blue. 
  * To remove an supplier from suppliers the user should click on quick actions to see the drop down.
  * Then they should select the "Remove Supplier" option.
  * This will open a pop up for the user to verify that they want to delete the supplier.
  * If user does want to delete the supplier they can click on yes otherwise no.
* Remove Multiple Supplier
  * Firstly a user should "CTRL" click the suppliers they would like to remove. Once the rows are highlighted in blue. 
  * To remove the suppliers from suppliers table the user should click on quick actions to see the drop down.
  * Then they should select the "Remove Supplier" option.
  * This will open a pop up for the user to verify that they want to delete the supplier.
  * If user does want to delete the supplier they can click on yes otherwise no.
    
**Search and Select:**
The search and select options can be found in the top left side of the page how to use it will be described below:
* A user can search for and item by fristly selecting a column they would like to search.
* Once they have selected the column from the dropdown they must enter what they would like to search for in the serach bar.
* As the user types it will adapat the table to contain the matching results.

**Sorting and Filtering:**
* To sort a column all a user has to do is click on the column heading of the column they want to sort according to.
* The arrow will be visible so a user can be aware of if its ascendimg or decending order.
* To filter the user must press on the filter icon that will be visible when hovering over the column heading and filter according to their choice.

**Editing:**
* To edit a user must simply double click on the cell that they would like to adjust.
* This will highlight the cells contents in blue allowing them to chnage the contents.
* Once a user is satisfied the user should press enter to update the value.

<div align="center">
  <h3>Suppliers</h3>
  <img src="/media/wireframes/CreateAcc_dark.png">
</div>
**Sidebar:**
* To direct to the team page a user should go to the sidebar and click on the team icon.
    
**Quick Actions:**
The "Quick Actions" button is located in the top right corner. Most of the functionality for all pages can be found here. More information on the actions can be found below:
* Export To Excel:
  * To export to excel the user should click on quick actions to see the drop down.
  * Then they should select the "Export to excel" option.
  * This will automatically download the file to thier downloads on their device.
* Add Member:
  * To add an Member to team the user should click on quick actions to see the drop down.
  * Then they should select the "Add Member" option.
  * This will open a pop up for the user to add details regarding the Member they would like to add.
  * Once filled in the user can enter the supplier by clicking the submit button.
    
**Search and Select:**
The search and select options can be found in the top left side of the page how to use it will be described below:
* A user can search for and item by fristly selecting a column they would like to search.
* Once they have selected the column from the dropdown they must enter what they would like to search for in the serach bar.
* As the user types it will adapat the table to contain the matching results.

**Sorting and Filtering:**
* To sort a column all a user has to do is click on the column heading of the column they want to sort according to.
* The arrow will be visible so a user can be aware of if its ascendimg or decending order.
* To filter the user must press on the filter icon that will be visible when hovering over the column heading and filter according to their choice.

**Editing:**
* To edit a user must simply double click on the cell that they would like to adjust.
* This will highlight the cells contents in blue allowing them to chnage the contents.
* Once a user is satisfied the user should press enter to update the value.

**Delete:**
* To delete a memeber from the team a user must simply click on the delete button located in that members row.
  * This will open a pop up for the user to verify that they want to delete the memeber.
  * If user does want to delete the member they can click on yes otherwise no.
 
<div align="center">
  <h3>Orders</h3>
  <img src="/media/wireframes/CreateAcc_dark.png">
</div>

**Sidebar:**
* To direct to the orders page a user should go to the sidebar and click on the order icon.
    
**Quick Actions:**
The "Quick Actions" button is located in the top right corner. Most of the functionality for all pages can be found here. More information on the actions can be found below:
* Export To Excel:
  * To export to excel the user should click on quick actions to see the drop down.
  * Then they should select the "Export to excel" option.
  * This will automatically download the file to thier downloads on their device.
* Create Order:
  * To create an order the user should click on quick actions to see the drop down.
  * Then they should select the "Create Order" option.
  * This will open a pop up for the user to add details regarding the order they would like to create.
  * Once filled in the user can enter the order by clicking the submit button.
* Cancel Order:
  * Firstly a user should click on the order they would like to cancel. Once the row is highlighted in blue. 
  * To cancel the order the user should click on quick actions to see the drop down.
  * Then they should select the "Cancel Order" option.
  * This will open a pop up for the user to verify that they want to cancel the order.
  * If user does want to cancel the order they can click on yes otherwise no.
    
**Search and Select:**
The search and select options can be found in the top left side of the page how to use it will be described below:
* A user can search for and item by fristly selecting a column they would like to search.
* Once they have selected the column from the dropdown they must enter what they would like to search for in the serach bar.
* As the user types it will adapat the table to contain the matching results.

**Sorting and Filtering:**
* To sort a column all a user has to do is click on the column heading of the column they want to sort according to.
* The arrow will be visible so a user can be aware of if its ascendimg or decending order.
* To filter the user must press on the filter icon that will be visible when hovering over the column heading and filter accrding to their choice.
