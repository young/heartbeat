let song = null;
// Fix up prefixing
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new AudioContext();

function loadSong() {
  fetch('./static/listen_to_the_future.mp3')
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
      let sourceNode = context.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(context.destination);
      sourceNode.start();
    })
    .catch(e => console.error('Error playing song: ', e));
}
// window.onload = loadSong;
