import type { ChatMessage } from './socket';

export function buildTemplate(): void {
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <!-- Join screen -->
    <div id="join-screen">
      <div class="join-card">
        <h1>💬 Chat</h1>
        <input id="input-username" type="text" placeholder="Votre pseudo" maxlength="30" />
        <button id="btn-join">Se connecter</button>
        <p id="join-error" class="error"></p>
      </div>
    </div>

    <!-- Chat screen -->
    <div id="chat-screen" class="hidden">
      <aside id="sidebar">
        <div id="sidebar-header">
          <h2>En ligne</h2>
          <span id="sidebar-me"></span>
        </div>
        <ul id="user-list"></ul>
      </aside>

      <main id="chat-main">
        <header id="chat-header">
          <span id="header-peer">← Sélectionnez un utilisateur</span>
          <span id="header-user"></span>
        </header>
        <ul id="messages"></ul>
        <form id="message-form">
          <input id="input-message" type="text" placeholder="Votre message…" autocomplete="off" disabled />
          <button type="submit" id="btn-send" disabled>Envoyer</button>
        </form>
      </main>
    </div>
  `;
}

export const refs = {
  get joinScreen()    { return document.getElementById('join-screen')!; },
  get chatScreen()    { return document.getElementById('chat-screen')!; },
  get inputUsername() { return document.getElementById('input-username') as HTMLInputElement; },
  get btnJoin()       { return document.getElementById('btn-join') as HTMLButtonElement; },
  get joinError()     { return document.getElementById('join-error')!; },
  get messagesList()  { return document.getElementById('messages')!; },
  get messageForm()   { return document.getElementById('message-form') as HTMLFormElement; },
  get inputMessage()  { return document.getElementById('input-message') as HTMLInputElement; },
  get btnSend()       { return document.getElementById('btn-send') as HTMLButtonElement; },
  get userList()      { return document.getElementById('user-list')!; },
  get headerPeer()    { return document.getElementById('header-peer')!; },
  get headerUser()    { return document.getElementById('header-user')!; },
  get sidebarMe()     { return document.getElementById('sidebar-me')!; },
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
        <strong>${escapeHtml(payload.username ?? '')}</strong>
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

export function renderUserList(
  users: string[],
  currentUser: string,
  activePeer: string,
  onSelect: (u: string) => void
): void {
  refs.userList.innerHTML = '';
  const others = users.filter(u => u !== currentUser);

  if (others.length === 0) {
    const li = document.createElement('li');
    li.className = 'no-users';
    li.textContent = 'Aucun autre utilisateur en ligne';
    refs.userList.appendChild(li);
    return;
  }

  others.forEach(u => {
    const li = document.createElement('li');
    li.className = 'user-item' + (u === activePeer ? ' active' : '');
    li.textContent = u;
    li.addEventListener('click', () => onSelect(u));
    refs.userList.appendChild(li);
  });
}

export function openChat(peer: string, currentUser: string): void {
  refs.headerPeer.textContent = `@ ${peer}`;
  refs.headerUser.textContent = currentUser;
  refs.messagesList.innerHTML = '';
  refs.inputMessage.disabled = false;
  refs.btnSend.disabled = false;
  refs.inputMessage.focus();
}
