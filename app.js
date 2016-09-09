'use strict';

const fs = require('fs');
const url = require('url');
const express = require('express');
const path = require('path');
const WebSocketServer = require('ws').Server;

const cfg = require('./config.json');

const server = ( cfg.ssl === 'true' ) ? require('https').createServer({
  key: fs.readFileSync( cfg.ssl_key ),
  cert: fs.readFileSync( cfg.ssl_cert )
}) : require('http').createServer();

const wss = new WebSocketServer({ server: server });
const app = express();
const HEARTRATE_EVENT_NAME = 'heartbeat';
const PLAY_MUSIC_EVENT_NAME = 'play_music';
const STOP_MUSIC_EVENT_NAME = 'stop_music';
const SHOW_HEARTS_EVENT = 'show_hearts';

/** ROUTES **/
app.use('/static', express.static('static'));

app.get('/', function(req, res) {
  res.sendFile('index.html', {root: __dirname});
});

app.get('/index.html', function(req, res) {
  res.sendFile('index.html', {root: __dirname});
});

app.get('/sw.js', function(req, res) {
  res.sendFile('sw.js', {root: __dirname});
});

app.get('/control', function(req, res) {
  res.sendFile('controlPage.html', {root: __dirname});
});
/** END ROUTES **/

/**
 * Client Counter
 * Count the number of active connections
 * @type {Number}
 */
let cc = 0;
const pingPayload = JSON.stringify({name: 'ping'});

wss.on('connection', function connection(ws) {
   console.log('client connections: ', ++cc);

  ws.on('message', function incoming(message) {
    try {
      const parsedData = JSON.parse(message);
      if (parsedData.name !== 'pong' || parsedData.name !== 'love') {
        console.dir(parsedData);
      }

      if (parsedData.name === 'love') {
        console.log(' ❤ ❤︎ ❤︎ ❤︎ ❤︎ ❤︎ ❤︎ ❤︎ ❤︎ ❤︎ ❤︎ ︎');
      }

      // If we receive heartbeat data, broadcast the data to all clients
      if (parsedData.name === HEARTRATE_EVENT_NAME) {
        wss.broadcast(message);
      }
      if (parsedData.name === PLAY_MUSIC_EVENT_NAME) {
        wss.broadcast(message);
      }
      if (parsedData.name === STOP_MUSIC_EVENT_NAME) {
        wss.broadcast(message);
      }
      if (parsedData.name === SHOW_HEARTS_EVENT) {
        wss.broadcast(message);
      }

    } catch(e) {
      console.error('Error from message: ', e);
    }
  });

  if (ws.readyState === ws.OPEN) {
    ws.send('welcome!');
  }

  ws.on('close', function close() {
    --cc;
    if (cc === 0) {
      clearInterval(pingInterval);
    }
    console.log('disconnected');
  });

  ws.on('error', function error() {
    --cc;
    console.log('error');
  });

});

// Keep the connection alive
let pingInterval = setInterval(() => {
  wss.broadcast(pingPayload);
}, 5 * 1000);

/**
 * Broadcast data to all connected clients
 * @param  {Object} data
 * @void
 */
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};


server.on('request', app);
server.listen(cfg.port, function () { console.log('Listening on ' + cfg.port); });
