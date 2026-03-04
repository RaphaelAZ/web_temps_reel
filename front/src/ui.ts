import type { ChatMessage } from './socket';

export function buildTemplate(): void {
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <!-- Join screen -->
    <div id="join-screen">
      <div class="join-card">
        <h1>💬 Chat</h1>
        <input id="input-username" type="text" placeholder="Votre pseudo" maxlength="30" />
        <input id="input-room" type="text" placeholder="Salon (défaut: general)" maxlength="30" />
        <button id="btn-join">Rejoindre</button>
        <p id="join-error" class="error"></p>
      </div>
    </div>

    <!-- Chat screen -->
    <div id="chat-screen" class="hidden">
      <aside id="sidebar">
        <h2>Salon</h2>
        <div id="room-display"></div>
        <hr />
        <h3>Changer de salon</h3>
        <input id="input-new-room" type="text" placeholder="Nouveau salon" />
        <button id="btn-change-room">Changer</button>
      </aside>

      <main id="chat-main">
        <header id="chat-header">
          <span id="header-room"></span>
          <span id="header-user"></span>
        </header>
        <ul id="messages"></ul>
        <form id="message-form">
          <input id="input-message" type="text" placeholder="Votre message…" autocomplete="off" />
          <button type="submit">Envoyer</button>
        </form>
      </main>
    </div>
  `;
}

export const refs = {
  get joinScreen()    { return document.getElementById('join-screen')!; },
  get chatScreen()    { return document.getElementById('chat-screen')!; },
  get inputUsername() { return document.getElementById('input-username') as HTMLInputElement; },
  get inputRoom()     { return document.getElementById('input-room') as HTMLInputElement; },
  get btnJoin()       { return document.getElementById('btn-join') as HTMLButtonElement; },
  get joinError()     { return document.getElementById('join-error')!; },
  get messagesList()  { return document.getElementById('messages')!; },
  get messageForm()   { return document.getElementById('message-form') as HTMLFormElement; },
  get inputMessage()  { return document.getElementById('input-message') as HTMLInputElement; },
  get roomDisplay()   { return document.getElementById('room-display')!; },
  get headerRoom()    { return document.getElementById('header-room')!; },
  get headerUser()    { return document.getElementById('header-user')!; },
  get inputNewRoom()  { return document.getElementById('input-new-room') as HTMLInputElement; },
  get btnChangeRoom() { return document.getElementById('btn-change-room') as HTMLButtonElement; },
};

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatTime(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function appendMessage(
  type: 'message' | 'system' | 'chat_error',
  payload: Partial<ChatMessage> & { message?: string },
  currentUser: string
): void {
  const li = document.createElement('li');
  li.classList.add(`msg-${type}`);

  if (type === 'message') {
    const isMine = payload.username === currentUser;
    li.classList.add(isMine ? 'mine' : 'theirs');
    li.innerHTML = `
      <span class="msg-meta">
        <strong>${payload.username}</strong>
        <time>${formatTime(payload.createdAt)}</time>
      </span>
      <p class="msg-content">${escapeHtml(payload.content ?? '')}</p>
    `;
  } else {
    li.textContent = type === 'chat_error'
      ? `⚠ ${payload.message ?? payload.content}`
      : `— ${payload.message ?? payload.content} —`;
  }

  refs.messagesList.appendChild(li);
  refs.messagesList.scrollTop = refs.messagesList.scrollHeight;
}

export function updateRoomUI(room: string, username: string): void {
  refs.roomDisplay.textContent = room;
  refs.headerRoom.textContent = `# ${room}`;
  refs.headerUser.textContent = username;
  refs.messagesList.innerHTML = '';
}
