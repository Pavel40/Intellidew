import { Socket } from 'socket.io';
import Notifier from '../lib/Notifier';
import AirHumidityModel from '../models/AirHumidity';
import airHumiditySchema from '../schema/airHumiditySchema';
import eventErrorHandler from '../lib/eventErrorHandler';

export default async function (socket: Socket, notifier: Notifier, message: any) {
    try {
        console.log('Air humidity message:', message);

        const receivedData = await airHumiditySchema.validate(message);

        await AirHumidityModel.create({
            air_humidity: receivedData.air_humidity,
            sensorID: receivedData.id_sensor,
        });
        socket.emit('response', { id_message: receivedData.id_message, response: 'OK' });
        notifier.notify('notify_air_humidity', receivedData.air_humidity, receivedData.id_sensor);
    } catch (error) {
        eventErrorHandler(error as Error, socket);
    }
}
