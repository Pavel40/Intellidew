import { Socket } from 'socket.io';
import eventErrorHandler from '../lib/eventErrorHandler';
import controlPumpSchema from '../schema/controlPumpSchema';

export default async function (socket: Socket, message: any) {
    try {
        console.log('Control pump message:', message);

        const command = await controlPumpSchema.validate(message);

        socket.emit('response', 'OK');
        // the 'command' event message format is the same as the 'control_pump' event message format
        socket.broadcast.emit('command', command);
        console.log('emitted a command');
    } catch (error) {
        eventErrorHandler(error as Error, socket);
    }
}
