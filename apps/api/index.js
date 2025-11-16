import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage (em produção, usar banco de dados)
let notesStore = {};

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/hello', (req, res) => {
  res.json({ ok: true, msg: 'API Bloco de Notas funcionando!' });
});

// GET /api/notes - Listar todas as notas
app.get('/api/notes', (req, res) => {
  const notes = Object.values(notesStore);
  res.json({
    notes,
    activeNoteId: notes[0]?.id,
    lastChangeAt: Date.now()
  });
});

// GET /api/notes/:id - Obter uma nota específica
app.get('/api/notes/:id', (req, res) => {
  const note = notesStore[req.params.id];
  if (!note) {
    return res.status(404).json({ error: 'Nota não encontrada' });
  }
  res.json(note);
});

// PUT /api/notes/:id - Criar ou atualizar uma nota
app.put('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const note = {
    id,
    ...req.body,
    updatedAt: Date.now()
  };
  if (!notesStore[id]) {
    note.createdAt = note.createdAt || Date.now();
  }
  notesStore[id] = note;
  res.json(note);
});

// DELETE /api/notes/:id - Excluir uma nota
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  if (!notesStore[id]) {
    return res.status(404).json({ error: 'Nota não encontrada' });
  }
  delete notesStore[id];
  res.json({ success: true });
});

// POST /api/notes/sync - Sincronizar múltiplas notas
app.post('/api/notes/sync', (req, res) => {
  const { notes } = req.body;
  if (!Array.isArray(notes)) {
    return res.status(400).json({ error: 'Formato inválido' });
  }
  
  // Merge com notas existentes
  const existingIds = new Set(Object.keys(notesStore));
  for (const note of notes) {
    if (note.id) {
      notesStore[note.id] = {
        ...note,
        updatedAt: note.updatedAt || Date.now()
      };
      existingIds.delete(note.id);
    }
  }
  
  res.json({
    notes: Object.values(notesStore),
    synced: notes.length
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});

