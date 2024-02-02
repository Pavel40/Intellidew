import { Socket } from 'socket.io';
import eventErrorHandler from '../lib/eventErrorHandler';
import WateringLogModel from '../models/WateringLog';
import wateringStatusSchema from '../schema/wateringStatusSchema';
import Notifier from '../lib/Notifier';

export default async function (socket: Socket, notifier: Notifier, message: any) {
    try {
        console.log('Watering status:', message);

        const receivedData = await wateringStatusSchema.validate(message);

        // The pump controller device sends a message about the watering status
        // - the message is sent to the Discord bot
        // - a watering status log is created in the DB, it is created in this event handler to ensure the watering is truly on/off

        socket.emit('response', { id_message: receivedData.id_message, response: 'OK' });
        notifier.notify('notify_watering_status', receivedData.watering_status, receivedData.id_sensor);
        console.log('emitted to discord');

        if (receivedData.watering_status == 'Čerpadlo zapnuto.') {
            await WateringLogModel.create({
                status: 'on',
            });
        } else if (receivedData.watering_status == 'Čerpadlo vypnuto.') {
            await WateringLogModel.create({
                status: 'off',
            });
        }
    } catch (error) {
        eventErrorHandler(error as Error, socket);
    }
}
