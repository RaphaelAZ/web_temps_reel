require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const registerHandlers = require('./handlers/chatHandler');

const PORT = process.env.PORT || 3001;

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: '*' },
});

connectDB().catch((err) => {
  console.error('[MongoDB] Connection error:', err.message);
  process.exit(1);
});

io.on('connection', (socket) => {
  console.log('[Socket.IO] New connection:', socket.id);
  registerHandlers(io, socket);
});

server.listen(PORT, () => {
  console.log(`[Server] Listening on port ${PORT}`);
});
