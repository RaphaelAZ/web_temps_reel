import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

export interface ChatMessage {
  username:     string;
  content:      string;
  conversation: string;
  createdAt:    string;
}

export interface SocketHandlers {
  onUserList:  (users: string[]) => void;
  onHistory:   (data: { with: string; messages: ChatMessage[] }) => void;
  onMessage:   (msg: ChatMessage) => void;
  onChatError: (text: string) => void;
  onDisconnect: () => void;
}

let socket: Socket | null = null;

export function connect(username: string, handlers: SocketHandlers): void {
  socket = io(SOCKET_URL);

  socket.on('connect', () => socket!.emit('join', { username }));

  socket.on('userList',    handlers.onUserList);
  socket.on('history',     handlers.onHistory);
  socket.on('message',     handlers.onMessage);
  socket.on('chat_error',  handlers.onChatError);
  socket.on('disconnect',  handlers.onDisconnect);
}

export function sendMessage(to: string, content: string): void {
  socket?.emit('message', { to, content });
}

export function requestHistory(withUser: string): void {
  socket?.emit('getHistory', { with: withUser });
}
