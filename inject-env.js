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

// Artık tarayıcıya değişken aktarmaya gerek yok.
module.exports = process.env;
