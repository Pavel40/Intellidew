import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Socket } from 'socket.io-client';

module.exports = {
    socket: true,
    data: new SlashCommandBuilder()
        .setName('kontrola_dostupnosti_aktivovat')
        .setDescription('Aktivuje pravidelnou kontrolu dostupnosti senzorů.'),
    async execute(interaction: ChatInputCommandInteraction, socket: Socket) {
        socket.emit('change_settings', { sensor_availability_check_active: true });
        const response: string = await new Promise((resolve) => {
            socket.on('response', (data) => {
                resolve(data);
            });
        });
        interaction.reply(response);
    },
};
