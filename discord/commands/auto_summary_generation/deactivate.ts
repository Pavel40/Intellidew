import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Socket } from 'socket.io-client';

module.exports = {
    socket: true,
    data: new SlashCommandBuilder()
        .setName('auto_shrnuti_deaktivovat')
        .setDescription('Deaktivuje automatickou pravidelnou generaci shrnutí.'),
    async execute(interaction: ChatInputCommandInteraction, socket: Socket) {
        socket.emit('change_settings', { auto_summary_generation_active: false });
        const response: string = await new Promise((resolve) => {
            socket.on('response', (data) => {
                resolve(data);
            });
        });
        interaction.reply(response);
    },
};
