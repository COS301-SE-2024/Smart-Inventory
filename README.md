# Getting Started Guide

This guide will walk you through setting up and running our Angular app with AWS Amplify integration on your local machine.

## Prerequisites

Before you begin, ensure that you have the following installed on your machine:

- Node.js (version 12 or later)
- npm (version 6 or later)
- Angular CLI
- AWS CLI

## Setup Steps

1. Install Node.js and npm:
   - Visit the official Node.js website: [https://nodejs.org](https://nodejs.org)
   - Download the latest LTS version of Node.js for your operating system.
   - Follow the installation instructions for your operating system.
   - After installation, verify that Node.js and npm are installed correctly by running the following commands in your terminal:
     ```
     node --version
     npm --version
     ```

2. Install Angular CLI:
   - Open your terminal and run the following command to install Angular CLI globally:
     ```
     npm install -g @angular/cli
     ```
   - Verify that Angular CLI is installed correctly by running the following command:
     ```
     ng version
     ```

3. Install AWS CLI:
   - Visit the official AWS CLI installation guide: [https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
   - Follow the installation instructions for your operating system.
   - After installation, verify that AWS CLI is installed correctly by running the following command:
     ```
     aws --version
     ```

4. Navigate to the cloned repository directory:
   - Open your terminal and navigate to the `Smart-Inventory` repository directory in your `GitHub` folder.
   - Run the following command:
     ```
     cd ~/Documents/GitHub/Smart-Inventory
     ```

5. Install the project dependencies:
`npm install`

6. Configure AWS CLI:
    - Run `aws configure` in your terminal.
    - Provide your access key and secret access key when prompted.

7. Start the Amplify sandbox:
   - Run the following command:
     ```
     npx ampx sandbox
     ```
    - Wait for the `npx ampx sandbox` command to finish running. This may take a few minutes.

## Running the App

To run the app locally, use the following command:
```
ng serve
```
Open your browser and navigate to `http://localhost:4200` to see the app in action.

That's it! You should now have the Angular app with AWS Amplify integration running on your local machine. If you encounter any issues or have further questions, please don't hesitate to reach out to the team.