<div align="center">
    <img src="documents/media/.png" width="50%" height="50%">
</div>

# Helix - SmartInventory - Smart Inventory System to track and organise inventory
## About
<div align="center">
    <img src="documents/media/.png" width="50%" height="50%">
</div>
<hr>
</br>

## Git Strategy - Git Flow

<img src="/media/GitFolwStrategy.png">

### Git Structure
This project follows a mono-repo structure. 
* This means that all code, documentation, and resources are stored within this single repository.

### Git Organisation and Management
#### Branches:
* main: This branch contains the final, production-ready code.
    * No direct commits are permitted and all changes must come in a pull-request from a release branch.
* develop: All current development happens in this branch. This includes features, tests and fixes.
* feature: Feature branches are branched off the develop branch to add functionalities and to fix bugs.
* documentation: This is the branch used for documentation related content and layout commits.
* hotfix: This branch is created when a quick or crucial changes need to be made once all repo branches are merged into the main.

#### Pull Request Workflow:
1. Developers create feature branches from the develop.
2. Upon the completion of a feature, a pull-request into develop is created.
3. Automated lints and tests are used to validate changes.
4. A pull-request must be reviewed by at least 1 other team member before merging into develop.

#### Code Review Process:
Reviews focus on checking that coding standards are being followed and that any issues brought on by miscommunication are cleared up early on.

> [!NOTE]  
> Use of issues as well as naming conventions of branches can be found in the coding standards documentation.

<hr>
</br>

## ✨Current Key Features
### 1. Sign In and Create Account
* Sign in with email and password.
* Create account for a team.
* Receive temporary pin for secure access.
  
### 2. Team Management
* Add team member.
* Remove team member.
* Assign roles.
* Edit roles.
  
### 3. Settings
### 4. Help

<hr>
</br>

## 📂Documents
  📄
  <a href="documents/RequirementSpecification.md">
    Software Requirement Specification
  </a>
  
  ##

  📄
  <a href="documents/ArchitecturalSpecification.md">
    Architectural Specification
  </a>
  
  ##

  📄
  <a href="documents/DesignSpecification.md">
    Design Specification
  </a>
  
  ##

  📄
  <a href="documents/CodingStandards.md">
    Coding Standards
  </a>

  ##

  📄
  <a href="documents/UserManual.md">
    User Manual
  </a>

  ##

  📄
  <a href="documents/TestingPolicy.md">
    Testing Policy
  </a>

  ##

  📄
  <a href="documents/ServicesContract.md">
    Service Contract
  </a>
  <hr>
</br>

## 🔗Links

<a href="">
    Project Board
  </a>

##

  <a href="">
    Demo 1 Recording
  </a>
  
  ##

  <a href="">
    Demo 1 Presentation Slides
  </a>
<hr>
</br>

## 🛠️ Tech Stack

> [!NOTE]  
> Read more about decisions of technologies in the Architectural Specification.

### ⚙️ Frontend:
* Angular
* Ionic
* Typescript

<br>

### ⚙️ Backend:
* AWS Lambda Functions
* API Gateway
* AWS Step Functions

<br>
 
### ⚙️ Database:
* AWS DynamoDB
* AWS S3
  
<br>

### ⚙️ Standards
* ESLint
* Prettier
  
<br>

### ⚙️ Testing
* Cypress
* Postman

<br>

### ⚙️ Cloud
* Amplify
* Amplify Cloud Sandbox
  
<hr>
</br>

## Getting Started Guide

This guide will walk you through setting up and running our Angular app with AWS Amplify integration on your local machine.

### Prerequisites

Before you begin, ensure that you have the following installed on your machine:

- Node.js (version 12 or later)
- npm (version 6 or later)
- Angular CLI
- AWS CLI

### Setup Steps

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

### Running the App

To run the app locally, use the following command:
```
ng serve
```
Open your browser and navigate to `http://localhost:4200` to see the app in action.

That's it! You should now have the Angular app with AWS Amplify integration running on your local machine. If you encounter any issues or have further questions, please don't hesitate to reach out to the team.

<hr>
</br>

## 👷Our Team

