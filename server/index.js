const express = require('express');
const cors = require('cors');
const os = require('os');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

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
    client.write(`event: metrics\ndata: ${payload}\n\n`);
  }
}, 2000);

app.get('/metrics', (_req, res) => res.json({ cpus: os.cpus() }));

app.listen(PORT, () => {
  console.log(`Monitoring server running on http://localhost:${PORT}`);
  console.log(`SSE endpoint: http://localhost:${PORT}/events`);
});