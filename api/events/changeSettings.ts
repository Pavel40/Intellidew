import { Socket } from 'socket.io';
import eventErrorHandler from '../lib/eventErrorHandler';
import SettingsModel from '../models/Settings';
import changeSettingsSchema from '../schema/changeSettingsSchema';

export default async function (socket: Socket, message: any) {
    try {
        console.log('Change settings model message:', message);

        const receivedData = await changeSettingsSchema.validate(message);

        const updateObject: Record<string, any> = {};
        let responseMessage = '';

        if (receivedData.automation_active != undefined) {
            updateObject['automation_active'] = receivedData.automation_active;
            responseMessage += `Automatické zapínání závlahy ${
                receivedData.automation_active ? 'aktivováno' : 'deaktivováno'
            }.`;
        }
        if (receivedData.sensor_availability_check_active != undefined) {
            updateObject['sensorAvailabilityCheckActive'] = receivedData.sensor_availability_check_active;
            responseMessage += `Pravidelná kontrola dostupnosti senzorů ${
                receivedData.sensor_availability_check_active ? 'aktivována' : 'deaktivována'
            }.`;
        }
        if (receivedData.auto_summary_generation_active != undefined) {
            updateObject['autoSummaryGenerationActive'] = receivedData.auto_summary_generation_active;
            responseMessage += `Automatické generování shrnutí ${
                receivedData.auto_summary_generation_active ? 'aktivováno' : 'deaktivováno'
            }.`;
        }

        await SettingsModel.update(updateObject, {
            where: {
                id: 1, // there is only one row in the settings table
            },
        });

        if (responseMessage != '') {
            socket.emit('response', responseMessage);
            return;
        }
        socket.emit('response', 'Žádná změna v nastavení.');
    } catch (error) {
        eventErrorHandler(error as Error, socket);
    }
}
