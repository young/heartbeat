'use strict';
// TOOD:
// - html page
// -
// // WEB BLUETOOTH

const HEART_EL = window.document.querySelector('.heart');

/** WEB SOCKET STUFF */
const host = window.document.location.host.replace(/:.*/, '');
const ws = new WebSocket('ws://' + 'localhost' + ':4080');
ws.onmessage = function (event) {
  console.log(event);
};
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
            (data) => {console.log(data);},
            (error) => {console.error(error);},
            () => { console.log('Done');}
          );
        characteristic.addEventListener('characteristicvaluechanged',
                                        handleCharacteristicValueChanged);
      });
    })
    .then(_ => {
    console.log('Notifications have been started.');
  })
  .catch(error => { console.log(error); });
}

function handleCharacteristicValueChanged(event) {
  var value = event.target.value;
  var textDecoder = new TextDecoder(); // Used to convert bytes to UTF-8 string.
  console.log('Received ' + textDecoder.decode(value));
  const HR = parseHeartRate(value);
  console.log('Heart Rate: ', HR.heartRate);
  const MINUTE = 60;
  const heartRate = HR.heartRate;
  const computedHeart = (heartRate / MINUTE) * 1000;
  pulseHeart(computedHeart);
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

function pulseHeart(rate) {
  setInterval(()=> {
      navigator.vibrate(100);
      console.log('vibrate');
  }, 1000000/rate);
  const foo = `heartscale ${1000/rate}s infinite`;
  HEART_EL.style.animation = foo ;
}


const MINUTE = 60;
const heartRate = 60;
const computedHeart = (heartRate / MINUTE) * 1000;
// pulseHeart(computedHeart);

// setInterval(()=>{pulseHeart(computedHeart);},10000);
let interval;
function fakeIt() {
  if (interval) {
    clearInterval(interval);
  }

  let foo = 1;
  const getFakeBeats = () => foo++ ;

  interval = setInterval(
    () => {
      document.dispatchEvent(new CustomEvent('heartBeat', {detail: getFakeBeats}));
    },
    2 * 1000);


}
Rx.Observable.fromEvent(document, 'heartBeat')
  .subscribe(
    (data) => {
      const d = data.detail();
      console.log('Data:', d);
      ws.send({name: 'heartbeat', data: d})

    },
    (error) => {console.error(error);},
    () => { console.log('Done');}
  );
