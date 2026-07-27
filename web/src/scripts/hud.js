// NPOS HUD client behavior: live clock + canvas mini-waveform + oscilloscope.

function startClock() {
  const el = document.querySelector('[data-hud-clock]');
  if (!el) return;
  const tick = () => {
    el.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  tick();
  setInterval(tick, 1000);
}

function startMiniWave() {
  const canvas = document.querySelector('[data-hud-miniwave]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  let phase = 0;
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(145,132,217,0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const y = h / 2 + Math.sin(x * 0.25 + phase) * (h / 2 - 3) * Math.sin(x * 0.04 + phase * 0.5);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    phase += 0.09;
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}

const SCOPE_SHAPE = [
  [0, 0.65], [0.05, 0.65], [0.1, 0.62], [0.2, 0.6], [0.3, 0.58], [0.4, 0.55],
  [0.45, 0.5], [0.47, -0.1], [0.48, -0.75], [0.5, -0.8], [0.6, -0.78], [0.7, -0.75],
  [0.8, -0.6], [0.85, -0.3], [0.88, 0.3], [0.92, 0.7], [0.95, 0.78], [1, 0.78],
];

function startScope() {
  const canvas = document.querySelector('[data-hud-scope]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  let phase = 0;
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(145,132,217,0.18)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx <= w; gx += w / 12) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }
    for (let gy = 0; gy <= h; gy += h / 6) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(145,132,217,0.35)';
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();

    ctx.strokeStyle = '#9184d9';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(145,132,217,0.6)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let i = 0; i < SCOPE_SHAPE.length - 1; i++) {
      const [x0, y0] = SCOPE_SHAPE[i], [x1, y1] = SCOPE_SHAPE[i + 1];
      const steps = Math.max(2, Math.round((x1 - x0) * 60));
      for (let j = 0; j <= steps; j++) {
        const t = j / steps;
        const x = (x0 + (x1 - x0) * t) * w;
        let y = y0 + (y1 - y0) * t;
        y += Math.sin(x * 0.15 + phase * 1.6) * 0.015;
        const py = h / 2 - y * (h / 2 - 10);
        if (i === 0 && j === 0) ctx.moveTo(x, py); else ctx.lineTo(x, py);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    phase += 0.09;
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}

startClock();
startMiniWave();
startScope();
