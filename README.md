# Bloco de Notas — Chrome Extension (MV3)

Um bloco de notas simples, com múltiplas notas, busca, fixar nota, autosave, exportação/importação e menu de contexto para salvar seleções da página.

## ✨ Recursos
- Múltiplas notas com título, conteúdo e pin (fixar no topo)
- Busca por texto (título e conteúdo)
- Autosave com `chrome.storage.sync`
- Exportar uma nota para `.txt`
- Backup `.json` (exportar/importar todas as notas)
- **Menu de contexto**: "Salvar seleção no Bloco de Notas" (captura o texto selecionado e a URL de origem)
- UI responsiva no popup (600×500)

## 🧩 Requisitos Técnicos (MV3)
- `manifest_version: 3`
- Popup (`action.default_popup`) em `src/popup/popup.html`
- Service Worker em `src/background/service-worker.js`
- **Permissões mínimas**: `storage`, `contextMenus`
- Ícones (16/32/48/128 px) em `icons/`
- Compatível com Chrome 114+

## 🗂️ Estrutura
Consulte a árvore de pastas no repositório.

## ▶️ Executar em Desenvolvimento
1. Abra `chrome://extensions`
2. Ative **Modo do desenvolvedor**
3. Clique em **Carregar sem compactação**
4. Selecione a pasta do projeto

## 🚀 GitHub Pages
Use a pasta `docs/` como fonte do Pages para uma landing/demo simples.

## 📦 Empacotar
- Em `chrome://extensions`, clique em **Empacotar extensão** e selecione a pasta.
- Ou gere um `.zip` desta pasta e publique como Release no GitHub.

## 🔒 Privacidade
- Nenhum dado é enviado para servidores externos.
- Todos os dados permanecem no navegador (chrome.storage).

## 📝 Licença
[MIT](LICENSE)
