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
- **Testes E2E** com Playwright
- **CI/CD** com GitHub Actions

## 🧩 Requisitos Técnicos (MV3)
- `manifest_version: 3`
- Popup (`action.default_popup`) em `src/popup/popup.html`
- Service Worker em `src/background/service-worker.js`
- **Permissões mínimas**: `storage`, `contextMenus`
- Ícones (16/32/48/128 px) em `icons/`
- Compatível com Chrome 114+

## 🗂️ Estrutura
```
my-chrome-notepad/
├─ src/ (popup, content, background)
├─ icons/
├─ dist/ (build da extensão + zip)
├─ tests/ (Playwright)
├─ scripts/build-extension.mjs
├─ Dockerfile
├─ docker-compose.yml
├─ package.json
├─ .github/workflows/ci.yml
└─ manifest.json
```

## ▶️ Executar em Desenvolvimento
1. Abra `chrome://extensions`
2. Ative **Modo do desenvolvedor**
3. Clique em **Carregar sem compactação**
4. Selecione a pasta do projeto

## 📦 Empacotar e Testar
### Build Local
```bash
# Instalar dependências
npm install

# Gerar build da extensão (dist/ e dist/extension.zip)
npm run build

# Executar testes E2E com Playwright
npm test
```

### Usando Docker
```bash
# Construir a imagem Docker
npm run docker:build

# Executar testes E2E no container
npm run docker:test
```

## 🚀 CI/CD com GitHub Actions
O projeto inclui um workflow de CI/CD que:
1. Faz build da extensão
2. Executa testes E2E com Playwright
3. Gera artefatos (relatório de testes e extension.zip)
4. Cria releases automáticas (quando push na branch main)

## 🚀 GitHub Pages
Use a pasta `docs/` como fonte do Pages para uma landing/demo simples.

## 🔒 Privacidade
- Nenhum dado é enviado para servidores externos.
- Todos os dados permanecem no navegador (chrome.storage).

## 📝 Licença
[MIT](LICENSE)
