import React, { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Utilidades
const now = () => Date.now();
const uuid = () => crypto.randomUUID();

function formatDate(ts) {
  return new Date(ts).toLocaleString('pt-BR');
}

function sortNotes(notes) {
  return [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });
}

function preview(text, max = 60) {
  const t = (text || '').trim().replace(/\s+/g, ' ');
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
}

// API helpers
async function fetchNotes() {
  try {
    const response = await fetch(`${API_URL}/api/notes`);
    if (!response.ok) throw new Error('Erro ao carregar notas');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    // Fallback para localStorage se API falhar
    const local = localStorage.getItem('notesData');
    return local ? JSON.parse(local) : { notes: [], activeNoteId: undefined, lastChangeAt: 0 };
  }
}

async function saveNotes(data) {
  try {
    const response = await fetch(`${API_URL}/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao salvar notas');
    // Também salva localmente como backup
    localStorage.setItem('notesData', JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar notas:', error);
    // Fallback para localStorage
    localStorage.setItem('notesData', JSON.stringify(data));
  }
}

function App() {
  const [state, setState] = useState({
    notes: [],
    activeNoteId: undefined,
    lastChangeAt: 0
  });
  const [searchQuery, setSearchQuery] = useState('');

  const loadNotes = useCallback(async () => {
    const data = await fetchNotes();
    let activeId = data.activeNoteId;
    if (!activeId && data.notes && data.notes.length > 0) {
      activeId = sortNotes(data.notes)[0].id;
    }
    setState({ ...data, activeNoteId: activeId });
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const persist = useCallback(async (newState) => {
    const dataToSave = {
      ...newState,
      lastChangeAt: now()
    };
    await saveNotes(dataToSave);
    setState(dataToSave);
  }, []);

  const createNote = useCallback((initial = {}) => {
    const note = {
      id: uuid(),
      title: initial.title || '',
      content: initial.content || '',
      pinned: !!initial.pinned,
      sourceUrl: initial.sourceUrl,
      createdAt: now(),
      updatedAt: now()
    };
    const newState = {
      ...state,
      notes: [...state.notes, note],
      activeNoteId: note.id
    };
    persist(newState);
  }, [state, persist]);

  const updateNote = useCallback((noteId, updates) => {
    const newNotes = state.notes.map(n =>
      n.id === noteId ? { ...n, ...updates, updatedAt: now() } : n
    );
    persist({ ...state, notes: newNotes });
  }, [state, persist]);

  const deleteNote = useCallback((noteId) => {
    if (!window.confirm('Excluir esta nota? Esta ação não pode ser desfeita.')) return;
    const newNotes = state.notes.filter(n => n.id !== noteId);
    const newActiveId = newNotes.length > 0 ? sortNotes(newNotes)[0].id : undefined;
    persist({ ...state, notes: newNotes, activeNoteId: newActiveId });
  }, [state, persist]);

  const activeNote = state.notes.find(n => n.id === state.activeNoteId);

  const filteredNotes = sortNotes(state.notes).filter(n =>
    (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTitleChange = (e) => {
    if (!activeNote) return;
    updateNote(activeNote.id, { title: e.target.value });
  };

  const handleContentChange = (e) => {
    if (!activeNote) return;
    updateNote(activeNote.id, { content: e.target.value });
  };

  const handlePinToggle = () => {
    if (!activeNote) return;
    updateNote(activeNote.id, { pinned: !activeNote.pinned });
  };

  const handleExportTxt = () => {
    if (!activeNote) return;
    const blob = new Blob([activeNote.content || ''], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(activeNote.title || 'nota').replace(/[^a-z0-9_-]/gi, '_')}.txt`;
    a.click();
  };

  const handleExportJson = async () => {
    const data = await fetchNotes();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `notas_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportJson = async (e) => {
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
      const newState = {
        ...state,
        notes: Array.from(existing.values()),
        activeNoteId: data.activeNoteId || state.activeNoteId
      };
      persist(newState);
      alert('Importação concluída!');
    } catch (err) {
      alert('Falha ao importar: ' + err.message);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Bloco de Notas</h1>
      </header>

      <main className="layout">
        <aside className="sidebar" aria-label="Lista de notas">
          <div className="sidebar-actions">
            <button
              className="btn primary"
              onClick={() => createNote()}
              aria-label="Nova nota"
              data-testid="new-note-btn"
            >
              ＋ Nova
            </button>
            <input
              type="text"
              placeholder="Buscar…"
              aria-label="Buscar notas"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="search-input"
            />
          </div>
          <ul className="notes-list" role="list">
            {filteredNotes.map((note) => (
              <li
                key={note.id}
                className={note.id === state.activeNoteId ? 'active' : ''}
                onClick={() => setState({ ...state, activeNoteId: note.id })}
                data-testid={`note-item-${note.id}`}
              >
                <span className="title">
                  {note.pinned ? '📌 ' : ''}
                  {note.title || '(Sem título)'}
                </span>
                <span className="preview">{preview(note.content || '')}</span>
                <span className="meta">Atualizada: {formatDate(note.updatedAt)}</span>
              </li>
            ))}
          </ul>
        </aside>

        <section className="editor" aria-label="Editor de nota">
          <div className="editor-header">
            <input
              className="title"
              type="text"
              placeholder="Sem título"
              aria-label="Título da nota"
              value={activeNote?.title || ''}
              onChange={handleTitleChange}
              data-testid="title-input"
            />
            <div className="toolbar">
              <button
                className="btn"
                onClick={handlePinToggle}
                title="Fixar/Desafixar"
                data-testid="pin-btn"
              >
                📌
              </button>
              <button
                className="btn"
                onClick={handleExportTxt}
                title="Exportar .txt"
                data-testid="export-txt-btn"
              >
                ⬇︎ .txt
              </button>
              <button
                className="btn"
                onClick={handleExportJson}
                title="Exportar .json"
                data-testid="export-json-btn"
              >
                ⬇︎ .json
              </button>
              <label className="btn file-label" title="Importar .json">
                ⬆︎ Importar
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleImportJson}
                  hidden
                  data-testid="import-json-input"
                />
              </label>
              <button
                className="btn danger"
                onClick={() => activeNote && deleteNote(activeNote.id)}
                title="Excluir nota"
                data-testid="delete-btn"
              >
                🗑
              </button>
            </div>
          </div>
          <textarea
            className="content-input"
            placeholder="Escreva aqui…"
            aria-label="Conteúdo da nota"
            value={activeNote?.content || ''}
            onChange={handleContentChange}
            data-testid="content-input"
          />
          <div className="meta" aria-live="polite" data-testid="meta-info">
            {activeNote ? (
              <>
                Criada: {formatDate(activeNote.createdAt)} • Atualizada: {formatDate(activeNote.updatedAt)}
                {activeNote.sourceUrl && ` • Origem: ${new URL(activeNote.sourceUrl).hostname}`}
              </>
            ) : (
              'Nenhuma nota selecionada.'
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

