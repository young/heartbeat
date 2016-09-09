'use strict';
// TOOD:
// - html page
// -
// // WEB BLUETOOTH
const log = console.log;
console.log = overrideConsole;
const consoleEl = document.querySelector('.console');
function overrideConsole(data) {
  if (data === 'vibrate') {
    return null;
  }
  const msg = document.createElement('div');
  msg.innerHTML = data;
  consoleEl.appendChild(msg);
  consoleEl.scrollTop = consoleEl.scrollHeight;
  log(data);
}

const HEART_EL = window.document.querySelector('.heart');
const HEARTRATE_EVENT_NAME = 'heartbeat';
const PLAY_MUSIC_EVENT_NAME = 'play_music';
const STOP_MUSIC_EVENT_NAME = 'stop_music';
const MUSIC_CONTROL_EVENT_NAME = 'music_control';
const HEARTRATE_BROADCAST_EVENT_NAME = 'heartbeat broadcast';
const SHOW_HEARTS_EVENT = 'show_hearts';

/** WEB SOCKET STUFF */
let ws;
try {
  ws = new WebSocket(`wss://heartbeats.site`);
} catch(e) {
  // Start offline mode
  document.querySelector('.offlineButton').style.display = 'inline';
}

const pongPayload = JSON.stringify({name: 'pong'});

// Local dev only
// const ws = new WebSocket(`ws://localhost:4080`);
if (ws) {
  Rx.Observable.fromEvent(ws, 'message', ({data}) => {
        try {
          const parsedData = JSON.parse(data);
          if (parsedData.name === HEARTRATE_EVENT_NAME) {
            console.log(data);

            return parsedData.heartRate;
          }
          if (parsedData.name === PLAY_MUSIC_EVENT_NAME) {
            playMusic(parsedData.date);
            return null;
          }
          if (parsedData.name === STOP_MUSIC_EVENT_NAME) {
            stopMusic();
            return null;
          }
          if (parsedData.name === SHOW_HEARTS_EVENT) {
            const canvas = document.querySelector('#heart-canvas');
            if (canvas) {
              canvas.parentNode.removeChild(canvas);
            }
            new p5(sketch);
            console.log(data);
            return null;
          }
          if (parsedData.name === 'ping') {
            ws.send(pongPayload);
            console.info('pong');
            return null;
          }

        } catch(e) {
          console.log(`SERVER MESSAGE: ${data}`);
          return null;
        }
    })
    .filter((HR) => HR !== null)
    .distinctUntilChanged()
    .subscribe(
      (HR) => {
        console.log(HR);
        pulseHeart(HR);
      },
      (error) => {console.error('Websocket error from server:', error);},
      () => { console.log('Done');}
    );
}
/** END WEB SOCKET STUFF */

let pulseInterval;
function pulseHeart(rate) {
  const MINUTE = 60;
  const computedHeart = (rate / MINUTE) * 1000;
  const intervalRate = 1000000/computedHeart;

  if (pulseInterval) {
    clearInterval(pulseInterval);
    setTimeout(() => {
        pulseInterval = setInterval(()=> {
            navigator.vibrate([50, 10, 50]);
        }, intervalRate);
      }, intervalRate + 50);
  } else {
      pulseInterval = setInterval(()=> {
          navigator.vibrate([50, 10, 50]);
      }, intervalRate);
  }

  HEART_EL.style.animation = `heartscale ${1000/computedHeart}s infinite`;
}

function playMusic(dateToPlay) {
  loadSong();
}

function stopMusic() {
  clearInterval(musicPlayInterval);
  stopSong();
}
