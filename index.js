
const mineflayer = require('mineflayer');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

const config = {
  host: 'tecno.aternos.me',
  port: 19736,
  username: 'TecnoBot',
  auth: 'offline',
  version: false
};

let bot;
let connected = false;
let reconnectTimer;
const startTime = Date.now();

app.get('/', (req, res) => {
  res.send(`
    <h1>Tecno AFK Bot</h1>
    <p>Status: ${connected ? 'ONLINE' : 'RECONNECTING'}</p>
    <p>Server: ${config.host}:${config.port}</p>
    <p>Uptime: ${Math.floor((Date.now() - startTime) / 1000)} seconds</p>
  `);
});

app.get('/ping', (req, res) => res.send('pong'));

app.listen(PORT, '0.0.0.0', () => {
  console.log('Dashboard running on port ' + PORT);
});

function connectBot() {
  console.log('Connecting to Tecno...');

  bot = mineflayer.createBot(config);

  bot.once('spawn', () => {
    connected = true;
    console.log('TecnoBot joined the server!');

    // Periodic movement to help prevent AFK kicks.
    const currentBot = bot;
    const antiAfk = setInterval(() => {
      if (bot !== currentBot || !connected) {
        clearInterval(antiAfk);
        return;
      }

      try {
        currentBot.setControlState('jump', true);
        setTimeout(() => {
          if (bot === currentBot) {
            currentBot.setControlState('jump', false);
          }
        }, 200);
      } catch (err) {
        console.log(err.message);
      }
    }, 30000);
  });

  bot.on('kicked', reason => {
    console.log('Kicked:', reason);
  });

  bot.on('error', err => {
    console.log('Bot error:', err.message);
  });

  bot.on('end', () => {
    connected = false;
    console.log('Disconnected. Reconnecting in 15 seconds...');

    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connectBot, 15000);
  });
}

connectBot();

