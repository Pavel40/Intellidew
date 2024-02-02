import { Socket } from 'socket.io';
import eventErrorHandler from '../lib/eventErrorHandler';
import SettingsModel from '../models/Settings';

export default async function (socket: Socket, message: any) {
    try {
        const settings = await SettingsModel.findOne({
            attributes: ['automation_active', 'sensorAvailabilityCheckActive', 'autoSummaryGenerationActive'],
            where: {
                id: 1, // there is only one row in the settings table
            },
        });
        socket.emit('response', settings);
    } catch (error) {
        eventErrorHandler(error as Error, socket);
    }
}
