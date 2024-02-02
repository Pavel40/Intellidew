import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import ChatGPTMessageGenerator from '../../lib/ChatGPTMessageGenerator';

module.exports = {
    chatGPTMessageGenerator: true,
    deferred: true,
    data: new SlashCommandBuilder()
        .setName('shrnuti')
        .setDescription('Vygeneruje shrnutí o naměřených hodnotách a (ne)provedené závlaze pomocí ChatGPT.')
        .addIntegerOption((option) => option.setName('time').setDescription('Kolik hodin zpět.')),
    async execute(interaction: ChatInputCommandInteraction, chatGPTMessageGenerator: ChatGPTMessageGenerator) {
        console.log('Generating a summary...');
        const time = interaction.options.getInteger('time') ?? 24;
        const summary = await chatGPTMessageGenerator.generateSummary(time);
        await (interaction as ChatInputCommandInteraction).editReply(
            summary ? summary : 'Nepodařilo se vygenerovat shrnutí.'
        );
    },
};
