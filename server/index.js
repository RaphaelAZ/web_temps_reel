const express = require('express');
const cors = require('cors');
const os = require('os');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let previous = os.cpus();

function getCpuUsage() {
  const current = os.cpus();

  let totalIdle = 0;
  let totalTick = 0;

  current.forEach((cpu, i) => {
    const prevCpu = previous[i];

    const idle = cpu.times.idle - prevCpu.times.idle;
    const total =
      Object.values(cpu.times).reduce((a, b) => a + b) -
      Object.values(prevCpu.times).reduce((a, b) => a + b);

    totalIdle += idle;
    totalTick += total;
  });

  previous = current;

  return 100 - Math.floor((totalIdle / totalTick) * 100);
}

const clients = new Set();

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`event: connected\ndata: {"message":"SSE connected"}\n\n`);
  clients.add(res);

  req.on('close', () => {
    clients.delete(res);
  });
});

setInterval(() => {
  const payload = JSON.stringify({
    timestamp: Date.now(),
    cpus: os.cpus(),
  });

  for (const client of clients) {
    if(getCpuUsage() > 50) {
        client.write(`event: alert\ndata: ${payload}\n\n`);
    } else {
        client.write(`event: metrics\ndata: ${payload}\n\n`);
    }
  }
}, 2000);

app.get('/metrics', (_req, res) => res.json({ cpus: os.cpus() }));

app.listen(PORT, () => {
  console.log(`Monitoring server running on http://localhost:${PORT}`);
  console.log(`SSE endpoint: http://localhost:${PORT}/events`);
});