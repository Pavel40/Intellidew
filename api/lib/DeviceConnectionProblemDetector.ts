import StatusLog from '../models/StatusLog';
import Settings from '../models/Settings';
import config from './Config';
import { Server } from 'socket.io';

/**
 * Helper class used to periodically check for device connection problems.
 */
class DeviceConnectionProblemDetector {
    constructor(private socketServer: Server) {}

    /**
     * Checks whether each monitored device has been online at least once in the last 30 minutes. Notifies using the Discord bot when not.
     */
    async checkDeviceStatusLogs() {
        // when sensor availability check is disabled in the user settings, return
        const settings = await Settings.findOne({ where: { id: 1 } });
        if (!settings?.sensorAvailabilityCheckActive) {
            console.log('Sensor availability check not active.');
            return;
        }

        for (const deviceID of config.deviceConnectionProblemDetector.devices) {
            const lastLog = await StatusLog.findOne({
                order: [['createdAt', 'DESC']],
                where: {
                    sensorID: deviceID,
                },
            });

            if (!lastLog) {
                this.notifyConnectionError(deviceID);
                continue;
            }

            const now = new Date();
            const lastLogTime = new Date(lastLog.createdAt as Date);
            if (Math.abs(now.getTime() - lastLogTime.getTime()) > 30 * 60 * 1000) {
                this.notifyConnectionError(deviceID);
            }
        }
    }

    notifyConnectionError(deviceID: string) {
        console.log(`Device with ID ${deviceID} has not been online in the last 30 minutes.`);
        this.socketServer.emit('discord', {
            what: 'notify_problem',
            value: `🛑 Zařízení s ID ${deviceID} nebylo posledních 30 minut online.`,
        });
    }
}

export default DeviceConnectionProblemDetector;
