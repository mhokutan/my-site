const fs = require('fs');
const path = require('path');

// Basit .env yükleyici
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const match = line.match(/^([^=]+)=?(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (key) process.env[key] = value;
    }
  }
}

const envVars = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || ''
};

const content = `window.OPENAI_API_KEY = ${JSON.stringify(envVars.OPENAI_API_KEY)};
window.GOOGLE_CLIENT_ID = ${JSON.stringify(envVars.GOOGLE_CLIENT_ID)};
window.GOOGLE_CLIENT_SECRET = ${JSON.stringify(envVars.GOOGLE_CLIENT_SECRET)};`;

fs.writeFileSync(path.join(__dirname, 'env.js'), content);
console.log('env.js generated');
