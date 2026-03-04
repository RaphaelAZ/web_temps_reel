const Message = require('../models/Message');
const User = require('../models/User');

async function getHistory(room) {
  const messages = await Message.find({ room })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return messages.reverse().map(({ username, content, room, createdAt }) => ({
    username,
    content,
    room,
    createdAt,
  }));
}

module.exports = function registerHandlers(io, socket) {
  socket.on('join', async ({ username, room = 'general' } = {}) => {
    username = (username || '').trim();
    room = (room || 'general').trim();

    if (username.length < 2) {
      return socket.emit('chat_error', 'Le nom d\'utilisateur doit faire au moins 2 caractères.');
    }

    await User.findOneAndUpdate({ username }, { username }, { upsert: true, new: true });

    socket.data.username = username;
    socket.data.room = room;
    socket.join(room);

    console.log(`[Socket.IO] "${username}" joined room "${room}"`);

    socket.emit('history', { room, messages: await getHistory(room) });
    io.to(room).emit('system', `${username} joined the room.`);
  });

  socket.on('message', async ({ content } = {}) => {
    const { username, room } = socket.data;

    if (!username) return socket.emit('chat_error', 'Room introuvable.');

    content = (content || '').trim();
    if (!content) return socket.emit('chat_error', 'Message vide.');

    const saved = await Message.create({ username, content, room });

    io.to(room).emit('message', {
      username: saved.username,
      content: saved.content,
      room: saved.room,
      createdAt: saved.createdAt,
    });
  });

  socket.on('changeRoom', async ({ room: newRoom = 'general' } = {}) => {
    const { username, room: oldRoom } = socket.data;

    if (!username) return socket.emit('chat_error', 'Pas connecté.');

    newRoom = newRoom.trim();

    io.to(oldRoom).emit('system', `${username} a quitté la salle.`);
    socket.leave(oldRoom);

    socket.data.room = newRoom;
    socket.join(newRoom);

    socket.emit('history', { room: newRoom, messages: await getHistory(newRoom) });
    io.to(newRoom).emit('system', `${username} a rejoint la salle.`);
  });

  socket.on('disconnect', () => {
    const { username, room } = socket.data;
    if (username) {
      console.log(`[Socket.IO] "${username}" déconnecté de la salle "${room}"`);
      io.to(room).emit('system', `${username} a quitté le chat.`);
    }
  });
};
