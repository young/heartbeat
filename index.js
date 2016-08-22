// TOOD:
// - html page
// -
// // WEB BLIETOOTH


function activateBlue() {
navigator.bluetooth.requestDevice({ filters: [{ services: ['battery_service'] }] })
.then(device => { debugger; })
.catch(error => { console.log(error); });
}