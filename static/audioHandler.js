let song = null;
// Fix up prefixing
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new AudioContext();

const sourceNode = context.createBufferSource();

fetch('./static/listen_to_the_future.mp3')
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
  .then(audioBuffer => {
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(context.destination);
  })
  .catch(e => console.error('Error playing song: ', e));

function loadSong() {
  if (sourceNode) {
    sourceNode.start();
  }
}
function stopSong() {
  if (sourceNode) {
    sourceNode.stop();
  }
}
// window.onload = loadSong;
