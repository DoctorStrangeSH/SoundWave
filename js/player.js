// ============================================
// SoundWave — Управление плеером
// ============================================

let currentTrackIndex = -1;
let isShuffled = false;
let repeatMode = 'none'; // none, one, all
let updateInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  setupPlayerControls();
  updatePlaylistUI();
});

function setupPlayerControls() {
  // Play/Pause
  document.getElementById('playBtn').addEventListener('click', () => {
    isPlaying ? pauseAudio() : resumeAudio();
  });
  
  // Предыдущий трек
  document.getElementById('prevBtn').addEventListener('click', playPrevious);
  
  // Следующий трек
  document.getElementById('nextBtn').addEventListener('click', playNext);
  
  // Перемешивание
  document.getElementById('shuffleBtn').addEventListener('click', toggleShuffle);
  
  // Повтор
  document.getElementById('repeatBtn').addEventListener('click', toggleRepeat);
  
  // Громкость
  const volumeBar = document.getElementById('volumeBar');
  volumeBar.addEventListener('input', () => setVolume(volumeBar.value));
  setVolume(volumeBar.value);
  
  // Перемотка
  const seekBar = document.getElementById('seekBar');
  seekBar.addEventListener('input', () => {
    if (currentAudioBuffer) seekTo(seekBar.value);
  });
  
  // Клавиатура
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    
    switch(e.code) {
      case 'Space':
        e.preventDefault();
        isPlaying ? pauseAudio() : resumeAudio();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (currentAudioBuffer) {
          const newTime = getCurrentTime() - 5;
          seekTo((newTime / getTotalTime()) * 100);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (currentAudioBuffer) {
          const newTime = getCurrentTime() + 5;
          seekTo((newTime / getTotalTime()) * 100);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        volumeBar.value = Math.min(100, parseInt(volumeBar.value) + 5);
        setVolume(volumeBar.value);
        break;
      case 'ArrowDown':
        e.preventDefault();
        volumeBar.value = Math.max(0, parseInt(volumeBar.value) - 5);
        setVolume(volumeBar.value);
        break;
    }
  });
}

function loadTrack(index) {
  const tracks = getTracks();
  if (index < 0 || index >= tracks.length) return;
  
  currentTrackIndex = index;
  const track = tracks[index];
  
  // Обновляем UI
  document.getElementById('trackTitle').textContent = track.name;
  document.getElementById('trackArtist').textContent = track.artist || 'Неизвестный исполнитель';
  document.getElementById('totalTime').textContent = formatTime(track.duration);
  
  // Media Session API
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.name,
      artist: track.artist || 'SoundWave',
      album: 'SoundWave Player',
      artwork: [
        { src: 'assets/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    });
  }
  
  // Загружаем аудио
  if (track.buffer) {
    stopAudio();
    playAudio(track.buffer);
    startVisualization();
    startProgressUpdate();
  }
  
  updatePlaylistUI();
}

function playNext() {
  const tracks = getTracks();
  if (tracks.length === 0) return;
  
  let nextIndex;
  if (isShuffled) {
    nextIndex = Math.floor(Math.random() * tracks.length);
  } else {
    nextIndex = currentTrackIndex + 1;
    if (nextIndex >= tracks.length) {
      nextIndex = repeatMode === 'all' ? 0 : -1;
    }
  }
  
  if (nextIndex >= 0) {
    loadTrack(nextIndex);
  } else {
    stopAudio();
    stopVisualization();
    stopProgressUpdate();
    document.getElementById('trackTitle').textContent = 'Нет трека';
    document.getElementById('trackArtist').textContent = 'Плейлист завершён';
  }
}

function playPrevious() {
  const tracks = getTracks();
  if (tracks.length === 0) return;
  
  // Если прошло больше 3 секунд — перезапускаем текущий
  if (getCurrentTime() > 3) {
    seekTo(0);
    return;
  }
  
  let prevIndex = currentTrackIndex - 1;
  if (prevIndex < 0) prevIndex = tracks.length - 1;
  loadTrack(prevIndex);
}

function toggleShuffle() {
  isShuffled = !isShuffled;
  const btn = document.getElementById('shuffleBtn');
  if (isShuffled) {
    btn.classList.add('active');
    btn.style.color = 'var(--accent)';
  } else {
    btn.classList.remove('active');
    btn.style.color = '';
  }
}

function toggleRepeat() {
  const modes = ['none', 'one', 'all'];
  const currentIndex = modes.indexOf(repeatMode);
  repeatMode = modes[(currentIndex + 1) % modes.length];
  
  const btn = document.getElementById('repeatBtn');
  btn.style.position = 'relative';
  
  if (repeatMode === 'none') {
    btn.style.color = '';
    btn.innerHTML = '<i class="bi bi-arrow-repeat"></i>';
    btn.classList.remove('active');
  } else if (repeatMode === 'one') {
    btn.style.color = 'var(--accent)';
    btn.innerHTML = '<i class="bi bi-arrow-repeat"></i><small style="position: absolute; font-size: 0.5rem; top: 50%; left: 50%; transform: translate(-50%, -50%);">1</small>';
    btn.classList.add('active');
  } else {
    btn.style.color = 'var(--accent)';
    btn.innerHTML = '<i class="bi bi-arrow-repeat"></i>';
    btn.classList.add('active');
  }
}

function startProgressUpdate() {
  stopProgressUpdate();
  updateInterval = setInterval(() => {
    if (!isPlaying) return;
    
    const progress = getPlaybackProgress();
    const current = getCurrentTime();
    const total = getTotalTime();
    
    document.getElementById('seekBar').value = progress;
    document.getElementById('currentTime').textContent = formatTime(current);
    
    if (progress >= 99.5) {
      if (repeatMode === 'one') {
        seekTo(0);
      } else {
        playNext();
      }
    }
  }, 200);
}

function stopProgressUpdate() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

// Переопределяем onTrackEnd
function onTrackEnd() {
  if (repeatMode === 'one') {
    seekTo(0);
  } else {
    playNext();
  }
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}