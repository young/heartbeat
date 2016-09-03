'use strict';

var fs = require('fs');

// you'll probably load configuration from config
var cfg = {
    ssl: true,
    port: 4080,
    ssl_key: '/var/cert/chained.pem',
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

wss.on('connection', function connection(ws) {
  var location = url.parse(ws.upgradeReq.url, true);
  // you might use location.query.access_token to authenticate or share sessions
  // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

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


  ws.send('welcome!');
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

server.on('request', app);
server.listen(cfg.port, function () { console.log('Listening on ' + cfg.port); });