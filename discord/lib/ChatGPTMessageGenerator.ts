import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import envConfig from './EnvConfig';
import { AirHumidity, Settings, SoilMoisture, Temperature, WaterFlowSum, WateringStatus } from './helpers';
import moment from 'moment-timezone';
import { Socket } from 'socket.io-client';

class ChatGPTMessageGenerator {
    private openai: OpenAI;
    private socketClient: Socket;

    constructor(client: Socket) {
        this.openai = new OpenAI({
            apiKey: envConfig.config.openAIApiKey,
        });
        this.socketClient = client;
    }

    async generateSummary(time = 24) {
        const messages: ChatCompletionMessageParam[] = [];
        messages.push({
            role: 'system',
            content:
                'You are a helpful assistant that works with data from IoT sensors in a greenhouse with smart watering. Tomatoes and red peppers grow in the greenhouse. You receive data about measured soil moisture in percent (use " %"), temperature in Celsius degrees (use " °C"), water flow sums in liters (use " l"), watering statuses (on or off based on whether the pump was started or stopped). You respond concisely and without describing what your responses are about. You always respond in czech, it is very important. The czech translation of greenhouse is skleník.',
        });

        const { temperatures, airHumidities, soilMoistures, waterFlowSums, wateringStatuses } =
            await this.fetchSensorData(time);

        let sensorDataAnalysisMessage =
            'I am going to give you some data from the sensors in JSON format. The data are always objects in an array.\n';
        sensorDataAnalysisMessage += 'Thermometer data:\n';
        sensorDataAnalysisMessage += JSON.stringify(temperatures);
        sensorDataAnalysisMessage += '\nAir humidity data:\n';
        sensorDataAnalysisMessage += JSON.stringify(airHumidities);
        sensorDataAnalysisMessage += '\nSoil moisture data:\n';
        sensorDataAnalysisMessage += JSON.stringify(soilMoistures);
        sensorDataAnalysisMessage += `\nWater flow sums data (if empty, there was no watering in the last ${time} hours):\n`;
        sensorDataAnalysisMessage += JSON.stringify(waterFlowSums);
        sensorDataAnalysisMessage += `\nWatering statuses data (if empty, there was no watering in the last ${time} hours):\n`;
        sensorDataAnalysisMessage += JSON.stringify(wateringStatuses);
        sensorDataAnalysisMessage += `\nAll of the data was for the last ${time} hours. Write a summary about the measured values, mention highest and lowest values and when were they measured. Mention whether the watering was started and how many times. Mention how much water was used for the watering. Be as concise as possible. Respond in a bullet list form. Do not write full sentences, be concise. Start with a heading.`;
        messages.push({ role: 'user', content: sensorDataAnalysisMessage });

        console.log('Generating response.');
        const chatCompletion = await this.openai.chat.completions.create({
            messages: messages,
            model: 'gpt-3.5-turbo-16k',
        });

        const response = chatCompletion.choices[0].message.content;
        return response;
    }

    async checkAutoSummaryGenerationActive() {
        this.socketClient.emit('get_settings');
        const settings: Settings = await new Promise((resolve) => {
            this.socketClient.on('response', (data) => {
                resolve(data);
            });
        });
        
        return settings.autoSummaryGenerationActive;
    }

    private async fetchSensorData(time: number) {
        console.log('Fetching sensor data.');
        this.socketClient.emit('get_sensor_data', { what: 'temperature', time: time });
        const temperatures: Temperature[] = await new Promise((resolve) => {
            this.socketClient.on('response', (data) => {
                resolve(data);
            });
        });

        this.socketClient.emit('get_sensor_data', { what: 'soil_moisture', time: time });
        const soilMoistures: SoilMoisture[] = await new Promise((resolve) => {
            this.socketClient.on('response', (data) => {
                resolve(data);
            });
        });

        this.socketClient.emit('get_sensor_data', { what: 'air_humidity', time: time });
        const airHumidities: AirHumidity[] = await new Promise((resolve) => {
            this.socketClient.on('response', (data) => {
                resolve(data);
            });
        });

        this.socketClient.emit('get_sensor_data', { what: 'watering_status', time: time });
        const wateringStatuses: WateringStatus[] = await new Promise((resolve) => {
            this.socketClient.on('response', (data) => {
                resolve(data);
            });
        });

        this.socketClient.emit('get_sensor_data', { what: 'water_flow_sum', time: time });
        const waterFlowSums: WaterFlowSum[] = await new Promise((resolve) => {
            this.socketClient.on('response', (data) => {
                resolve(data);
            });
        });

        const temperaturesProcessed = temperatures.map((item) => {
            return {
                temperature: item.temperature,
                time: moment(item.createdAt).tz('Europe/Prague').format('DD.MM. HH:mm'),
            };
        });
        const airHumiditiesProcessed = airHumidities.map((item) => {
            return {
                airHumidity: item.air_humidity,
                time: moment(item.createdAt).tz('Europe/Prague').format('DD.MM. HH:mm'),
            };
        });
        const soilMoisturesProcessed = soilMoistures.map((item) => {
            return {
                soilMoisturePercentage: item.soilMoisturePercentage,
                time: moment(item.createdAt).tz('Europe/Prague').format('DD.MM. HH:mm'),
            };
        });
        const waterFlowSumsProcessed = waterFlowSums.map((item) => {
            return {
                sum: Math.round(item.flow_sum / 100) / 10, // ml to l, 1 decimal place
                time: moment(item.createdAt).tz('Europe/Prague').format('DD.MM. HH:mm'),
            };
        });
        const wateringStatusesProcessed = wateringStatuses.map((item) => {
            return {
                status: item.status,
                time: moment(item.createdAt).tz('Europe/Prague').format('DD.MM. HH:mm'),
            };
        });

        return {
            temperatures: temperaturesProcessed,
            soilMoistures: soilMoisturesProcessed,
            airHumidities: airHumiditiesProcessed,
            wateringStatuses: wateringStatusesProcessed,
            waterFlowSums: waterFlowSumsProcessed,
        };
    }
}

export default ChatGPTMessageGenerator;
