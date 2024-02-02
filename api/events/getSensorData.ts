import { Socket } from 'socket.io';
import eventErrorHandler from '../lib/eventErrorHandler';
import TemperatureModel from '../models/Temperature';
import SoilMoistureModel from '../models/SoilMoisture';
import AirHumidityModel from '../models/AirHumidity';
import getSensorDataSchema from '../schema/getSensorDataSchema';
import { Op } from 'sequelize';
import WateringLog from '../models/WateringLog';
import WaterFlowSum from '../models/WaterFlowSum';

export default async function (socket: Socket, message: any) {
    try {
        const receivedData = await getSensorDataSchema.validate(message);

        if (receivedData.what === 'temperature') {
            const temperature = await TemperatureModel.findAll({
                where: {
                    sensorID: 'thermometer_1',
                    createdAt: {
                        [Op.gt]: new Date(Date.now() - receivedData.time * 60 * 60 * 1000),
                    },
                },
            });
            socket.emit('response', temperature);
        }
        if (receivedData.what === 'soil_moisture') {
            const soilMoisture = await SoilMoistureModel.findAll({
                where: {
                    sensorID: 'soil_moisture_sensor_1',
                    createdAt: {
                        [Op.gt]: new Date(Date.now() - receivedData.time * 60 * 60 * 1000),
                    },
                },
            });
            socket.emit('response', soilMoisture);
        }
        if (receivedData.what === 'air_humidity') {
            const airHumidity = await AirHumidityModel.findAll({
                where: {
                    sensorID: 'thermometer_1',
                    createdAt: {
                        [Op.gt]: new Date(Date.now() - receivedData.time * 60 * 60 * 1000),
                    },
                },
            });
            socket.emit('response', airHumidity);
        }
        if (receivedData.what === 'watering_status') {
            const wateringStatus = await WateringLog.findAll({
                where: {
                    createdAt: {
                        [Op.gt]: new Date(Date.now() - receivedData.time * 60 * 60 * 1000),
                    },
                },
            });
            socket.emit('response', wateringStatus);
        }
        if (receivedData.what === 'water_flow_sum') {
            const waterFlow = await WaterFlowSum.findAll({
                where: {
                    createdAt: {
                        [Op.gt]: new Date(Date.now() - receivedData.time * 60 * 60 * 1000),
                    },
                },
            });
            socket.emit('response', waterFlow);
        }
    } catch (error) {
        eventErrorHandler(error as Error, socket);
    }
}
