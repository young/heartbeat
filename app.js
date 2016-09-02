const server = require('http').createServer();
const url = require('url');
const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ server: server });
const express = require('express');
const app = express();
const port = 4080;
const HEARTRATE_EVENT_NAME = 'heartbeat';

app.use(function (req, res) {
  res.send({ msg: "hello" });
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
      }
    } catch(e) {
      console.error('Error from message: ', e);
    }

    console.dir(parsedData);
  });


  ws.send('welcome!');
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + server.address().port); });