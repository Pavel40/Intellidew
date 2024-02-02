import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Socket } from 'socket.io-client';

module.exports = {
    socket: true,
    data: new SlashCommandBuilder()
        .setName('automatizace_deaktivovat')
        .setDescription('Deaktivuje automatické spouštění závlahy.'),
    async execute(interaction: ChatInputCommandInteraction, socket: Socket) {
        socket.emit('change_settings', { automation_active: false });
        const response: string = await new Promise((resolve) => {
            socket.on('response', (data) => {
                resolve(data);
            });
        });
        interaction.reply(response);
    },
};
