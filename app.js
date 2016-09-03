'use strict';

var fs = require('fs');

// you'll probably load configuration from config
var cfg = {
    ssl: true,
    port: 4080,
    ssl_key: '/var/cert/domain.key',
    ssl_cert: '/var/cert/signed.crt'
};

var server = ( cfg.ssl ) ? require('https').createServer({
  key: fs.readFileSync( cfg.ssl_key ),
  cert: fs.readFileSync( cfg.ssl_cert )
}) : require('http').createServer();

const url = require('url');
const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ server: server });
const express = require('express');
const app = express();
const HEARTRATE_EVENT_NAME = 'heartbeat';
const path = require('path');

app.use('/static', express.static('static'));

app.get('/', function(req, res) {
  res.sendFile('index.html', {root: __dirname});
});

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