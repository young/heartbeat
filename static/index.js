'use strict';

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
// const PLAY_MUSIC_EVENT_NAME = 'play_music';
// const STOP_MUSIC_EVENT_NAME = 'stop_music';
const MUSIC_CONTROL_EVENT_NAME = 'music_control';
const HEARTRATE_BROADCAST_EVENT_NAME = 'heartbeat broadcast';
const SHOW_HEARTS_EVENT = 'show_hearts';

/** WEB SOCKET STUFF */
let ws;
try {
  ws = new WebSocket(`wss://heartbeats.site`);
} catch(e) {
  //
}
setTimeout(() => {
  if (ws.readyState !== 1) {
    // Start offline mode
    document.querySelector('.offline').style.display = 'inline';
  }
}, 2 *1000);
const pongPayload = JSON.stringify({name: 'pong'});

// Local dev only
// const ws = new WebSocket(`ws://localhost:4080`);
if (ws) {
  Rx.Observable.fromEvent(ws, 'message', ({data}) => {
      try {
        const parsedData = JSON.parse(data);
        switch(parsedData.name) {
          case HEARTRATE_EVENT_NAME:
            console.log(data);
            return parsedData.heartRate;

          // case PLAY_MUSIC_EVENT_NAME:
          //   playMusic();
          //   break;

          // case STOP_MUSIC_EVENT_NAME:
          //   stopMusic();
          //   break;

          case SHOW_HEARTS_EVENT:
            const canvas = document.querySelector('#heart-canvas');
            if (canvas) {
              canvas.parentNode.removeChild(canvas);
            }
            new p5(sketch);
            console.log(data);
            break;

          case 'ping':
            ws.send(pongPayload);
            console.info('pong');
            break;

          default:
            return null;
        }
        return null;

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
    setTimeout(() => {
        pulseInterval = setInterval(()=> {
            navigator.vibrate([50, 20, 50]);
        }, intervalRate);
      }, intervalRate);
    clearInterval(pulseInterval);

  } else {
      pulseInterval = setInterval(()=> {
          navigator.vibrate([50, 10, 50]);
      }, intervalRate);
  }

  HEART_EL.style.animation = `heartscale ${1000/computedHeart}s infinite`;
}

const love = JSON.stringify({name: 'love'});

function sendLove() {
  navigator.vibrate(50);
  if (ws) {
    ws.send(love);
  }
}

function startOffline() {
  new p5(sketch);
}
