'use strict';
// TOOD:
// - html page
// -
// // WEB BLUETOOTH

const HEART_EL = window.document.querySelector('.heart');
const HEARTRATE_EVENT_NAME = 'heartbeat';
const SERVER_IP = '138.68.120.8';


/** WEB SOCKET STUFF */
const host = window.document.location.host.replace(/:.*/, '');

const ws = new WebSocket(`wss://heartbeats.site`);
Rx.Observable.fromEvent(ws, 'message', ({data}) => {
    try {
      const parsedData = JSON.parse(data);
      if (parsedData.name === HEARTRATE_EVENT_NAME) {
        return parsedData.heartRate;
      }
    } catch(e) {
      console.log('SERVER MESSAGE:', data);
      return null;
    }
  })
  .filter((HR) => HR !== null)
  .distinctUntilChanged()
  .subscribe(
    (HR) => {
      console.log('HEARTRATE: ', HR);
      pulseHeart(HR);
    },
    (error) => {console.error('Websocket error from server:', error);},
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
  var textDecoder = new TextDecoder(); // Used to convert bytes to UTF-8 string.
  const HR = parseHeartRate(value);
  console.info('Heart Rate: ', HR.heartRate);
  const heartRate = HR.heartRate;
  return heartRate;
  // pulseHeart(computedHeart);
}

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
let pulseInterval;
let vub;
function pulseHeart(rate) {
  const MINUTE = 60;
  const heartRate = 60;
  const computedHeart = (rate / MINUTE) * 1000;

  if (pulseInterval) {
    clearInterval(pulseInterval);
  }
  pulseInterval = setInterval(()=> {
      navigator.vibrate(100);
      console.log('vibrate');
  }, 1000000/computedHeart);
  const foo = `heartscale ${1000/computedHeart}s infinite`;
  HEART_EL.style.animation = foo ;
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
    },
    2 * 1000);


}

Rx.Observable.fromEvent(document, 'heartBeat', ({detail: d}) => {
    return typeof d === 'function' ? d() : d;
  })
  .throttle(4 * 1000)
  .subscribe(
    (HR) => {
      // console.log('Data:', d);
      ws.send(JSON.stringify({name: HEARTRATE_EVENT_NAME, heartRate: HR}));

    },
    (error) => {console.error(error);},
    () => { console.log('Done');}
  );
