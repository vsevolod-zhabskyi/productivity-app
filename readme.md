## About

This is a Productivity app that consists of 4 pages:
- Pomodoro timer
- Task list
- Reports
- Settings

## How to Run

Run the following commands in the console:

`npm install` - this will install all required packages

`npm start`  - this will run server on http://localhost:3000

To read the documentation you can run this command:<br/>
`npm run doc` - this will generate JSDoc documentation

## Used Technologies and Patterns

The project is an **Single Page Application** created with **vanilla JavaScript**.

**MVC** is the main architectural pattern used for creation of each page.<br/>
Each page is represented by its Model, View and Controller components.

**Event Bus** pattern is used for communication between such components.

**Router** pattern is used for ensuring the consistency between application state and the address bar.

**Firebase** is used as cloud storage for app data

**Less** - CSS preprocessor

**Webpack** - project bundling

**handlebars** - template engine

**JQuery** - custom plugins (timer, notification, datepicker)

**highcharts** - library for graph rendering

**Jest** - unit testing

**JSDoc** - documentation

**ESLint, Prettier** - code styling

## Authors and Acknowledgment

Creator of the project - Vsevolod Zhabskyi.

Design and assets were provided by EPAM Systems.



