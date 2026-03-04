import type { CpuInfo, CpuTimes, Payload } from './model';
import { initCharts, pushCharts } from './charts';
import { initUI, updateMetrics, setStatus, showAlert, hideAlert } from './ui';
import './style.css';

const SSE_URL = 'http://localhost:3000/events';

let previousCpus: CpuInfo[] | null = null;
let initialized = false;

function computeUsage(prev: CpuInfo, curr: CpuInfo): number {
  const total = (t: CpuTimes) => t.user + t.nice + t.sys + t.idle + t.irq;
  const totalDiff = total(curr.times) - total(prev.times);
  const idleDiff  = curr.times.idle - prev.times.idle;
  if (totalDiff === 0) return 0;
  return +((1 - idleDiff / totalDiff) * 100).toFixed(1);
}

function onPayload(payload: Payload) {
  const { timestamp, cpus } = payload;

  if (!initialized) {
    initUI(cpus);
    initCharts(cpus);
    initialized = true;
  }

  if (!previousCpus) {
    previousCpus = cpus;
    return;
  }

  const usages = cpus.map((cpu, i) => computeUsage(previousCpus![i], cpu));
  previousCpus = cpus;

  const avg  = +(usages.reduce((a, b) => a + b, 0) / usages.length).toFixed(1);
  const time = new Date(timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  updateMetrics(avg, usages);
  pushCharts(time, avg, usages);
}

function connect() {
  setStatus('connecting');
  const es = new EventSource(SSE_URL);

  es.addEventListener('connected', () => setStatus('connected'));

  es.addEventListener('metrics', (e: MessageEvent) => {
    try {
      onPayload(JSON.parse(e.data));
      hideAlert();
    }
    catch (err) { console.error('Parse error', err); }
  });

  es.addEventListener('alert', (e: MessageEvent) => {
    try {
      onPayload(JSON.parse(e.data));
      showAlert('LE CPU EST EN TRAIN DE FUMER!');
    }
    catch (err) { console.error('Parse error', err); }
  });

  es.onerror = () => {
    setStatus('error');
    es.close();
    setTimeout(connect, 3000);
  };
}

connect();