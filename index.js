'use strict';
// TOOD:
// - html page
// -
// // WEB BLUETOOTH

const HEART_EL = window.document.querySelector('.heart');

function activateBlue() {
  navigator.bluetooth.requestDevice({
      filters: [{
        services: ['heart_rate']
      }]
    })
    .then(device => {
      console.log(device);
    })
    .then(service => service.getCharacteristic('heart_rate_measurement'))
    .catch(error => {
      console.log(`error`);
    });
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
pulseHeart(computedHeart);

// setInterval(()=>{pulseHeart(computedHeart);},10000);
