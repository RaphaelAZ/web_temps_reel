import type { CpuInfo } from './model';

const $ = (id: string) => document.getElementById(id)!;

export function setBar(id: string, value: number): void {
  const el = $(id) as HTMLElement;
  if (!el) return;
  el.style.width = `${Math.min(100, Math.max(0, value))}%`;
  el.style.background =
    value > 80 ? 'var(--danger)' : value > 60 ? 'var(--warning)' : 'var(--ok)';
}

export function initUI(cpus: CpuInfo[]): void {
  ($('cpu-model') as HTMLElement).textContent = cpus[0]?.model ?? '—';
  ($('cpu-speed') as HTMLElement).textContent = `${cpus[0]?.speed ?? '—'}`;
  ($('cpu-cores') as HTMLElement).textContent = `${cpus.length}`;

  const grid = $('cores-grid');
  if (grid) {
    grid.innerHTML = cpus.map((_, i) => `
      <div class="card">
        <div class="card-title">Core ${i}</div>
        <div class="card-value" id="core-val-${i}">—</div>
        <div class="card-unit">%</div>
        <div class="card-bar-wrap"><div class="card-bar" id="core-bar-${i}"></div></div>
      </div>`).join('');
  }
}

export function updateMetrics(avg: number, usages: number[]): void {
  ($('val-avg') as HTMLElement).textContent = `${avg}`;
  setBar('bar-avg', avg);

  usages.forEach((u, i) => {
    const valEl = $(`core-val-${i}`);
    if (valEl) valEl.textContent = `${u}`;
    setBar(`core-bar-${i}`, u);
  });
}

const statusEl = $('sse-status');

const alertOverlay = $('alert-overlay');
const alertMessage = $('alert-message');

($('alert-close') as HTMLButtonElement).addEventListener('click', () => {
  alertOverlay.classList.add('hidden');
});

export function showAlert(message: string): void {
  alertMessage.textContent = message;
  alertOverlay.classList.remove('hidden');
}

export function hideAlert(): void {
  alertOverlay.classList.add('hidden');
}

const shrekOverlay = $('shrek-overlay');
const shrekGif     = $('shrek-gif') as HTMLElement;

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'F12') {
    e.preventDefault();
    const isHidden = shrekOverlay.classList.toggle('hidden');
    if (!isHidden) {
      shrekGif.style.animation = 'none';
      shrekGif.offsetHeight;
      shrekGif.style.animation = '';
    }
  }
});

export function setStatus(state: 'connected' | 'connecting' | 'error'): void {
  const dot = document.createElement('span');
  dot.className = 'status-dot';
  statusEl.className = `sse-status ${state}`;
  statusEl.textContent = '';
  statusEl.appendChild(dot);
  const labels = { connected: 'Connecté', connecting: 'Connexion…', error: 'Déconnecté' };
  statusEl.append(` ${labels[state]}`);
}
