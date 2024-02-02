import envConfig from './EnvConfig';
import NumberUtils from './NumberUtils';
import { ClientWithCommands } from './helpers';
import { TextChannel } from 'discord.js';

/**
 * Handles the 'discord' event received from the Socket.io server.
 */
class DiscordSocketEventHandler {
    private actionHandlers: Record<string, (message: Record<string, any>) => void> = {
        notify_air_humidity: this.notifyAirHumidity.bind(this),
        notify_soil_moisture: this.notifySoilMoisture.bind(this),
        notify_device_online: this.notifyDeviceOnline.bind(this),
        notify_temperature: this.notifyTemperature.bind(this),
        notify_flow: this.notifyFlow.bind(this),
        notify_flow_sum: this.notifyFlowSum.bind(this),
        notify_watering_status: this.notifyWateringStatus.bind(this),
        notify_problem: this.notifyProblem.bind(this),
    };

    constructor(private client: ClientWithCommands) {}

    handleMessage(message: Record<string, any>) {
        if (message.what in this.actionHandlers) {
            this.actionHandlers[message.what](message);
        } else {
            console.log('No error defined for', message.what);
        }
    }

    private notifyAirHumidity(message: Record<string, any>) {
        const textChannel = this.getTextChannel(envConfig.config.measurementsChannelID);
        const airHumidityRounded = Math.round(message.value);
        const text = `☁️ Aktuální vlhkost vzduchu ve skleníku je ${airHumidityRounded} %.`;
        textChannel.send(text);
    }

    private notifySoilMoisture(message: Record<string, any>) {
        const textChannel = this.getTextChannel(envConfig.config.measurementsChannelID);
        const soilMoistureRounded = NumberUtils.halfPrecisionRound(message.value);
        const soilMoistureLocalized = NumberUtils.czechLocalizedFloat(soilMoistureRounded);
        const text = `💧 Aktuální vlhkost půdy ve skleníku je ${soilMoistureLocalized} %.`;
        textChannel.send(text);
    }

    private notifyDeviceOnline(message: Record<string, any>) {
        const textChannel = this.getTextChannel(envConfig.config.statusChannelID);
        const text = `Zařízení s ID "${message.value}" je online.`;
        textChannel.send(text);
    }

    private notifyTemperature(message: Record<string, any>) {
        const textChannel = this.getTextChannel(envConfig.config.measurementsChannelID);
        const temperatureLocalized = NumberUtils.czechLocalizedFloat(message.value);
        const text = `🌡️ Aktuální teplota ve skleníku je ${temperatureLocalized} °C.`;
        textChannel.send(text);
    }

    private notifyFlow(message: Record<string, any>) {
        const textChannel = this.getTextChannel(envConfig.config.measurementsChannelID);
        const flowRounded = NumberUtils.czechLocalizedFloat(message.value);
        const text = `🚿 Aktuální průtok vody ve skleníku je ${flowRounded} l/min.`;
        textChannel.send(text);
    }

    private notifyFlowSum(message: Record<string, any>) {
        const textChannel = this.getTextChannel(envConfig.config.generalChannelID);
        const flowSumRounded = NumberUtils.czechLocalizedFloat(message.value / 1000);
        const text = `🚿 Celkový průtok vody ve skleníku během závlahy byl ${flowSumRounded} l.`;
        textChannel.send(text);
    }

    private notifyWateringStatus(message: Record<string, any>) {
        const textChannel = this.getTextChannel(envConfig.config.generalChannelID);
        const text = message.value;
        textChannel.send(text);
    }

    private notifyProblem(message: Record<string, any>) {
        const textChannel = this.getTextChannel(envConfig.config.errorChannelID);
        const text = message.value;
        textChannel.send(text);
    }

    private getTextChannel(channelID: string) {
        const textChannel: TextChannel = this.client.channels.cache.get(channelID) as TextChannel;
        return textChannel;
    }
}

export default DiscordSocketEventHandler;
