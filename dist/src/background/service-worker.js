// Cria menu de contexto para texto selecionado
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "add-selection-to-notes",
    title: "Salvar seleção no Bloco de Notas",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "add-selection-to-notes") return;
  const selection = info.selectionText?.trim();
  if (!selection) return;
  const title = selection.split(/\n|\.\s/)[0].slice(0, 50);

  // Envia ao popup se aberto; senão persiste direto
  chrome.runtime.sendMessage({
    type: "CREATE_NOTE_FROM_SELECTION",
    title: title || "Capturado",
    content: selection,
    sourceUrl: info.pageUrl,
  }, async () => {
    if (chrome.runtime.lastError) {
      const data = await new Promise((resolve) => {
        chrome.storage.sync.get(["notesData"], (res) => resolve(res.notesData || { notes: [] }));
      });
      const note = {
        id: crypto.randomUUID(),
        title: title || "Capturado",
        content: selection,
        sourceUrl: info.pageUrl,
        pinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const next = { ...data, notes: [...(data.notes || []), note], lastChangeAt: Date.now() };
      await new Promise((resolve) => chrome.storage.sync.set({ notesData: next }, resolve));
    }
  });
});

// Listener de mudanças (ex.: logging/diagnóstico)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync" || !changes.notesData) return;
  // console.log("notesData updated", new Date().toISOString());
});
