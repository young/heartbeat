'use strict';
// TOOD:
// - html page
// -
// // WEB BLUETOOTH

const HEART_EL = window.document.querySelector('.heart');
const HEARTRATE_EVENT_NAME = 'heartbeat';
const PLAY_MUSIC_EVENT_NAME = 'play_music';
const STOP_MUSIC_EVENT_NAME = 'stop_music';
const MUSIC_CONTROL_EVENT_NAME = 'music_control';
const HEARTRATE_BROADCAST_EVENT_NAME = 'heartbeat broadcast';
const SERVER_IP = '138.68.120.8';


/** WEB SOCKET STUFF */
const host = window.document.location.host.replace(/:.*/, '');

// const ws = new WebSocket(`wss://heartbeats.site`);
const ws = new WebSocket(`ws://localhost:4080`);

Rx.Observable.fromEvent(ws, 'message', ({data}) => {
  console.log(data);
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.name === HEARTRATE_EVENT_NAME) {
          return parsedData.heartRate;
        }
        if (parsedData.name === PLAY_MUSIC_EVENT_NAME) {
          playMusic(parsedData.date);
          console.log(data);
          return null;
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

  Rx.Observable.fromEvent(ws, 'ping')
    .subscribe(
      () => {
        console.log('pong');
        ws.pong();
      },
      (error) => {console.error('Websocket error from server:', error);},
      () => { console.log('Done');}
    );

/** END WEB SOCKET STUFF */

let pulseInterval;
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
  const hrAnimation = `heartscale ${1000/computedHeart}s infinite`;
  HEART_EL.style.animation = hrAnimation ;
}

function playMusic(dateToPlay) {
  let tmpInterval = setInterval(() => {
    const date = new Date().toUTCString();
    if (date === dateToPlay) {
      clearInterval(tmpInterval);
      loadSong();
    }
  }, 20);
}
