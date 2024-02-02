import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Socket } from 'socket.io-client';

module.exports = {
    socket: true,
    data: new SlashCommandBuilder().setName('vypnout').setDescription('Zastaví závlahu.'),
    async execute(interaction: ChatInputCommandInteraction, socket: Socket) {
        socket.emit('control_pump', {
            action: 'turn_off',
        });
        const response = await new Promise((resolve) => {
            socket.on('response', (data) => {
                resolve(data);
            });
        });

        if (response == 'OK') {
            await interaction.reply('Příkaz odeslán.');
        } else {
            await interaction.reply('Něco se pokazilo.');
        }
    },
};
