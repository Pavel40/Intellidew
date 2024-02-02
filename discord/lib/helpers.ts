import { Client, Collection } from 'discord.js';

import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import moment from 'moment-timezone';
import { ChartConfiguration } from 'chart.js';

// Extend Client class with commands property
export class ClientWithCommands extends Client {
    commands: Collection<String, any> = new Collection();
}

export interface Temperature {
    temperature: number;
    createdAt: string;
    updatedAt: string;
}

export interface SoilMoisture {
    soilMoisturePercentage: number;
    createdAt: string;
    updatedAt: string;
}

export interface AirHumidity {
    air_humidity: number;
    createdAt: string;
    updatedAt: string;
}

export interface WaterFlowSum {
    flow_sum: number;
    createdAt: string;
    updatedAt: string;
}

export interface WateringStatus {
    status: 'on' | 'off';
    createdAt: string;
    updatedAt: string;
}

export interface Settings {
    automation_active: boolean;
    sensorAvailabilityCheckActive: boolean;
    autoSummaryGenerationActive: boolean;
}

export async function generateGraph({
    soilMoistures,
    temperatures,
    airHumidities,
}: {
    soilMoistures?: SoilMoisture[];
    temperatures?: Temperature[];
    airHumidities?: AirHumidity[];
}) {
    if (!soilMoistures && !temperatures && !airHumidities)
        throw new Error('soilMoistures, temperatures, airHumidities are not defined.');

    // Create a plugin that draws a white background on the canvas.
    const plugin = {
        id: 'customCanvasBackgroundColor',
        beforeDraw: (chart: any, args: any, options: any) => {
            const { ctx } = chart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = options.color || 'white';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        },
    };

    const width = 800;
    const height = 600;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
        width,
        height,
    });

    let dataset = {};
    let times: String[] = [];

    if (temperatures) {
        dataset = {
            label: 'Teplota',
            data: temperatures.map((data) => {
                return data.temperature;
            }),
            borderColor: 'red',
            backgroundColor: 'rgba(255, 0, 0, 0.5)',
            fill: false,
            tension: 0.1,
            pointRadius: 0,
        };
        times = temperatures.map((data) => {
            return moment(data.createdAt).tz('Europe/Prague').format('DD.MM. HH:mm');
        });
    } else if (soilMoistures) {
        dataset = {
            label: 'Vlhkost půdy',
            data: soilMoistures.map((data) => {
                return data.soilMoisturePercentage;
            }),
            borderColor: 'green',
            backgroundColor: 'rgba(0, 255, 0, 0.5)',
            fill: false,
            tension: 0.1,
            pointRadius: 0,
        };
        times = soilMoistures.map((data) => {
            return moment(data.createdAt).tz('Europe/Prague').format('DD.MM. HH:mm');
        });
    } else if (airHumidities) {
        dataset = {
            label: 'Vlhkost vzduchu',
            data: airHumidities.map((data) => {
                return data.air_humidity;
            }),
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 255, 0.5)',
            fill: false,
            tension: 0.1,
            pointRadius: 0,
        };
        times = airHumidities.map((data) => {
            return moment(data.createdAt).tz('Europe/Prague').format('DD.MM. HH:mm');
        });
    }

    const configuration: ChartConfiguration = {
        type: 'line',
        data: {
            labels: times,
            datasets: [dataset as any],
        },
        plugins: [plugin],
    };

    const image = await chartJSNodeCanvas.renderToBuffer(configuration as any);
    return image;
}
