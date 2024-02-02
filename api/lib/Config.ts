/**
 * Exports config object loaded from the config.json file.
 */

import { readFileSync } from 'fs';
import path from 'path';

const configPath = path.resolve(__dirname, '../config.json');
const config = JSON.parse(readFileSync(configPath, { encoding: 'utf-8' }));
console.log('Config file content: ', config);

export default config;
