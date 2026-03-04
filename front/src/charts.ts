import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Legend,
  Tooltip,
  type ChartDataset,
} from 'chart.js';
import type { CpuInfo } from './model';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Legend,
  Tooltip,
);

const MAX_POINTS  = 60;
const CORE_COLORS = ['#38bdf8', '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#fbbf24', '#f87171', '#818cf8'];

function rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function makeLineChart(
  canvasId: string,
  datasets: ChartDataset<'line', number[]>[],
): Chart {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  return new Chart(canvas, {
    type: 'line',
    data: { labels: [], datasets },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          ticks: { color: '#94a3b8', maxTicksLimit: 6, maxRotation: 0 },
          grid:  { color: 'rgba(255,255,255,0.05)' },
        },
        y: {
          min: 0,
          max: 100,
          ticks: { color: '#94a3b8' },
          grid:  { color: 'rgba(255,255,255,0.07)' },
        },
      },
      plugins: {
        legend: { labels: { color: '#cbd5e1', boxWidth: 10 } },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.9)',
          titleColor: '#e2e8f0',
          bodyColor:  '#94a3b8',
        },
      },
    },
  });
}

let chartAvg:   Chart | null = null;
let chartCores: Chart | null = null;

export function initCharts(cpus: CpuInfo[]): void {
  const avgColor = '#38bdf8';

  chartAvg = makeLineChart('chart-avg', [{
    label: 'CPU moyen (%)',
    data: [],
    borderColor:     avgColor,
    backgroundColor: rgba(avgColor, 0.12),
    borderWidth: 2,
    pointRadius: 0,
    fill: true,
    tension: 0.3,
  }]);

  const coreDatasets: ChartDataset<'line', number[]>[] = cpus.map((_, i) => ({
    label:           `Core ${i}`,
    data:            [],
    borderColor:     CORE_COLORS[i % CORE_COLORS.length],
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    pointRadius: 0,
    fill: false,
    tension: 0.3,
  }));

  chartCores = makeLineChart('chart-cores', coreDatasets);
}

export function pushCharts(time: string, avg: number, usages: number[]): void {
  if (!chartAvg || !chartCores) return;

  function push(chart: Chart, ...values: number[]) {
    const labels = chart.data.labels as string[];
    labels.push(time);
    if (labels.length > MAX_POINTS) labels.shift();
    chart.data.datasets.forEach((ds, i) => {
      (ds.data as number[]).push(values[i] ?? 0);
      if ((ds.data as number[]).length > MAX_POINTS) (ds.data as number[]).shift();
    });
    chart.update('none');
  }

  push(chartAvg,   avg);
  push(chartCores, ...usages);
}
