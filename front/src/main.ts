import './style.css';
import { EventCpu } from './eventCpu';

const eventCpu = new EventCpu();
const btn = document.getElementById('btn-connect') as HTMLButtonElement;

document.addEventListener('DOMContentLoaded', () => {
  btn.dataset.connected = 'false';
  btn.textContent = 'Connecter';

  btn.addEventListener('click', () => {
    const connected = btn.dataset.connected === 'true';
    if (connected) {
      eventCpu.disconnect();
      btn.dataset.connected = 'false';
      btn.textContent = 'Connecter';
    } else {
      eventCpu.connect();
      btn.dataset.connected = 'true';
      btn.textContent = 'Déconnecter';
    }
  });
});