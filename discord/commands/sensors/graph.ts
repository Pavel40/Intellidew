import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Socket } from 'socket.io-client';
import { generateGraph } from '../../lib/helpers';
import { SoilMoisture, Temperature, AirHumidity } from '../../lib/helpers';

module.exports = {
    socket: true,
    deferred: true,
    data: new SlashCommandBuilder()
        .setName('graf')
        .setDescription('Zobrazí data ze senzoru v grafu.')
        .addStringOption((option) =>
            option
                .setName('what')
                .setDescription('Která data se mají zobrazit.')
                .addChoices(
                    { name: 'Vlhkost půdy', value: 'soil_moisture' },
                    { name: 'Teplota vzduchu', value: 'temperature' },
                    { name: 'Vlhkost vzduchu', value: 'air_humidity' }
                )
        )
        .addIntegerOption((option) => option.setName('time').setDescription('Kolik hodin zpět.')),
    async execute(interaction: ChatInputCommandInteraction, socket: Socket) {
        const what = interaction.options.getString('what') ?? 'soil_moisture';
        const time = interaction.options.getInteger('time') ?? 24;

        let graph;
        socket.emit('get_sensor_data', { what: what, time: time });
        const sensorData = await new Promise((resolve) => {
            socket.on('response', (data) => {
                resolve(data);
            });
        });
        if (what == 'soil_moisture') {
            graph = await generateGraph({ soilMoistures: sensorData as SoilMoisture[] });
        } else if (what == 'temperature') {
            graph = await generateGraph({ temperatures: sensorData as Temperature[] });
        } else if (what == 'air_humidity') {
            graph = await generateGraph({ airHumidities: sensorData as AirHumidity[] });
        }
        // Send the graph to the channel the command was used in.
        await (interaction as ChatInputCommandInteraction).editReply({
            files: [
                {
                    attachment: graph as Buffer,
                    name: 'graph.png',
                },
            ],
        });
    },
};
