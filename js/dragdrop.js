// ============================================
// SoundWave — Drag & Drop загрузка
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  setupDragDrop();
  setupFileBrowse();
});

function setupDragDrop() {
  const dropZone = document.getElementById('dropZone');
  if (!dropZone) return;
  
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });
  
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
  });
  
  dropZone.addEventListener('drop', handleDrop, false);
  
  dropZone.addEventListener('click', (e) => {
    if (e.target !== dropZone && e.target.closest('button')) return;
    document.getElementById('fileInput').click();
  });
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

async function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  
  if (files.length > 0) {
    await processFiles(files);
  }
}

function setupFileBrowse() {
  const fileInput = document.getElementById('fileInput');
  const browseBtn = document.getElementById('browseBtn');
  
  browseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });
  
  fileInput.addEventListener('change', async () => {
    if (fileInput.files.length > 0) {
      await processFiles(fileInput.files);
      fileInput.value = '';
    }
  });
}

async function processFiles(files) {
  const dropZone = document.getElementById('dropZone');
  const originalHTML = dropZone.innerHTML;
  
  dropZone.innerHTML = `
    <div class="text-center">
      <div class="spinner-border text-accent mb-3" role="status"></div>
      <p class="text-muted">Обрабатываем ${files.length} файлов...</p>
    </div>
  `;
  
  let loadedCount = 0;
  
  for (const file of files) {
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|flac|m4a)$/i)) {
      continue;
    }
    
    try {
      const trackData = await loadAudioFile(file);
      
      const nameParts = trackData.name.split(' - ');
      if (nameParts.length >= 2) {
        trackData.artist = nameParts[0].trim();
        trackData.name = nameParts.slice(1).join(' - ').trim();
      }
      
      await addTrack(trackData);
      loadedCount++;
    } catch (error) {
      console.error('Ошибка загрузки файла:', file.name, error);
    }
  }
  
  dropZone.innerHTML = originalHTML;
  
  if (loadedCount > 0) {
    showToast(`Загружено треков: ${loadedCount} 🎵`, 'success');
  } else {
    showToast('Не удалось загрузить файлы. Проверь формат.', 'danger');
  }
}

// ========== ТОСТЫ ==========

function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }
  
  const colors = {
    success: 'bg-success text-white',
    danger: 'bg-danger text-white',
    info: 'bg-info text-white',
    warning: 'bg-warning text-dark'
  };
  
  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center border-0 shadow-lg ${colors[type] || colors.info}`;
  toastEl.setAttribute('role', 'alert');
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Закрыть"></button>
    </div>
  `;
  
  container.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}