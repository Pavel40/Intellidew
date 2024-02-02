import { Socket } from 'socket.io';
import eventErrorHandler from '../lib/eventErrorHandler';
import StatusLogModel from '../models/StatusLog';
import statusLogSchema from '../schema/statusLogSchema';
import Notifier from '../lib/Notifier';

export default async function (socket: Socket, notifier: Notifier, message: any) {
    try {
        console.log('Status log message:', message);

        const receivedData = await statusLogSchema.validate(message);

        await StatusLogModel.create({
            sensorID: receivedData.id_sensor,
        });
        socket.emit('response', { id_message: receivedData.id_message, response: 'OK' });
        notifier.notify('notify_device_online', receivedData.id_sensor, receivedData.id_sensor)
    } catch (error) {
        eventErrorHandler(error as Error, socket);
    }
}
