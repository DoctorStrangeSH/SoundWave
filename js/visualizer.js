// ============================================
// SoundWave — Визуализация на Canvas
// ============================================

let canvas, ctx;
let animationId;
let visualizerMode = 'bars';
let colorTheme = 'neon';
let isMicMode = false;
let micStream = null;
let micSource = null;
let micAnalyser = null;

const colorThemes = {
  neon: { primary: [168, 85, 247], secondary: [99, 102, 241], name: 'Неон' },
  fire: { primary: [239, 68, 68], secondary: [249, 115, 22], name: 'Огонь' },
  ocean: { primary: [6, 182, 212], secondary: [59, 130, 246], name: 'Океан' },
  rainbow: { primary: [168, 85, 247], secondary: [236, 72, 153], name: 'Радуга' }
};

document.addEventListener('DOMContentLoaded', initVisualizer);

function initVisualizer() {
  canvas = document.getElementById('visualizer');
  if (!canvas) return;
  
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = canvas.offsetWidth * 2;
  canvas.height = canvas.offsetHeight * 2;
}

function startVisualization() {
  const placeholder = document.getElementById('visualizerPlaceholder');
  if (placeholder) placeholder.style.display = 'none';
  if (canvas) canvas.classList.add('active');
  
  if (!animationId) animate();
}

function stopVisualization() {
  if (canvas) canvas.classList.remove('active');
  const placeholder = document.getElementById('visualizerPlaceholder');
  if (placeholder) placeholder.style.display = 'flex';
  
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function animate() {
  animationId = requestAnimationFrame(animate);
  if (!ctx || !canvas) return;
  
  let data;
  
  if (isMicMode && micAnalyser) {
    const freqData = new Uint8Array(micAnalyser.frequencyBinCount);
    micAnalyser.getByteFrequencyData(freqData);
    data = freqData;
  } else {
    data = getFrequencyData();
  }
  
  if (!data || data.length === 0) return;
  
  const w = canvas.width;
  const h = canvas.height;
  
  ctx.fillStyle = 'rgba(10, 10, 20, 0.3)';
  ctx.fillRect(0, 0, w, h);
  
  const theme = colorThemes[colorTheme] || colorThemes.neon;
  
  switch(visualizerMode) {
    case 'bars': drawBars(data, w, h, theme); break;
    case 'wave': drawWave(data, w, h, theme); break;
    case 'circle': drawCircle(data, w, h, theme); break;
  }
}

function drawBars(data, w, h, theme) {
  const barCount = 64;
  const barWidth = w / barCount;
  const gap = 2;
  
  for (let i = 0; i < barCount; i++) {
    const value = data[Math.floor(i * data.length / barCount)];
    const barHeight = (value / 255) * h * 0.8;
    
    const hue = theme.primary[0] + (i / barCount) * (theme.secondary[0] - theme.primary[0]);
    const sat = 70 + (value / 255) * 30;
    const light = 40 + (value / 255) * 30;
    
    ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
    ctx.shadowColor = `hsl(${hue}, 80%, 60%, 0.6)`;
    ctx.shadowBlur = 8;
    
    const x = i * barWidth + gap;
    const y = h - barHeight;
    ctx.fillRect(x, y, barWidth - gap * 2, barHeight);
  }
  ctx.shadowBlur = 0;
}

function drawWave(data, w, h, theme) {
  ctx.beginPath();
  ctx.lineWidth = 3;
  
  const gradient = ctx.createLinearGradient(0, 0, w, 0);
  gradient.addColorStop(0, `rgb(${theme.primary.join(',')})`);
  gradient.addColorStop(1, `rgb(${theme.secondary.join(',')})`);
  ctx.strokeStyle = gradient;
  ctx.shadowColor = `rgba(${theme.primary.join(',')}, 0.5)`;
  ctx.shadowBlur = 15;
  
  const sliceWidth = w / data.length;
  let x = 0;
  
  for (let i = 0; i < data.length; i++) {
    const v = data[i] / 255;
    const y = h / 2 + (v - 0.5) * h * 0.8;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
    x += sliceWidth;
  }
  
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawCircle(data, w, h, theme) {
  const cx = w / 2, cy = h / 2;
  const maxR = Math.min(w, h) * 0.4;
  
  ctx.beginPath();
  ctx.lineWidth = 2;
  
  const points = 128;
  for (let i = 0; i < points; i++) {
    const val = data[Math.floor(i * data.length / points)] / 255;
    const angle = (i / points) * Math.PI * 2;
    const r = maxR * (0.3 + val * 0.7);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  
  const gradient = ctx.createRadialGradient(cx, cy, maxR * 0.2, cx, cy, maxR);
  gradient.addColorStop(0, `rgb(${theme.primary.join(',')})`);
  gradient.addColorStop(1, `rgb(${theme.secondary.join(',')})`);
  ctx.strokeStyle = gradient;
  ctx.shadowColor = `rgba(${theme.primary.join(',')}, 0.5)`;
  ctx.shadowBlur = 20;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function setVisualizerMode(mode) {
  visualizerMode = mode;
  
  document.querySelectorAll('[id^="mode"]').forEach(b => b.classList.remove('active'));
  const activeBtn = document.getElementById(`mode${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
  if (activeBtn) activeBtn.classList.add('active');
}

function setColorTheme(theme) {
  colorTheme = theme;
  
  document.querySelectorAll('[id^="theme"]').forEach(b => b.classList.remove('active'));
  const activeBtn = document.getElementById(`theme${theme.charAt(0).toUpperCase() + theme.slice(1)}`);
  if (activeBtn) activeBtn.classList.add('active');
}

// ========== РЕЖИМ МИКРОФОНА ==========

async function toggleMicMode() {
  const micBtn = document.getElementById('modeMic');
  
  if (isMicMode) {
    if (micStream) {
      micStream.getTracks().forEach(t => t.stop());
      micStream = null;
    }
    micSource = null;
    micAnalyser = null;
    isMicMode = false;
    if (micBtn) micBtn.classList.remove('active');
    
    if (!isPlaying) stopVisualization();
    showToast('Режим микрофона выключен 🎤', 'info');
  } else {
    try {
      initAudioContext();
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micSource = audioContext.createMediaStreamSource(micStream);
      micAnalyser = audioContext.createAnalyser();
      micAnalyser.fftSize = 256;
      micSource.connect(micAnalyser);
      
      isMicMode = true;
      if (micBtn) micBtn.classList.add('active');
      
      if (isPlaying) pauseAudio();
      
      startVisualization();
      showToast('Говори в микрофон! 🎤', 'success');
    } catch (e) {
      showToast('Нет доступа к микрофону 😢', 'danger');
    }
  }
}