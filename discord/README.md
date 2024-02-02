# Bot Intellidew

This is the Discord bot part of the project. It is a Node.js Typescript project that uses the discord.js library to create a Discord bot.

## Project structure

+ index.ts - command handlers are loaded here, Socket.IO connection with Cloud Intellidew is established here, periodically ran actions are defined here, Discord bot log in is done here
+ commands/ - command definitions and handlers are exported in the files in the subdirectories of this directory
+ lib/ - helper classes and functions are exported in the files in this directory

## Required environment variables

+ `DISCORD_TOKEN` - Discord bot authorization token
+ `CLIENT_ID` - Discord application client id
+ `GUILD_ID` - Discord server ID
+ `GENERAL_CHANNEL_ID` - ID of a Discord server channel used for general messages
+ `MEASUREMENTS_CHANNEL_ID` - ID of a Discord server channel used for notifications about measured values from the sensors
+ `STATUS_CHANNEL_ID` - ID of a Discord server channel used for notifications about the device connection statuses
+ `ERROR_CHANNEL_ID` - ID of a Discord server channel used for sending error messages
+ `SOCKET_PORT` - Cloud Intellidew's Socket.IO server port
+ `SOCKET_AUTH` - Authorization password for Cloud Intellidew's Socket.IO server
+ `OPENAI_API_KEY` - the OpenAI API key
