import fs from 'fs';
import path from 'path';
import stripJsonComments from 'strip-json-comments';

const configFile = fs.readFileSync(path.join('config.json'), 'utf-8');
export const config = JSON.parse(stripJsonComments(configFile));