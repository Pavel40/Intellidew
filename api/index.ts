import { Server } from 'socket.io';
import { authorizationMiddleware } from './middlewareSocketIO/authorization';
import { scheduleJob } from 'node-schedule';
import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { Op } from 'sequelize';

// import event handlers
import temperature from './events/temperature';
import soilMoisture from './events/soilMoisture';
import getSensorData from './events/getSensorData';
import controlPump from './events/controlPump';
import wateringStatus from './events/wateringStatus';
import waterFlow from './events/waterFlow';
import waterFlowSum from './events/waterFlowSum';
import statusLog from './events/statusLog';
import airHumidity from './events/airHumidity';
import changeSettings from './events/changeSettings';
import getSettings from './events/getSettings';

// import helper classes
import PumpController from './lib/PumpController';
import DeviceConnectionProblemDetector from './lib/DeviceConnectionProblemDetector';
import Notifier from './lib/Notifier';
import StatusLog from './models/StatusLog';

// load server port from .env
dotenv.config();
const port = process.env.PORT;

// create instances of classes required to run the server and helper classes
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const pumpController = new PumpController(io);
const notifier = new Notifier(io);
const deviceConnectionProblemDetector = new DeviceConnectionProblemDetector(io);

// set the root endpoint to show HTML page informing user that they do not have the permission to use the app
app.get('/', (req, res) => {
    const html =
        '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Intellidew</title></head><body><iframe src="https://giphy.com/embed/njYrp176NQsHS" width="480" height="200" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/lotr-gandalf-lord-of-the-rings-njYrp176NQsHS">via GIPHY</a></p> </body></html>';
    res.status(403).send(html);
});

// checks the Authorization header on each Socket.io connection
io.use(authorizationMiddleware);

// on user connection, set event handlers for every event passing the required objects as parameters
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('temperature', (message) => temperature(socket, notifier, message));
    socket.on('soil_moisture', (message) => soilMoisture(socket, notifier, message));
    socket.on('get_sensor_data', (message) => getSensorData(socket, message));
    socket.on('control_pump', (message) => controlPump(socket, message));
    socket.on('watering_status', (message) => wateringStatus(socket, notifier, message));
    socket.on('flow', (message) => waterFlow(socket, notifier, message));
    socket.on('flow_sum', (message) => waterFlowSum(socket, notifier, message));
    socket.on('status_log', (message) => statusLog(socket, notifier, message));
    socket.on('air_humidity', (message) => airHumidity(socket, notifier, message));
    socket.on('change_settings', (message) => changeSettings(socket, message));
    socket.on('get_settings', (message) => getSettings(socket, message));
});

// Check the watering conditions every minute and turn on the pump if the conditions are met
scheduleJob('*/1 * * * *', async function () {
    await pumpController.checkWateringConditions();
});

// Check device connection status logs every 30 minutes and notify about devices that have been offline longer than expected
scheduleJob('*/30 * * * *', async function () {
    await deviceConnectionProblemDetector.checkDeviceStatusLogs();
});

// Remove status log rows older than 24 hours every day at midnight
scheduleJob('0 0 * * *', async function () {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    await StatusLog.destroy({
        where: {
            createdAt: {
                [Op.lt]: oneDayAgo,
            },
        },
    });
});

// Run the server
server.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
