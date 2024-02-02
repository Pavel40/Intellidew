/**
 * Exports a SimpleLogger instance used to log errors to the intellidew.log file.
 */

import SimpleNodeLogger from 'simple-node-logger';

const options = {
    logFilePath: 'intellidew.log',
};
export const log = SimpleNodeLogger.createSimpleLogger(options);
