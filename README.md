![GitHub pull requests](https://img.shields.io/github/issues-pr/COS301-SE-2024/Smart-Inventory)
![GitHub issues](https://img.shields.io/github/issues/COS301-SE-2024/Smart-Inventory)

# Helix - SmartInventory - Smart Inventory System to track and organise inventory

<div align="center">
    <img src="/media/logo-no-background.png" width="50%" height="70%">
</div>

## ℹ️ About
### ❔ What is SmartInventory?

SmartInventory is a user-friendly, web-based application that streamlines and automates core inventory processes. It empowers users to:
* Gain real-time visibility into stock levels, eliminating stockouts and ensuring smooth operations.
* Simplify the ordering process with automated suggestions and real-time order tracking.
* Capture detailed stock information, manage stock movements, and generate insightful reports for data-driven decision making.

### 👥 Who can use SmartInventory?
SmartInventory is designed to cater to the needs of various user roles within an organization:
* Business Owners/Managers (Administrators): Manage user access, configure system settings, and gain comprehensive inventory insights.
* Employees (Inventory Controllers/End-Users): Focus on daily stock management tasks, including adding, updating, and requesting stock.

### ✨ Key Features
* User-friendly Interface: Prioritizes ease of use with minimal technical jargon for a smooth user experience.
* Role-Based Access Control (RBAC): Ensures users have appropriate access rights within the system.
* Real-Time Inventory Tracking: Provides clear visibility into current stock levels.
* Automated Reordering: Generates purchase orders based on predefined rules and stock levels.
* Inventory Reporting: Offers insightful reports to support informed decision-making.
* Supplier Management: Stores supplier details, tracks performance metrics, and facilitates communication.
* EOQ Model: Determines optimal quantity to reorder and minimises total inventory costs.
* ABC Analysis: Inventory Prioritisation it categorises inventory based on importance where importance measured by annual consumption value allowing differentiated management strategies for each category.
* Inventory Forcasting: Using very little data individual items can be forecasted using past requested data to learn.

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

## 🚧 Current Capabilities
### 1. Sign In and Create Account
* Sign in with email and password.
* Create account for a team.
* Receive temporary pin for secure access.
* Forgot password
  
### 2. Team Management
* Add team member.
* Remove team member.
* Assign roles.
* Edit roles.
* Export Table
* Search and sort table

### 3. Inventory Management
* Add Item
* Remove Item
* Remove Multiple Items
* Edit Item
* Export Table
* Search and sort table
* Request Items
* Import items
* QR code generation
* QR code scanning
* Inventory Summary
* EOQ, ROP ABC anlysis
  
### 4. Supplier Management
* Add Supplier
* Remove Supplier
* Edit supplier details
* Export Table
* Import suppliers
* Search and sort table

### 5. Dashboard
* Add Widget
* Remove widget
* Reposistion widget
* Save state
* Cache system

### 6. Reports
* Activity Report
  * Graph Generation
  * Metric calculation
  * Table compiler
  * Export
* Supplier Report
  * Graph Generation
  * Metric calculation
  * Table compiler
  * Export
* Order Report
  * Graph Generation
  * Metric calculation
  * Table compiler
  * Export
* Inventory Report
  * Graph Generation
  * Metric calculation
  * Table compiler
  * Export
  * Inventory forecasting
  
### 7. Order Mangement and placement
* Create order
* Cancel Order
* View Qoute
* Email Template
* Email Communication with suppliers
* Web Portal for supplier view
* Mark as ordered
* Autonomous ordering
* Automation templates

### 8. User management
* Track Idle time
* Track interactions

### 9. Web Portal
* Track supplier detail changes
* Track quote changes
* Track quote acceptance
* Track expected delivary date choice
  
### 10. Help
* FAQ
* Troubleshooting
* User Quides
* Contact Us

### 11. Settings
* Profile:
  * Change Password
  * Change details(name, surname, email)
  * Delete Account
* General:
  * Dark/Light mode

<hr>
</br>

## 📂Documents
  📄
  <a href="documents/Demo 4/SRS.pdf">
    Software Requirement Specification
  </a>
  
  ##

  📄
  <a href="documents/Demo 4/ARS.pdf">
    Architectural Specification
  </a>
  
  ##

  📄
  <a href="documents/Demo 4/DesignSpec.pdf">
    Design Specification
  </a>
  
  ##

  📄
  <a href="documents/Demo 4/Coding Standards.pdf">
    Coding Standards
  </a>

  ##

  📄
  <a href="documents/Demo 4/User Manual.pdf">
    User Manual
  </a>

  ##

  📄
  <a href="documents/Demo 4/Testing Manual (2).pdf">
    Testing Manual
  </a>

  ##

  📄
  <a href="documents/Demo 4/Technical Installation Manual.pdf">
    Technical Installation Manual
  </a>
  
  ##

  📄
  <a href="documents/Demo 4/Service Contract.pdf">
    API Service Contracts
  </a>

  ##

  📄
  <a href="documents/Demo 4/DeploymentDiag.png">
    Deployment Model
  </a>

  ##

  📄
  <a href="documents/Demo 4/Predictive Analytics.pdf">
    Predictive Analytic 
  </a>
  <hr>
</br>

## 🔗Links

<a href="https://github.com/orgs/COS301-SE-2024/projects/53">
    Project Board
  </a>

##

  <a href="https://drive.google.com/file/d/1GA5bhGj_Fdi55wLu19L-26e7DdXcXDOk/view?usp=drive_link">
    Helix - Demo 4 App Recording
  </a>
  
##

  <a href="https://drive.google.com/file/d/1iGT_RBSD6WArLD1bJzuDQxNmeEPE8L8b/view?usp=sharing">
    Helix - Demo 4 Recording
  </a>
  
  ##

  <a href="/documents/Demo 3/SmartInventory-Demo3.pdf">
    Helix - Demo 4 Presentation Slides
  </a>
<hr>
</br>

## 🛠️ Tech Stack

> [!NOTE]  
> Read more about decisions of technologies in the Architectural Specification.

### ⚙️ Frontend:
* Angular
* Material
* Typescript

### ⚙️ Backend:
* AWS Lambda Functions
* API Gateway
* AWS Event Bridge
* AWS SES
* AWS SNS
* Docker
 
### ⚙️ Database:
* AWS DynamoDB
* AWS S3

### ⚙️ Standards
* ESLint
* Prettier

### ⚙️ Testing
* Cypress
* Postman
  
### ⚙️ Cloud
* Amplify
* Amplify Cloud Sandbox
* Cloudwatch
  
<hr>
</br>

## 👷Our Team

<table>
    <tr>
      <td width="150" height="140">
        <img src="/media/Tristan.jpg" width="150" height="auto">
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
        <img src="/media/WhatsApp Image 2024-06-03 at 06.53.20_3ff78913.jpg" width="150" height="auto">
      </td>
      <td style="vertical align: top; width: 70%;">
        <b>
          Bouchaib Chraf
        </b>
        <br>
        <p>
          An aspiring full-stack developer who thrives in collaborative environments. With expertise in Angular, Java, and C#, this individual combines strong analytical skills with a passion for crafting efficient, user-centric solutions. Their dedication to learning and proactive approach make them a valuable asset to any team.
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
          I am a BSc Information Knowledge Systems student majoring in Computer Science and Genetics. My interests lie in the field of Bioinformatics and Computational Biology, where I seek to leverage my knowledge in both computer science and genetics to explore biological complexities through data analysis, algorithm development, and modeling. I am curious about how advancements in computer science can better our understanding of genetics, leading to innovative solutions in healthcare.
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
