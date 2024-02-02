/**
 * Exports a Socket.io middleware function used to check whether the client
 * trying to connect is using the appropriate Authorization header.
 */

import { Socket } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();
const socketPassword = process.env.SOCKET_PASSWORD;

type NextFunctionWithError = (err?: Error) => void;

export const authorizationMiddleware = (socket: Socket, next: NextFunctionWithError) => {
    const authHeader = socket.request.headers.authorization;
    if (!authHeader) {
        return next(new Error('No auth header provided!'));
    }

    if (authHeader == socketPassword) {
        return next();
    } else {
        return next(new Error('Thou shalt not pass!'));
    }
};
