import { Server } from 'socket.io';
import Temperature from '../models/Temperature';
import SoilMoisture from '../models/SoilMoisture';
import WateringLog from '../models/WateringLog';
import config from './Config';
import Settings from '../models/Settings';

/**
 * Controls the water pump.
 * 
 * Used for the watering automation. The manual pump control is handled in the 'control_pump' event.
 */
class PumpController {
    constructor(private socketServer: Server) {}

    /** Checks whether the watering is not currently running, if not, turns the watering on */
    async turnOn(durationMinutes: number) {
        const lastWateringStatusLogRow = await WateringLog.findOne({
            order: [['createdAt', 'DESC']],
        });
        if (lastWateringStatusLogRow && lastWateringStatusLogRow.status == 'on') {
            // the watering is currently running
            return;
        }

        this.socketServer.emit('discord', {
            what: 'notify_watering_status',
            value: `Vlhkost půdy klesla pod nastavenou hranici (${config.watering.minWateringSoilMoisturePercentage} %) a teplota vzduchu je pod nastavenou maximální teplotou pro zavlažování (${config.watering.maxWateringTemperature} °C). Zapínám závlahu.`,
        });
        this.socketServer.emit('command', {
            action: 'turn_on',
            duration: durationMinutes,
        });
    }

    /** Turns the watering off */
    turnOff() {
        this.socketServer.emit('command', {
            action: 'turn_off',
        });
    }

    /**
     * Evaluates soil moisture and air temperature to determine whether it's a good time to start the watering.
     * If it is, turns on the water pump.
     */
    async checkWateringConditions() {
        // when automation is disabled in the user settings, return
        const settings = await Settings.findOne({ where: { id: 1 } });
        if (!settings?.automation_active) {
            console.log('Automation not active.');
            return;
        }

        // load rows used to determine whether the conditions for watering are good
        const lastTemperatureRow = await Temperature.findOne({
            order: [['createdAt', 'DESC']],
            where: {
                sensorID: config.watering.thermometerID,
            },
        });
        const lastSoilMoistureRow = await SoilMoisture.findOne({
            order: [['createdAt', 'DESC']],
            where: {
                sensorID: config.watering.soilMoistureSensorID,
            },
        });
        const lastWateringStatusLogRow = await WateringLog.findOne({
            order: [['createdAt', 'DESC']],
        });

        if (!lastTemperatureRow || !lastSoilMoistureRow) {
            console.log('No temperature or soil moisture row found!');
            return;
        }

        const temperatureDate = new Date(lastTemperatureRow.createdAt as Date);
        const soilMoistureDate = new Date(lastSoilMoistureRow.createdAt as Date);
        const now = new Date();

        // check whether the last watering was less than 80 minutes ago, if yes, return
        if (lastWateringStatusLogRow) {
            const lastWateringStatusLogDate = new Date(lastWateringStatusLogRow.createdAt as Date);
            if (Math.abs(now.getTime() - lastWateringStatusLogDate.getTime()) < 80 * 60 * 1000) {
                console.log('The last watering was less than 80 minutes ago. Watering not started.');
                return;
            }
        }

        // if the time difference between the createdAt columns of the temperature and soil moisture rows is greater than 30 minutes, return
        if (Math.abs(temperatureDate.getTime() - soilMoistureDate.getTime()) > 30 * 60 * 1000) {
            console.log(
                'The time difference between the last temperature measurement and the last soil moisture measurement is greater than 30 minutes!'
            );
            return;
        }

        // if the time difference between now and the last temperature or soil moisture row is greater than 30 minutes, return
        if (
            Math.abs(now.getTime() - soilMoistureDate.getTime()) > 30 * 60 * 1000 ||
            Math.abs(now.getTime() - temperatureDate.getTime()) > 30 * 60 * 1000
        ) {
            console.log(
                'The time difference between the last temperature measurement or the last soil moisture measurement and now is greater than 30 minutes!'
            );
            return;
        }

        // round the temperature and soil moisture
        const temperature = Math.round(lastTemperatureRow.temperature);
        const soilMoisture = Math.round(lastSoilMoistureRow.soilMoisturePercentage);

        // if the temperature and soil moisture watering conditions set in the config.json file are met, turn on the watering
        console.log(`Last temperature: ${temperature}, Last soil moisture: ${soilMoisture}`);
        if (
            temperature <= config.watering.maxWateringTemperature &&
            temperature >= config.watering.minWateringTemperature &&
            soilMoisture <= config.watering.minWateringSoilMoisturePercentage
        ) {
            await this.turnOn(config.watering.wateringDurationMinutes);
            console.log('Sent command to turn watering on.');
        }
    }
}

export default PumpController;
