// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Utilidades
const $ = (sel) => document.querySelector(sel);
const now = () => Date.now();
const uuid = () => crypto.randomUUID();

// API helpers
const api = {
  async getNotes() {
    try {
      const res = await fetch(`${API_URL}/api/notes`);
      if (!res.ok) throw new Error('Falha ao carregar notas');
      return await res.json();
    } catch (err) {
      console.error('API error:', err);
      // Fallback para localStorage
      return this.getLocalNotes();
    }
  },
  async saveNote(note) {
    try {
      const res = await fetch(`${API_URL}/api/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });
      if (!res.ok) throw new Error('Falha ao salvar nota');
      return await res.json();
    } catch (err) {
      console.error('API error:', err);
      // Fallback para localStorage
      return this.saveLocalNote(note);
    }
  },
  async deleteNote(id) {
    try {
      const res = await fetch(`${API_URL}/api/notes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir nota');
      return true;
    } catch (err) {
      console.error('API error:', err);
      return this.deleteLocalNote(id);
    }
  },
  async syncAll(notes) {
    try {
      const res = await fetch(`${API_URL}/api/notes/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      if (!res.ok) throw new Error('Falha ao sincronizar');
      return await res.json();
    } catch (err) {
      console.error('API error:', err);
      return { notes: this.getLocalNotes().notes || [] };
    }
  },
  // Fallback para localStorage
  getLocalNotes() {
    const stored = localStorage.getItem('notesData');
    return stored ? JSON.parse(stored) : { notes: [], activeNoteId: undefined, lastChangeAt: 0 };
  },
  saveLocalNote(note) {
    const data = this.getLocalNotes();
    const idx = data.notes.findIndex(n => n.id === note.id);
    if (idx >= 0) {
      data.notes[idx] = note;
    } else {
      data.notes.push(note);
    }
    localStorage.setItem('notesData', JSON.stringify(data));
    return note;
  },
  deleteLocalNote(id) {
    const data = this.getLocalNotes();
    data.notes = data.notes.filter(n => n.id !== id);
    localStorage.setItem('notesData', JSON.stringify(data));
    return true;
  }
};

let state = { notes: [], activeNoteId: undefined, lastChangeAt: 0 };
let syncStatus = 'online';

// Elements
const newNoteBtn = $("#newNoteBtn");
const searchInput = $("#searchInput");
const notesList = $("#notesList");
const titleInput = $("#titleInput");
const contentInput = $("#contentInput");
const metaInfo = $("#metaInfo");
const exportTxtBtn = $("#exportTxtBtn");
const exportJsonBtn = $("#exportJsonBtn");
const importJsonInput = $("#importJsonInput");
const deleteBtn = $("#deleteBtn");
const pinBtn = $("#pinBtn");
const syncStatusEl = $("#syncStatus");
const installBtn = $("#installBtn");

function updateSyncStatus(status) {
  syncStatus = status;
  syncStatusEl.textContent = status === 'online' ? '●' : '○';
  syncStatusEl.className = `sync-status ${status}`;
  syncStatusEl.title = status === 'online' ? 'Online' : 'Offline';
}

// Network status
window.addEventListener('online', () => {
  updateSyncStatus('online');
  syncAll();
});
window.addEventListener('offline', () => updateSyncStatus('offline'));

function formatDate(ts) { return new Date(ts).toLocaleString('pt-BR'); }
function sortNotes(notes) {
  return [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });
}
function getActiveNote() { return state.notes.find(n => n.id === state.activeNoteId); }
function preview(text, max = 60) {
  const t = (text || '').trim().replace(/\s+/g, ' ');
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
}

function renderNotesList() {
  const q = (searchInput.value || '').toLowerCase();
  const filtered = sortNotes(state.notes).filter(n =>
    (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q)
  );
  notesList.innerHTML = '';
  for (const n of filtered) {
    const li = document.createElement('li');
    li.className = n.id === state.activeNoteId ? 'active' : '';
    li.innerHTML = `
      <span class="title">${n.pinned ? '📌 ' : ''}${n.title || '(Sem título)'}</span>
      <span class="preview">${preview(n.content || '')}</span>
      <span class="meta">Atualizada: ${formatDate(n.updatedAt)}</span>
    `;
    li.addEventListener('click', () => { state.activeNoteId = n.id; renderAll(); });
    notesList.appendChild(li);
  }
}

function renderEditor() {
  const n = getActiveNote();
  if (!n) {
    titleInput.value = '';
    contentInput.value = '';
    metaInfo.textContent = 'Nenhuma nota selecionada.';
    return;
  }
  titleInput.value = n.title || '';
  contentInput.value = n.content || '';
  metaInfo.textContent = `Criada: ${formatDate(n.createdAt)} • Atualizada: ${formatDate(n.updatedAt)}${
    n.sourceUrl ? ' • Origem: ' + new URL(n.sourceUrl).hostname : ''
  }`;
}

function renderAll() { renderNotesList(); renderEditor(); }

async function load() {
  try {
    const data = await api.getNotes();
    state = { ...state, ...data };
    if (!state.activeNoteId && state.notes[0]) {
      state.activeNoteId = sortNotes(state.notes)[0].id;
    }
    renderAll();
    updateSyncStatus('online');
  } catch (err) {
    console.error('Load error:', err);
    updateSyncStatus('offline');
    const local = api.getLocalNotes();
    state = { ...state, ...local };
    renderAll();
  }
}

async function persist() {
  const n = getActiveNote();
  if (!n) return;
  n.updatedAt = now();
  state.lastChangeAt = now();
  try {
    await api.saveNote(n);
    updateSyncStatus('online');
  } catch (err) {
    console.error('Persist error:', err);
    updateSyncStatus('offline');
  }
  renderNotesList();
}

async function syncAll() {
  if (syncStatus !== 'online') return;
  try {
    const result = await api.syncAll(state.notes);
    if (result.notes) {
      state.notes = result.notes;
      renderAll();
    }
  } catch (err) {
    console.error('Sync error:', err);
  }
}

function createNote(initial = {}) {
  const note = {
    id: uuid(),
    title: initial.title || '',
    content: initial.content || '',
    pinned: !!initial.pinned,
    sourceUrl: initial.sourceUrl,
    createdAt: now(),
    updatedAt: now(),
  };
  state.notes.push(note);
  state.activeNoteId = note.id;
}

function deleteActiveNote() {
  const n = getActiveNote();
  if (!n) return;
  const idx = state.notes.findIndex(x => x.id === n.id);
  state.notes.splice(idx, 1);
  state.activeNoteId = state.notes[0]?.id;
}

function debounce(fn, ms = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
const debouncedPersist = debounce(persist, 300);

// UI events
newNoteBtn.addEventListener('click', async () => {
  createNote();
  renderAll();
  await persist();
});

searchInput.addEventListener('input', () => renderNotesList());

titleInput.addEventListener('input', () => {
  const n = getActiveNote();
  if (!n) return;
  n.title = titleInput.value;
  debouncedPersist();
});

contentInput.addEventListener('input', () => {
  const n = getActiveNote();
  if (!n) return;
  n.content = contentInput.value;
  debouncedPersist();
});

pinBtn.addEventListener('click', async () => {
  const n = getActiveNote();
  if (!n) return;
  n.pinned = !n.pinned;
  n.updatedAt = now();
  renderAll();
  await persist();
});

deleteBtn.addEventListener('click', async () => {
  const n = getActiveNote();
  if (!n) return;
  if (!confirm('Excluir esta nota? Esta ação não pode ser desfeita.')) return;
  await api.deleteNote(n.id);
  deleteActiveNote();
  renderAll();
});

exportTxtBtn.addEventListener('click', () => {
  const n = getActiveNote();
  if (!n) return;
  const blob = new Blob([n.content || ''], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${(n.title || 'nota').replace(/[^a-z0-9_-]/gi, '_')}.txt`;
  a.click();
});

exportJsonBtn.addEventListener('click', async () => {
  const data = await api.getNotes();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `notas_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
});

importJsonInput.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!Array.isArray(data.notes)) throw new Error('Arquivo inválido');
    const existing = new Map(state.notes.map(n => [n.id, n]));
    for (const n of data.notes) {
      existing.set(n.id, n);
    }
    state.notes = Array.from(existing.values());
    state.activeNoteId = data.activeNoteId || state.activeNoteId;
    renderAll();
    await syncAll();
    alert('Importação concluída!');
  } catch (err) {
    alert('Falha ao importar: ' + err.message);
  } finally {
    e.target.value = '';
  }
});

// PWA Install
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block';
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log('Install outcome:', outcome);
  deferredPrompt = null;
  installBtn.style.display = 'none';
});

// Initialize
load();
setInterval(syncAll, 30000); // Sync every 30s

