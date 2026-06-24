// ============================================
// SoundWave — Web Audio API движок
// ============================================

let audioContext = null;
let audioSource = null;
let analyserNode = null;
let gainNode = null;
let isPlaying = false;
let currentAudioBuffer = null;
let startTime = 0;
let pausedAt = 0;

function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 256;
    
    gainNode = audioContext.createGain();
    gainNode.connect(analyserNode);
    analyserNode.connect(audioContext.destination);
  }
  
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

async function loadAudioFile(file) {
  initAudioContext();
  
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  return {
    buffer: audioBuffer,
    name: file.name.replace(/\.[^/.]+$/, ''),
    duration: audioBuffer.duration,
    size: file.size
  };
}

function playAudio(audioBuffer) {
  initAudioContext();
  stopAudio();
  
  audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  audioSource.connect(gainNode);
  
  const offset = pausedAt;
  audioSource.start(0, offset);
  startTime = audioContext.currentTime - offset;
  isPlaying = true;
  pausedAt = 0;
  
  audioSource.onended = () => {
    if (isPlaying && audioContext.currentTime - startTime >= audioBuffer.duration - 0.1) {
      onTrackEnd();
    }
  };
  
  currentAudioBuffer = audioBuffer;
  updatePlayButton(true);
}

function pauseAudio() {
  if (audioSource && isPlaying) {
    pausedAt = audioContext.currentTime - startTime;
    audioSource.stop();
    isPlaying = false;
    updatePlayButton(false);
  }
}

function resumeAudio() {
  if (currentAudioBuffer && !isPlaying) {
    audioSource = audioContext.createBufferSource();
    audioSource.buffer = currentAudioBuffer;
    audioSource.connect(gainNode);
    audioSource.start(0, pausedAt);
    startTime = audioContext.currentTime - pausedAt;
    isPlaying = true;
    pausedAt = 0;
    updatePlayButton(true);
  }
}

function stopAudio() {
  if (audioSource) {
    try { audioSource.stop(); } catch(e) {}
    audioSource = null;
  }
  isPlaying = false;
  pausedAt = 0;
  updatePlayButton(false);
}

function setVolume(value) {
  if (gainNode) {
    gainNode.gain.value = value / 100;
  }
}

function getCurrentTime() {
  if (!isPlaying || !currentAudioBuffer) return 0;
  return audioContext.currentTime - startTime;
}

function getTotalTime() {
  return currentAudioBuffer ? currentAudioBuffer.duration : 0;
}

function getPlaybackProgress() {
  if (!currentAudioBuffer) return 0;
  const current = getCurrentTime();
  const total = getTotalTime();
  return total > 0 ? (current / total) * 100 : 0;
}

function seekTo(percent) {
  if (!currentAudioBuffer) return;
  const time = (percent / 100) * currentAudioBuffer.duration;
  pausedAt = time;
  stopAudio();
  resumeAudio();
}

function getFrequencyData() {
  if (!analyserNode) return new Uint8Array(128);
  const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
  analyserNode.getByteFrequencyData(dataArray);
  return dataArray;
}

function updatePlayButton(playing) {
  const btn = document.getElementById('playBtn');
  if (btn) {
    btn.innerHTML = playing 
      ? '<i class="bi bi-pause-fill fs-3"></i>' 
      : '<i class="bi bi-play-fill fs-3"></i>';
  }
}

function onTrackEnd() {
  if (typeof playNext === 'function') playNext();
}