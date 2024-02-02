import dotenv from 'dotenv';
dotenv.config();

/**
 * Loads and makes .env config available.
 */
class EnvConfig {
    public config: {
        discordToken: string;
        socketPort: string;
        socketAuth: string;
        generalChannelID: string;
        errorChannelID: string;
        measurementsChannelID: string;
        statusChannelID: string;
        openAIApiKey: string;
    };

    constructor() {
        if (!process.env.SOCKET_PORT) {
            throw new Error('Socket port is not defined in .env file');
        }
        if (!process.env.GENERAL_CHANNEL_ID) {
            throw new Error('General channel ID is not defined in .env file');
        }
        if (!process.env.MEASUREMENTS_CHANNEL_ID) {
            throw new Error('Measurements channel ID is not defined in .env file');
        }
        if (!process.env.STATUS_CHANNEL_ID) {
            throw new Error('Status channel ID is not defined in .env file');
        }
        if (!process.env.ERROR_CHANNEL_ID) {
            throw new Error('Error channel ID is not defined in .env file');
        }
        if (!process.env.DISCORD_TOKEN) {
            throw new Error('Discord token is not defined in .env file');
        }
        if (!process.env.SOCKET_AUTH) {
            throw new Error('Socket auth is not defined in .env file');
        }
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is not defined in .env file');
        }

        this.config = {
            discordToken: process.env.DISCORD_TOKEN,
            socketPort: process.env.SOCKET_PORT,
            generalChannelID: process.env.GENERAL_CHANNEL_ID,
            measurementsChannelID: process.env.MEASUREMENTS_CHANNEL_ID,
            errorChannelID: process.env.ERROR_CHANNEL_ID,
            statusChannelID: process.env.STATUS_CHANNEL_ID,
            socketAuth: process.env.SOCKET_AUTH,
            openAIApiKey: process.env.OPENAI_API_KEY,
        };
        console.log('Loaded .env configuration.', this.config);
    }
}

const envConfig = new EnvConfig();
export default envConfig;
