import { Socket } from 'socket.io';
import eventErrorHandler from '../lib/eventErrorHandler';
import WaterFlowLogModel from '../models/WaterFlowLog';
import waterFlowSchema from '../schema/waterFlowSchema';
import Notifier from '../lib/Notifier';

export default async function (socket: Socket, notifier: Notifier, message: any) {
    try {
        console.log('Water flow message:', message);

        const receivedData = await waterFlowSchema.validate(message);

        await WaterFlowLogModel.create({
            flow: receivedData.flow,
            sensorID: receivedData.id_sensor,
        });
        socket.emit('response', { id_message: receivedData.id_message, response: 'OK' });
        notifier.notify('notify_flow', receivedData.flow, receivedData.id_sensor);
    } catch (error) {
        eventErrorHandler(error as Error, socket);
    }
}
