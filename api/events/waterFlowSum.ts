import { Socket } from 'socket.io';
import eventErrorHandler from '../lib/eventErrorHandler';
import WaterFlowSumModel from '../models/WaterFlowSum';
import waterFlowSumSchema from '../schema/waterFlowSumSchema';
import Notifier from '../lib/Notifier';

export default async function (socket: Socket, notifier: Notifier, message: any) {
    try {
        console.log('Water flow sum message:', message);

        const receivedData = await waterFlowSumSchema.validate(message);

        await WaterFlowSumModel.create({
            flow_sum: receivedData.flow_sum,
            sensorID: receivedData.id_sensor,
        });
        socket.emit('response', { id_message: receivedData.id_message, response: 'OK' });
        notifier.notify('notify_flow_sum', receivedData.flow_sum, receivedData.id_sensor);
    } catch (error) {
        eventErrorHandler(error as Error, socket);
    }
}
