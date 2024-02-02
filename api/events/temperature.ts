import { Socket } from 'socket.io';
import eventErrorHandler from '../lib/eventErrorHandler';
import Notifier from '../lib/Notifier';
import TemperatureModel from '../models/Temperature';
import temperatureSchema from '../schema/temperatureSchema';

export default async function (socket: Socket, notifier: Notifier, message: any) {
    try {
        console.log('Temperature message:', message);

        const receivedData = await temperatureSchema.validate(message);

        console.log('Temperature:', receivedData.temperature);
        await TemperatureModel.create({
            temperature: receivedData.temperature,
            sensorID: receivedData.id_sensor,
        });
        socket.emit('response', { id_message: receivedData.id_message, response: 'OK' });
        notifier.notify('notify_temperature', receivedData.temperature, receivedData.id_sensor);
    } catch (error) {
        eventErrorHandler(error as Error, socket);
    }
}
