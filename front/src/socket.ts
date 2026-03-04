import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

export interface ChatMessage {
  username: string;
  content: string;
  room: string;
  createdAt: string;
}

export interface SocketHandlers {
  onHistory: (data: { room: string; messages: ChatMessage[] }) => void;
  onMessage: (msg: ChatMessage) => void;
  onSystem: (text: string) => void;
  onChatError: (text: string) => void;
  onDisconnect: () => void;
}

let socket: Socket | null = null;

export function connect(username: string, room: string, handlers: SocketHandlers): void {
  socket = io(SOCKET_URL);

  socket.on('connect', () => {
    socket!.emit('join', { username, room });
  });

  socket.on('history', handlers.onHistory);
  socket.on('message', handlers.onMessage);
  socket.on('system', handlers.onSystem);
  socket.on('chat_error', handlers.onChatError);
  socket.on('disconnect', handlers.onDisconnect);
}

export function sendMessage(content: string): void {
  socket?.emit('message', { content });
}

export function changeRoom(room: string): void {
  socket?.emit('changeRoom', { room });
}
