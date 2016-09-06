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

/**
 * Client Counter
 * Count the number of active connections
 * @type {Number}
 */
let cc = 0;

wss.on('connection', function connection(ws) {
 console.log('client connections: ', ++cc);

  ws.on('message', function incoming(message) {
    try {
      const parsedData = JSON.parse(message);

      if (parsedData.name === HEARTRATE_EVENT_NAME) {
        wss.broadcast(message);
        console.dir(parsedData);
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
    console.log('disconnected');
  });

  ws.on('error', function error() {
    console.log('error');
  });

  // Keep the connection alive
  setInterval(() => {
    ws.ping(null, null, true);
  }, 2 * 1000);

});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};


server.on('request', app);
server.listen(cfg.port, function () { console.log('Listening on ' + cfg.port); });