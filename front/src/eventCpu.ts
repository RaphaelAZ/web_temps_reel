import { initCharts, pushCharts } from "./charts";
import type { CpuInfo, CpuTimes, Payload } from "./model";
import { hideAlert, initUI, setStatus, showAlert, updateMetrics } from "./ui";

export class EventCpu {
    private SSE_URL = 'http://localhost:3000/events';
    private es: EventSource | undefined = undefined;
    constructor() {}

    connect() {
        this.es = new EventSource(this.SSE_URL);
        setStatus('connecting');
        this.es.addEventListener('connected', () => setStatus('connected'));

        this.es.addEventListener('metrics', (e: MessageEvent) => {
            console.log('METRICS RECEIVED');
            try {
                onPayload(JSON.parse(e.data));
                hideAlert();
            }
            catch (err) { console.error('Parse error', err); }
        });

        this.es.addEventListener('alert', (e: MessageEvent) => {
            console.log('ALERT RECEIVED');
            try {
                onPayload(JSON.parse(e.data));
                showAlert('LE CPU EST EN TRAIN DE FUMER!');
            }
            catch (err) { console.error('Parse error', err); }
        });

        this.es.onerror = () => {
            setStatus('error');
            this.es!.close();
            setTimeout(() => this.connect(), 3000);
        };
    }

    disconnect() {
        setStatus('disconnected');
        previousCpus = null;
        this.es!.close();
    }
}

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