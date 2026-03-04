import { connect, sendMessage, changeRoom, type ChatMessage } from './socket';
import { refs, appendMessage, updateRoomUI } from './ui';

let currentUser = '';
let currentRoom = 'general';

export function registerEvents(): void {
  refs.btnJoin.addEventListener('click', () => {
    const username = refs.inputUsername.value.trim();
    const room = refs.inputRoom.value.trim() || 'general';

    if (username.length < 2) {
      refs.joinError.textContent = 'Le pseudo doit faire au moins 2 caractères.';
      return;
    }

    refs.joinScreen.classList.add('hidden');
    refs.chatScreen.classList.remove('hidden');
    updateRoomUI(room, username);

    connect(username, room, {
      onHistory({ messages }) {
        messages.forEach((m: ChatMessage) => appendMessage('message', m, username));
      },
      onMessage(msg: ChatMessage) {
        appendMessage('message', msg, username);
      },
      onSystem(text: string) {
        appendMessage('system', { message: text }, username);
      },
      onChatError(text: string) {
        appendMessage('chat_error', { message: text }, username);
      },
      onDisconnect() {
        appendMessage('system', { message: 'Déconnecté du serveur.' }, username);
      },
    });
  });

  refs.messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = refs.inputMessage.value.trim();
    if (!content) return;
    sendMessage(content);
    refs.inputMessage.value = '';
  });

  refs.btnChangeRoom.addEventListener('click', () => {
    const newRoom = refs.inputNewRoom.value.trim();
    if (!newRoom) return;
    currentRoom = newRoom;
    updateRoomUI(currentRoom, currentUser);
    changeRoom(newRoom);
    refs.inputNewRoom.value = '';
  });
}
