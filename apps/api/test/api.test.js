import { test } from 'node:test';
import assert from 'node:assert';

// Testes básicos da API
test('API deve retornar hello', async () => {
  const res = await fetch('http://localhost:3000/api/hello');
  const data = await res.json();
  assert.strictEqual(data.ok, true);
});

test('API deve criar e listar notas', async () => {
  const note = {
    id: 'test-1',
    title: 'Teste',
    content: 'Conteúdo de teste',
    pinned: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  // Criar nota
  const createRes = await fetch('http://localhost:3000/api/notes/test-1', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note)
  });
  assert.strictEqual(createRes.ok, true);
  
  // Listar notas
  const listRes = await fetch('http://localhost:3000/api/notes');
  const listData = await listRes.json();
  assert.ok(Array.isArray(listData.notes));
});

