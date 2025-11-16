// Utility functions for notes
export function formatDate(ts) {
  return new Date(ts).toLocaleString('pt-BR');
}

export function sortNotes(notes) {
  return [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });
}

export function preview(text, max = 60) {
  const t = (text || '').trim().replace(/\s+/g, ' ');
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
}

