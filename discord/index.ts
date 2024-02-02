require('dotenv').config();
import fs from 'node:fs';
import path from 'node:path';
import { Events, GatewayIntentBits, Collection } from 'discord.js';
import { io } from 'socket.io-client';
import envConfig from './lib/EnvConfig';
import { ClientWithCommands } from './lib/helpers';
import DiscordSocketEventHandler from './lib/DiscordSocketEventHandler';
import ChatGPTMessageGenerator from './lib/ChatGPTMessageGenerator';
import { scheduleJob } from 'node-schedule';
import { TextChannel } from 'discord.js';

const client = new ClientWithCommands({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Load all command handlers from the subdirectories of the command directory
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file: String) => file.endsWith('.js') || file.endsWith('.ts'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(
                `[Warning] Something is wrong with command at ${filePath}, either "data" or "execute" is missing.`
            );
        }
    }
}

// Handle commands using the loaded handlers
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = (interaction.client as ClientWithCommands).commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command ${interaction.commandName} found`);
        return;
    }

    try {
        if (command.deferred) {
            await interaction.deferReply();
        }
        // if command requires socket.io client instance, pass it in
        if (command.socket) {
            await command.execute(interaction, socket);
        }
        // if command requires chatGPTMessageGenerator instance, pass it in
        else if (command.chatGPTMessageGenerator) {
            await command.execute(interaction, chatGPTMessageGenerator);
        } else {
            await command.execute(interaction);
        }
    } catch (error) {
        console.log(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'Something went wrong executing this command! Error:\n' + error,
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: 'Something went wrong executing this command! Error:\n' + error,
                ephemeral: true,
            });
        }
    }
});

client.once(Events.ClientReady, (c) => {
    console.log(`I'm ready! Logged in as ${c.user.tag}`);
});

const discordSocketEventHandler = new DiscordSocketEventHandler(client);

// Connect to Intellidew API
const socket = io(`http://localhost:${envConfig.config.socketPort}`, {
    rejectUnauthorized: false,
    extraHeaders: { Authorization: envConfig.config.socketAuth },
});
socket.on('connect', () => {
    console.log('connected to socket', socket.id);
});
socket.on('discord', (message) => {
    discordSocketEventHandler.handleMessage(message);
});

// Post a summary about the sensor data using ChatGPT every morning
const chatGPTMessageGenerator = new ChatGPTMessageGenerator(socket);
scheduleJob('0 7 * * *', async function () {
    const autoSummaryGenerationActive = await chatGPTMessageGenerator.checkAutoSummaryGenerationActive();
    if (!autoSummaryGenerationActive) {
        console.log('Auto summary generation is not active.');
        return;
    }

    const summary = await chatGPTMessageGenerator.generateSummary();
    if (summary) {
        const textChannel: TextChannel = client.channels.cache.get(envConfig.config.generalChannelID) as TextChannel;
        textChannel.send(summary);
    }
});

client.login(envConfig.config.discordToken);
