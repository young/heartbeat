'use strict';
const HEARTRATE_EVENT_NAME = 'heartbeat';
const PLAY_MUSIC_EVENT_NAME = 'play_music';
const STOP_MUSIC_EVENT_NAME = 'stop_music';
const MUSIC_CONTROL_EVENT_NAME = 'music_control';
const HEARTRATE_BROADCAST_EVENT_NAME = 'heartbeat broadcast';
const SHOW_HEARTS_EVENT = 'show_hearts';


/** WEB SOCKET STUFF */
const host = window.document.location.host.replace(/:.*/, '');

const ws = new WebSocket(`wss://heartbeats.site`);
// const ws = new WebSocket(`ws://localhost:4080`);

Rx.Observable.fromEvent(document, MUSIC_CONTROL_EVENT_NAME, ({detail}) => {
    return detail;
  })
  .subscribe(
    (d) => {
      if (d === 'play') {
        console.log('play music');
        ws.send(JSON.stringify({name: PLAY_MUSIC_EVENT_NAME}));
      }
      if (d === 'stop') {
        console.log('stop music');

        ws.send(JSON.stringify({name: STOP_MUSIC_EVENT_NAME}));
      }

    },
    (error) => {console.error(error);},
    () => { console.log('Done');}
  );
/** END WEB SOCKET STUFF */

function activateBlue() {
  navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] })
    .then(device => device.gatt.connect())
    .then(server => server.getPrimaryService('heart_rate'))
    .then(service => service.getCharacteristic('heart_rate_measurement'))
    .then(characteristic => {
      return characteristic.startNotifications()
      .then(_ => {
        Rx.Observable.fromEvent(characteristic, 'characteristicvaluechanged')
          .subscribe(
            (event) => {
              document.dispatchEvent(new CustomEvent('heartBeat', {detail: handleCharacteristicValueChanged(event)}));
            },
            (error) => {console.error(error);},
            () => { console.log('Done');}
          );
        // characteristic.addEventListener('characteristicvaluechanged',
        //                                 handleCharacteristicValueChanged);
      });
    })
    .then(_ => {
    console.log('Notifications have been started.');
  })
  .catch(error => { console.log(error); });
}

function handleCharacteristicValueChanged({target: {value}}) {
  const textDecoder = new TextDecoder(); // Used to convert bytes to UTF-8 string.
  const HR = parseHeartRate(value);
  console.info('Heart Rate: ', HR.heartRate);
  const heartRate = HR.heartRate;
  return heartRate;
}

/**
 * Parse bluetooth heartrate data.
 *
 * Taken from https://github.com/WebBluetoothCG/demos/blob/gh-pages/heart-rate-sensor/heartRateSensor.js
 * @param  {Objec} value
 * @return {Object}       The heart rate
 */
function parseHeartRate(value) {
  // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
  value = value.buffer ? value : new DataView(value);
  let flags = value.getUint8(0);
  let rate16Bits = flags & 0x1;
  let result = {};
  let index = 1;
  if (rate16Bits) {
    result.heartRate = value.getUint16(index, /*littleEndian=*/true);
    index += 2;
  } else {
    result.heartRate = value.getUint8(index);
    index += 1;
  }
  let contactDetected = flags & 0x2;
  let contactSensorPresent = flags & 0x4;
  if (contactSensorPresent) {
    result.contactDetected = !!contactDetected;
  }
  let energyPresent = flags & 0x8;
  if (energyPresent) {
    result.energyExpended = value.getUint16(index, /*littleEndian=*/true);
    index += 2;
  }
  let rrIntervalPresent = flags & 0x10;
  if (rrIntervalPresent) {
    let rrIntervals = [];
    for (; index + 1 < value.byteLength; index += 2) {
      rrIntervals.push(value.getUint16(index, /*littleEndian=*/true));
    }
    result.rrIntervals = rrIntervals;
  }
  return result;
}


let interval = false;
function fakeIt() {
  if (interval) {
    clearInterval(interval);
  }

  const getFakeBeats = () => 120 ;

  interval = setInterval(
    () => {
      document.dispatchEvent(new CustomEvent('heartBeat', {detail: getFakeBeats}));
    }, 2 * 1000);
}

function dispatchPlayMusic() {
  document.dispatchEvent(new CustomEvent(MUSIC_CONTROL_EVENT_NAME, {detail: 'play'}));
}

function dispatchStopMusic() {
  document.dispatchEvent(new CustomEvent(MUSIC_CONTROL_EVENT_NAME, {detail: 'stop'}));
}

function dispatchShowHearts() {
  document.dispatchEvent(new CustomEvent(SHOW_HEARTS_EVENT));
}

// Send new heartbeat data
Rx.Observable.fromEvent(document, 'heartBeat', ({detail: d}) => {
    return typeof d === 'function' ? d() : d;
  })
  .throttle(4 * 1000)
  .subscribe(
    (HR) => {
      // Send heartbeat data
      ws.send(JSON.stringify({name: HEARTRATE_EVENT_NAME, heartRate: HR}));
    },
    (error) => {console.error(error);},
    () => { console.log('Done');}
  );
