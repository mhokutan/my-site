const fs = require('fs');
const path = require('path');

require('dotenv').config();

const envVars = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || ''
};

const content = Object.entries(envVars)
  .map(([key, value]) => `window.${key} = ${JSON.stringify(value)};`)
  .join('\n');

fs.writeFileSync(path.join(__dirname, 'env.js'), content);
console.log('env.js generated');
