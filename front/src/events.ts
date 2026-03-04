import { connect, sendMessage, requestHistory, type ChatMessage } from './socket';
import { refs, appendMessage, renderUserList, openChat } from './ui';

let currentUser = '';
let activePeer  = '';
let onlineUsers: string[] = [];

export function registerEvents(): void {
  refs.btnJoin.addEventListener('click', handleJoin);
  refs.messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = refs.inputMessage.value.trim();
    if (!content || !activePeer) return;
    sendMessage(activePeer, content);
    refs.inputMessage.value = '';
  });
}

function handleJoin(): void {
  const username = refs.inputUsername.value.trim();

  if (username.length < 2) {
    refs.joinError.textContent = 'Le pseudo doit faire au moins 2 caractères.';
    return;
  }

  currentUser = username;
  refs.joinScreen.classList.add('hidden');
  refs.chatScreen.classList.remove('hidden');
  refs.headerUser.textContent = currentUser;
  refs.sidebarMe.textContent  = currentUser;

  connect(username, {
    onUserList(users) {
      onlineUsers = users;
      renderUserList(users, currentUser, activePeer, selectPeer);
    },
    onHistory({ with: peer, messages }) {
      if (peer !== activePeer) return;
      refs.messagesList.innerHTML = '';
      messages.forEach((m: ChatMessage) => appendMessage('message', m, currentUser));
    },
    onMessage(msg: ChatMessage) {
      const key = [currentUser, activePeer].sort().join(':');
      if (msg.conversation !== key) return;
      appendMessage('message', msg, currentUser);
    },
    onChatError(text) {
      appendMessage('chat_error', { message: text }, currentUser);
    },
    onDisconnect() {
      appendMessage('system', { message: 'Déconnecté du serveur.' }, currentUser);
    },
  });
}

function selectPeer(peer: string): void {
  activePeer = peer;
  openChat(peer, currentUser);
  requestHistory(peer);
  renderUserList(onlineUsers, currentUser, activePeer, selectPeer);
}
