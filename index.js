// TOOD:
// - html page
// -
// // WEB BLIETOOTH


function activateBlue() {
navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] })
.then(device => { debugger; })
.catch(error => { console.log(error); });
}