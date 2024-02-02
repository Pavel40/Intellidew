# Intellidew API

This is the "cloud" part of the project. It is a Node.js Typescript project.
It uses Socket.io to handle incoming data from the server and to send notifications and handle commands using the Discord bot part of the Intellidew project.

## Project structure

+ index.ts - periodically ran stuff is defined here, Socket.io server is started here, event handlers are set here to the corresponding events
+ events/ - event handlers are exported in the files in this directory
+ lib/ - helper classes and functions are exported in the files in this directory
+ middlewareSocketIO/ - Socket.io middlewares are exported in the files in this directory
+ models/ - Sequelize models are exported in the files in this directory
+ schema/ - yup validation schemas are exported in the files in this directory
+ .env - environment variables are set here
+ config.json - Intellidew configuration is set here
+ intellidew.log - log file

## Required environment variables

+ `PORT` - which port will be used for the server
+ `SOCKET_PASSWORD` - password required from Socket.IO clients for authorization

## Database

The SQLite database file required for this project can be created by synchronizing all of the Sequelize models defined in the models directory. Simply import all of the models to a single TypeScript file and run `sequelize.sync({force: true})` there. See <https://sequelize.org/docs/v6/core-concepts/model-basics/#synchronizing-all-models-at-once> for details.
