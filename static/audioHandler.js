let song = null;
// Fix up prefixing
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new AudioContext();
let sourceNode;
function loadSong() {
  fetch('./static/listen_to_the_future.mp3')
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
      sourceNode = context.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(context.destination);
      sourceNode.start();
    })
    .catch(e => console.error('Error playing song: ', e));
}
function stopSong() {
  if (sourceNode) {
    sourceNode.stop();
  }
}
// window.onload = loadSong;
