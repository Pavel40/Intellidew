/**
 * Exports a function used to handle errors in the event handler functions.
 */

import { Socket } from 'socket.io';
import { log } from './logger';

export default function eventErrorHandler(error: Error, socket: Socket) {
    log.error(error);
    if (error.name == 'ValidationError') {
        socket.emit('error', error.message);
    } else {
        socket.emit('error', 'Unknown error.');
    }
}
