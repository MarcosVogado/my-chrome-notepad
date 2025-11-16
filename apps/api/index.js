import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (em produção, usar banco de dados)
let notesStorage = {
  notes: [],
  activeNoteId: undefined,
  lastChangeAt: 0
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, msg: 'API funcionando!' });
});

// GET /api/notes - Buscar todas as notas
app.get('/api/notes', (req, res) => {
  res.json(notesStorage);
});

// POST /api/notes - Salvar notas
app.post('/api/notes', (req, res) => {
  const { notes, activeNoteId, lastChangeAt } = req.body;
  
  if (!Array.isArray(notes)) {
    return res.status(400).json({ error: 'notes deve ser um array' });
  }

  notesStorage = {
    notes: notes || [],
    activeNoteId: activeNoteId,
    lastChangeAt: lastChangeAt || Date.now()
  };

  res.json({ success: true, data: notesStorage });
});

// GET /api/notes/:id - Buscar uma nota específica
app.get('/api/notes/:id', (req, res) => {
  const note = notesStorage.notes.find(n => n.id === req.params.id);
  if (!note) {
    return res.status(404).json({ error: 'Nota não encontrada' });
  }
  res.json(note);
});

// DELETE /api/notes/:id - Deletar uma nota
app.delete('/api/notes/:id', (req, res) => {
  const index = notesStorage.notes.findIndex(n => n.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Nota não encontrada' });
  }
  notesStorage.notes.splice(index, 1);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});

