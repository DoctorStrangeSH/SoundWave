// ============================================
// SoundWave — Плейлист и IndexedDB
// ============================================

let playlist = [];
let db = null;

// ========== INDEXEDDB ==========

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SoundWaveDB', 1);
    
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('tracks')) {
        db.createObjectStore('tracks', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };
    
    request.onerror = (e) => reject(e.target.error);
  });
}

async function saveTrackToDB(trackData) {
  if (!db) await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['tracks'], 'readwrite');
    const store = transaction.objectStore('tracks');
    const request = store.add({
      name: trackData.name,
      artist: trackData.artist || '',
      duration: trackData.duration,
      size: trackData.size,
      buffer: trackData.buffer,
      addedAt: new Date().toISOString()
    });
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadTracksFromDB() {
  if (!db) await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['tracks'], 'readonly');
    const store = transaction.objectStore('tracks');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function deleteTrackFromDB(id) {
  if (!db) await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['tracks'], 'readwrite');
    const store = transaction.objectStore('tracks');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ========== ПЛЕЙЛИСТ ==========

function getTracks() {
  return playlist;
}

async function addTrack(trackData) {
  playlist.push({
    id: Date.now(),
    name: trackData.name,
    artist: trackData.artist || '',
    duration: trackData.duration,
    buffer: trackData.buffer,
    size: trackData.size
  });
  
  updatePlaylistUI();
  
  if (playlist.length === 1) {
    loadTrack(0);
  }
  
  try {
    await saveTrackToDB(trackData);
  } catch (e) {
    console.log('Не удалось сохранить в IndexedDB');
  }
}

function removeTrack(index) {
  if (index < 0 || index >= playlist.length) return;
  
  const track = playlist[index];
  playlist.splice(index, 1);
  
  if (track.dbId) {
    deleteTrackFromDB(track.dbId).catch(() => {});
  }
  
  if (index === currentTrackIndex) {
    stopAudio();
    stopVisualization();
    stopProgressUpdate();
    
    if (playlist.length > 0) {
      const newIndex = Math.min(index, playlist.length - 1);
      loadTrack(newIndex);
    } else {
      currentTrackIndex = -1;
      document.getElementById('trackTitle').textContent = 'Нет трека';
      document.getElementById('trackArtist').textContent = 'Загрузи музыку для начала';
    }
  } else if (index < currentTrackIndex) {
    currentTrackIndex--;
  }
  
  updatePlaylistUI();
}

function updatePlaylistUI() {
  const container = document.getElementById('playlistContainer');
  const countEl = document.getElementById('playlistCount');
  
  if (!container) return;
  
  countEl.textContent = `${playlist.length} треков`;
  
  if (playlist.length === 0) {
    container.innerHTML = '<p class="text-muted text-center py-3">Плейлист пуст. Загрузи треки!</p>';
    return;
  }
  
  container.innerHTML = playlist.map((track, index) => `
    <div class="track-item d-flex align-items-center gap-3 p-2 ${index === currentTrackIndex ? 'active' : ''}" 
         onclick="loadTrack(${index})">
      <span class="text-muted small" style="width: 24px;">
        ${index === currentTrackIndex ? '<i class="bi bi-play-fill text-accent"></i>' : (index + 1)}
      </span>
      <div class="flex-grow-1 min-w-0">
        <p class="fw-semibold mb-0 small text-truncate">${track.name}</p>
        <small class="text-muted">${track.artist || 'Неизвестный исполнитель'}</small>
      </div>
      <small class="text-muted">${formatTime(track.duration)}</small>
      <button class="btn btn-sm text-muted" onclick="event.stopPropagation(); removeTrack(${index})" title="Удалить">
        <i class="bi bi-trash3"></i>
      </button>
    </div>
  `).join('');
}

// ========== ЭКСПОРТ / ИМПОРТ ==========

function exportPlaylist() {
  if (playlist.length === 0) {
    showToast('Плейлист пуст. Добавь треки!', 'warning');
    return;
  }
  
  const exportData = playlist.map(track => ({
    name: track.name,
    artist: track.artist,
    duration: track.duration,
    size: track.size
  }));
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `soundwave-playlist-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast(`Плейлист экспортирован (${playlist.length} треков) 📋`, 'success');
}

function importPlaylist(file) {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      if (!Array.isArray(data)) {
        throw new Error('Неверный формат');
      }
      
      showToast(`Импортировано треков: ${data.length}. Загрузи аудиофайлы для воспроизведения.`, 'info');
      
      data.forEach(track => {
        playlist.push({
          id: Date.now() + Math.random(),
          name: track.name || 'Неизвестный трек',
          artist: track.artist || '',
          duration: track.duration || 0,
          buffer: null,
          size: track.size || 0
        });
      });
      
      updatePlaylistUI();
      
      if (currentTrackIndex < 0 && playlist.length > 0) {
        loadTrack(0);
      }
    } catch (error) {
      showToast('Ошибка импорта. Проверь формат файла.', 'danger');
    }
  };
  
  reader.readAsText(file);
}

// Обработчики экспорта/импорта
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('exportBtn')?.addEventListener('click', exportPlaylist);
  document.getElementById('importBtn')?.addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile')?.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      importPlaylist(e.target.files[0]);
      e.target.value = '';
    }
  });
});

// Загружаем треки из IndexedDB при старте
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await openDatabase();
    const savedTracks = await loadTracksFromDB();
    
    if (savedTracks.length > 0) {
      playlist = savedTracks.map(t => ({
        id: t.id,
        dbId: t.id,
        name: t.name,
        artist: t.artist,
        duration: t.duration,
        buffer: t.buffer,
        size: t.size
      }));
      
      updatePlaylistUI();
      loadTrack(0);
    }
  } catch (e) {
    console.log('IndexedDB не поддерживается или пуста');
  }
});