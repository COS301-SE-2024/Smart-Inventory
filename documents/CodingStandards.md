# Coding Standards
## Introduction

### Overview

### Objectives

## File Structure

<table>
  <tr>
    <td>
      <img src="/media/" width="auto" height="auto">
    </td>
  </tr>
</table>

## Naming Conventions
### Constructions

### Construction Exceptions

### Name Choices

## Comments
### Syntax

### Uses

## Formatting
### Whitespace
#### Indentation

#### General Use

### Operators
   
### Expressions

### Functions
   
### Braces

## Standards Technology
### Prettier


## Styling Standards and Folder Creation Standards

### Styling Standards

#### Units of Measurement
- **Font Sizes**: Use `rem` for font sizes to ensure scalability.
- **Widths and Heights**: Use `%` for widths and heights to ensure responsiveness.
- **Precision**: Use `px` for borders, padding, and margins where precision is necessary.

#### Color Variables
- Define color variables in `variables.scss` for consistency and easy theme switching.

#### Typography
- Use a consistent font family across the application.
- Define font sizes and weights in `variables.scss`.

#### Spacing
- Use a consistent spacing scale (e.g., 4px, 8px, 16px) defined in `variables.scss`.

#### BEM (Block Element Modifier) Methodology
- Use BEM for naming classes to ensure consistency and readability.
```css
/* Block component */
.btn {}

/* Element that depends upon the block */
.btn__price {}

/* Modifier that changes the style of the block */
.btn--orange {}
.btn--big {}
```

#### Component Styling
- Each component should have its own SCSS file.
- Use encapsulated styles to avoid conflicts.

#### Responsive Design
- Ensure all components are responsive using media queries and flexible layouts.

#### Theming
- Typescript/Javascript will be used as a mechanism for theme switching, declared in variables.scss. 

#### Folder Creation Standards

Sure, here is the detailed explanation of each main folder in your Angular/Ionic project structure formatted in Markdown:

```markdown
# Folder Structure Explanation

## Core Folder

**Purpose:**
The `core` folder is intended for services, guards, interceptors, and other singleton classes that provide core functionality for the application. These are generally provided at the root level and are meant to be shared across the entire application.

**Contents:**
- **Services**: Singleton services used throughout the app (e.g., authentication, logging).
- **Guards**: Route guards to protect routes (e.g., AuthGuard).
- **Interceptors**: HTTP interceptors for modifying requests and responses.

**Generating Files:**
- **Service**: `ng generate service core/services/auth`
- **Guard**: `ng generate guard core/guards/auth`
- **Interceptor**: Create manually, as Angular CLI doesn’t have a direct command. You can create a file manually and then register it in your app module.

## Layout Folder

**Purpose:**
The `layout` folder contains components that define the overall layout of the application, such as headers, footers, and sidebars. These components are typically used in the root component to wrap the main content.

**Contents:**
- **Header**: The main navigation bar.
- **Footer**: The footer component.
- **Sidebar**: A side navigation component.

**Generating Files:**
```bash
ng generate component layout/header
ng generate component layout/footer
ng generate component layout/sidebar
```

## Pages Folder

**Purpose:**
The `pages` folder contains the different feature modules and their associated components, services, and other related files. Each feature module represents a distinct part of the application, such as a login page, home page, etc.

**Contents:**
- **Home**: Components, services, and routing related to the home page.
- **Login**: Components, services, and routing related to the login page.

**Generating Files:**
```bash
ng generate module pages/home --routing
ng generate component pages/home/home
ng generate module pages/login --routing
ng generate component pages/login/login
```

## Shared Folder

**Purpose:**
The `shared` folder contains reusable components, directives, and pipes that can be shared across multiple feature modules. These are generally UI elements or utilities that are not tied to a specific feature.

**Contents:**
- **Components**: Reusable components (e.g., buttons, modals).
- **Directives**: Reusable directives (e.g., tooltips, highlight).
- **Pipes**: Reusable pipes (e.g., date formatting, currency formatting).

**Generating Files:**
```bash
ng generate module shared
ng generate component shared/components/button
ng generate directive shared/directives/tooltip
ng generate pipe shared/pipes/date-format
```
``````
src/
|-- app/
| |-- core/
| | |-- services/api
| | |-- guards/
| | |-- interceptors/
| | |-- core.module.ts
| |
| |-- shared/
| | |-- components/
| | |-- directives/
| | |-- pipes/
| | |-- shared.module.ts
| |
| |-- pages/
| | |-- home/
| | | |-- components/
| | | |-- services/
| | | |-- pages/
| | | | |-- home.page.ts
| | | | |-- home.page.html
| | | | |-- home.page.scss
| | | | |-- home-routing.module.ts
| | | |-- home.module.ts
| | |
| | |-- login/
| | | |-- components/
| | | |-- services/
| | | |-- pages/
| | | | |-- login.page.ts
| | | | |-- login.page.html
| | | | |-- login.page.scss
| | | | |-- login-routing.module.ts
| | | |-- login.module.ts
| |
| |-- layout/
| | |-- header/
| | |-- footer/
| | |-- sidebar/
| | |-- layout.module.ts
| |
|-- assets/
| |-- images/
| |-- fonts/
|
|-- environments/
| |-- environment.ts
| |-- environment.prod.ts
|
|-- theme/
|-- global.scss
|-- index.html
|-- main.ts
|-- manifest.webmanifest
|-- polyfills.ts
|-- styles.scss
|-- test.ts
|-- zone-flags.ts
|-- angular.json
|-- package.json
|-- capacitor.config.ts