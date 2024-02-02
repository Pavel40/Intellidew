import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Socket } from 'socket.io-client';

module.exports = {
    socket: true,
    data: new SlashCommandBuilder()
        .setName('zapnout')
        .setDescription('Spustí závlahu.')
        .addIntegerOption((option) => option.setName('duration').setDescription('Na kolik minut spustit závlahu.')),
    async execute(interaction: ChatInputCommandInteraction, socket: Socket) {
        const duration = interaction.options.getInteger('duration') ?? 45;
        socket.emit('control_pump', {
            action: 'turn_on',
            duration: duration,
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
