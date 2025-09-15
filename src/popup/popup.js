// Utilidades
const $ = (sel) => document.querySelector(sel);
const now = () => Date.now();
const uuid = () => crypto.randomUUID();

// Chrome storage helpers
const storage = {
  async get() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["notesData"], (res) => {
        resolve(res.notesData || { notes: [], activeNoteId: undefined, lastChangeAt: 0 });
      });
    });
  },
  async set(data) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ notesData: data }, resolve);
    });
  },
};

let state = { notes: [], activeNoteId: undefined, lastChangeAt: 0 };

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

function formatDate(ts){ return new Date(ts).toLocaleString(); }
function sortNotes(notes){
  return [...notes].sort((a,b)=>{
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });
}
function getActiveNote(){ return state.notes.find(n=>n.id===state.activeNoteId); }
function preview(text,max=60){ const t=(text||'').trim().replace(/\s+/g,' '); return t.length>max?t.slice(0,max-1)+'…':t; }

function renderNotesList(){
  const q=(searchInput.value||'').toLowerCase();
  const filtered = sortNotes(state.notes).filter(n =>
    (n.title||'').toLowerCase().includes(q) || (n.content||'').toLowerCase().includes(q)
  );
  notesList.innerHTML='';
  for(const n of filtered){
    const li=document.createElement('li');
    li.className = n.id===state.activeNoteId ? 'active' : '';
    li.innerHTML = `
      <span class="title">${n.pinned?'📌 ':''}${n.title || '(Sem título)'}</span>
      <span class="preview">${preview(n.content||'')}</span>
      <span class="meta">Atualizada: ${formatDate(n.updatedAt)}</span>
    `;
    li.addEventListener('click', ()=>{ state.activeNoteId=n.id; renderAll(); });
    notesList.appendChild(li);
  }
}
function renderEditor(){
  const n=getActiveNote();
  if(!n){ titleInput.value=''; contentInput.value=''; metaInfo.textContent='Nenhuma nota selecionada.'; return; }
  titleInput.value = n.title || '';
  contentInput.value = n.content || '';
  metaInfo.textContent = `Criada: ${formatDate(n.createdAt)} • Atualizada: ${formatDate(n.updatedAt)}${
    n.sourceUrl ? ' • Origem: ' + new URL(n.sourceUrl).hostname : ''
  }`;
}
function renderAll(){ renderNotesList(); renderEditor(); }

async function load(){
  const data = await storage.get();
  state = { ...state, ...data };
  if(!state.activeNoteId && state.notes[0]){
    state.activeNoteId = sortNotes(state.notes)[0].id;
  }
  renderAll();
}
async function persist(){
  state.lastChangeAt = now();
  await storage.set({ notes: state.notes, activeNoteId: state.activeNoteId, lastChangeAt: state.lastChangeAt });
}
function createNote(initial={}){
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
function deleteActiveNote(){
  const n=getActiveNote(); if(!n) return;
  const idx = state.notes.findIndex(x=>x.id===n.id);
  state.notes.splice(idx,1);
  state.activeNoteId = state.notes[0]?.id;
}
function debounce(fn, ms=300){ let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), ms); }; }
const debouncedPersist = debounce(persist, 300);
function debouncedPersistWrap(updater){ return ()=>{ updater(); debouncedPersist(); }; }

// UI events
newNoteBtn.addEventListener('click', async ()=>{ createNote(); renderAll(); await persist(); });
searchInput.addEventListener('input', ()=>renderNotesList());

titleInput.addEventListener('input', debouncedPersistWrap(function(){
  const n=getActiveNote(); if(!n) return;
  n.title = titleInput.value; n.updatedAt = now(); renderNotesList();
}));
contentInput.addEventListener('input', debouncedPersistWrap(function(){
  const n=getActiveNote(); if(!n) return;
  n.content = contentInput.value; n.updatedAt = now(); renderNotesList();
}));

pinBtn.addEventListener('click', async ()=>{
  const n=getActiveNote(); if(!n) return;
  n.pinned = !n.pinned; n.updatedAt = now(); renderAll(); await persist();
});

deleteBtn.addEventListener('click', async ()=>{
  const n=getActiveNote(); if(!n) return;
  if(!confirm('Excluir esta nota? Esta ação não pode ser desfeita.')) return;
  deleteActiveNote(); renderAll(); await persist();
});

exportTxtBtn.addEventListener('click', ()=>{
  const n=getActiveNote(); if(!n) return;
  const blob = new Blob([n.content || ''], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${(n.title || 'nota').replace(/[^a-z0-9_-]/gi,'_')}.txt`;
  a.click();
});
exportJsonBtn.addEventListener('click', async ()=>{
  const data = await storage.get();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `notas_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
});
importJsonInput.addEventListener('change', async (e)=>{
  const file = e.target.files?.[0]; if(!file) return;
  try{
    const text = await file.text();
    const data = JSON.parse(text);
    if(!Array.isArray(data.notes)) throw new Error('Arquivo inválido');
    const existing = new Map(state.notes.map(n=>[n.id,n]));
    for(const n of data.notes){ existing.set(n.id, n); }
    state.notes = Array.from(existing.values());
    state.activeNoteId = data.activeNoteId || state.activeNoteId;
    renderAll(); await persist(); alert('Importação concluída!');
  }catch(err){ alert('Falha ao importar: ' + err.message); }
  finally { e.target.value=''; }
});

chrome.runtime.onMessage.addListener((msg)=>{
  if(msg?.type==='CREATE_NOTE_FROM_SELECTION'){
    createNote({ title: msg.title, content: msg.content, sourceUrl: msg.sourceUrl });
    renderAll(); persist();
  }
});

load();
