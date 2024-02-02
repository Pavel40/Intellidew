import { Socket } from 'socket.io';
import eventErrorHandler from '../lib/eventErrorHandler';
import SoilMoistureProcessor from '../lib/SoilMoistureProcessor';
import Notifier from '../lib/Notifier';
import SoilMoistureModel from '../models/SoilMoisture';
import soilMoistureSchema from '../schema/soilMoistureSchema';

export default async function (socket: Socket, notifier: Notifier, message: any) {
    try {
        console.log('Soil moisture message:', message);

        const receivedData = await soilMoistureSchema.validate(message);

        console.log('Soil moisture:', receivedData.soil_moisture);
        const soilMoistureProcessor = new SoilMoistureProcessor();
        const soilMoisturePercentage = soilMoistureProcessor.getSoilMoisturePercentage(
            receivedData.soil_moisture,
            receivedData.id_sensor
        );
        await SoilMoistureModel.create({
            soilMoistureRaw: receivedData.soil_moisture,
            soilMoisturePercentage: soilMoisturePercentage,
            sensorID: receivedData.id_sensor,
        });
        socket.emit('response', { id_message: receivedData.id_message, response: 'OK' });
        notifier.notify('notify_soil_moisture', soilMoisturePercentage, receivedData.id_sensor);
    } catch (error) {
        eventErrorHandler(error as Error, socket);
    }
}