<table>
    <tr>
      <td width="150" height="140">
        <img src="" width="150" height="auto">
      </td>
      <td style="vertical align: top; width: 70%;">
        <b>
          Tristan Sutherland
        </b>
        <br>
        <p>
          Passionate about data-driven decision-making, I am dedicated to transitioning into the role of a data scientist. I thrive in collaborative environments and am committed to continuous learning to stay at the forefront of emerging trends in data science.
        </p>
        <a href="https://github.com/TristanU21442615">
          <img src="/media/githubPic.png" width="24" height="24"/>
        </a>
        <a href="www.linkedin.com/in/tristan-sutherland-87ba92238">
          <img src="/media/linkedinPic.png" width="24" height="24"/>
        </a>
      </td>
    </tr>
    <tr>
      <td width="150" height="140">
        <img src="media/Bryce.jpg" width="150" height="auto">
      </td>
      <td style="vertical align: top; width: 70%;">
        <b>
          Bryce Sukhdeo
        </b>
        <br>
        <p>
          A computer science student majoring in data science, brings a strong focus on
          artificial intelligence and data structures to the team. His proficiency in Java, Python, and
          RStudio, along with his expertise in NoSQL databases, will be invaluable in developing the
          SmartInventory system's data management and analysis components. Bryce's keen
          interest in becoming a data scientist aligns perfectly with the project's goal of
          incorporating advanced features such as demand forecasting and inventory optimization.
          Bryce's ability to work well in teams and his willingness to contribute to all aspects of
          programming, including areas outside his specialties, demonstrate his adaptability and
          commitment to the project's success. His strong problem-solving skills and ability to
          adapt to new challenges will be essential in navigating the complexities of the
          SmartInventory project and ensuring its timely delivery.
        </p>
        <a href="https://github.com/BryceAxl">
          <img src="/media/githubPic.png" width="24" height="24"/>
        </a>
        <a href="https://www.linkedin.com/in/bryce-sukhdeo-64997260/">
          <img src="/media/linkedinPic.png" width="24" height="24"/>
        </a>
      </td>
    </tr>
      <tr>
      <td width="150" height="140">
        <img src="/media/Tristan.png" width="150" height="auto">
      </td>
      <td style="vertical align: top; width: 70%;">
        <b>
          Tristan Sutherland
        </b>
        <br>
        <p>
          Passionate about data-driven decision-making, I am dedicated to transitioning into the role of a data scientist. I thrive in collaborative environments and am committed to continuous learning to stay at the forefront of emerging trends in data science.
        </p>
        <a href="https://github.com/TristanU21442615">
          <img src="/media/githubPic.png" width="24" height="24"/>
        </a>
        <a href="www.linkedin.com/in/tristan-sutherland-87ba92238">
          <img src="/media/linkedinPic.png" width="24" height="24"/>
        </a>
      </td>
    </tr>
      <tr>
      <td width="150" height="140">
        <img src="media/Thabang.jpeg" width="150" height="auto">
      </td>
      <td style="vertical align: top; width: 70%;">
        <b>
          Thabang Kgaladi
        </b>
        <br>
        <p>
 A student of Information and Knowledge Systems at the University of Pretoria, they are deeply immersed in the world of software development. Their passion for technology extends beyond academics into gaming and digital creation. With a rich background in digital arts, having worked with Adobe Illustrator and Photoshop, they are currently exploring the possibilities within 3D modeling using Blender. Proficient in programming languages such as C++, C#, Java, and Python, they also excel in frameworks like Angular, Ionic, and MVC C#. Their ultimate ambition is to craft their own game or a tech-focused app, blending their interests in technology and art to create something truly unique.
        </p>
        <a href="https://github.com/u21686875">
          <img src="/media/githubPic.png" width="24" height="24"/>
        </a>
        <a href="https://www.linkedin.com/in/thabang-kgaladi-12b001215">
          <img src="/media/linkedinPic.png" width="24" height="24"/>
        </a>
      </td>
    </tr>
      <tr>
      <td width="150" height="140">
        <img src="media/Hawa.jpeg" width="150" height="auto">
      </td>
      <td style="vertical align: top; width: 70%;">
        <b>
          Hawa Ibrahim
        </b>
        <br>
        <p>
          Passionate about data-driven decision-making, I am dedicated to transitioning into the role of a data scientist. I thrive in collaborative environments and am committed to continuous learning to stay at the forefront of emerging trends in data science.
        </p>
        <a href="https://github.com/TristanU21442615">
          <img src="/media/githubPic.png" width="24" height="24"/>
        </a>
        <a href="www.linkedin.com/in/tristan-sutherland-87ba92238">
          <img src="/media/linkedinPic.png" width="24" height="24"/>
        </a>
      </td>
    </tr>
  </table>
