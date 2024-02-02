import { Server } from 'socket.io';
import config from './Config';

/**
 * Sends messages using the Discord bot.
 */
export default class Notifier {
    constructor(private socketServer: Server) {}

    /**
     * Sends a message using the Discord bot.
     */
    notify(what: string, value: number | string, sensorID: string) {
        if (config.notifier.discord.includes(sensorID)) {
            const message: Record<string, number | string> = {};
            message['what'] = what;
            message['value'] = value;
            this.socketServer.emit('discord', message);
            console.log('emmited to discord', message);
        }
    }
}
