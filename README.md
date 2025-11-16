# Bloco de Notas PWA

Um Progressive Web App (PWA) completo para gerenciamento de notas, com backend API, containerização Docker, testes automatizados e CI/CD.

## ✨ Funcionalidades

- **PWA Completo**: Instalável, funciona offline, service worker para cache
- **Múltiplas Notas**: Criar, editar, excluir e organizar notas
- **Busca**: Buscar notas por título ou conteúdo
- **Fixar Notas**: Marcar notas importantes no topo
- **Sincronização**: Sincronização automática com backend API
- **Exportação/Importação**: Exportar notas em TXT ou JSON, importar backup
- **Modo Offline**: Funciona sem conexão com fallback para localStorage
- **Responsivo**: Interface adaptável para desktop e mobile

## 🏗️ Arquitetura

O projeto segue uma estrutura de monorepo:

```
my-chrome-notepad/
├── apps/
│   ├── web/              # Front-end PWA (Vite + Vanilla JS)
│   │   ├── src/
│   │   ├── public/
│   │   ├── e2e/          # Testes E2E (Playwright)
│   │   ├── Dockerfile
│   │   └── package.json
│   └── api/              # Backend API (Node/Express)
│       ├── index.js
│       ├── test/
│       ├── Dockerfile
│       └── package.json
├── docker-compose.yml    # Orquestração dos serviços
├── .github/workflows/    # CI/CD (GitHub Actions)
└── README.md
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose (opcional)
- npm ou yarn

### Desenvolvimento Local

#### Opção 1: Com Docker Compose (Recomendado)

```bash
# Subir todos os serviços (web + api)
docker compose up --build

# Acessar:
# - PWA: http://localhost:8080
# - API: http://localhost:3000
```

#### Opção 2: Desenvolvimento Manual

**Terminal 1 - API:**
```bash
cd apps/api
npm install
npm start
# API rodando em http://localhost:3000
```

**Terminal 2 - Web:**
```bash
cd apps/web
npm install
npm run dev
# PWA rodando em http://localhost:8080
```

### Build de Produção

```bash
# Build do front-end
cd apps/web
npm run build

# Build do backend (já está pronto, apenas instala deps)
cd apps/api
npm install
```

## 📡 API Backend

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/hello` | Health check |
| `GET` | `/api/notes` | Listar todas as notas |
| `GET` | `/api/notes/:id` | Obter uma nota específica |
| `PUT` | `/api/notes/:id` | Criar ou atualizar uma nota |
| `DELETE` | `/api/notes/:id` | Excluir uma nota |
| `POST` | `/api/notes/sync` | Sincronizar múltiplas notas |

### Exemplo de Uso

```bash
# Health check
curl http://localhost:3000/api/hello

# Criar/Atualizar nota
curl -X PUT http://localhost:3000/api/notes/123 \
  -H "Content-Type: application/json" \
  -d '{"title":"Minha Nota","content":"Conteúdo","pinned":false}'

# Listar notas
curl http://localhost:3000/api/notes
```

## 🧪 Testes

### Testes Unitários

```bash
cd apps/web
npm test
```

### Testes E2E (Playwright)

```bash
cd apps/web
npx playwright install chromium
npm run test:e2e
```

### Executar Todos os Testes

```bash
# Na raiz do projeto
cd apps/web && npm test && npm run test:e2e
cd ../api && npm test
```

## 🐳 Docker

### Build Individual

```bash
# Build da API
cd apps/api
docker build -t notepad-api .

# Build do Web
cd apps/web
docker build -t notepad-web .
```

### Docker Compose

```bash
# Subir serviços
docker compose up

# Subir em background
docker compose up -d

# Parar serviços
docker compose down

# Ver logs
docker compose logs -f
```

## 📦 PWA - Instalação e Uso

### Instalar o PWA

1. Acesse o PWA em `http://localhost:8080` (ou URL de produção)
2. No navegador, clique no ícone de instalação na barra de endereços
3. Ou use o botão "Instalar App" no header da aplicação

### Funcionalidades Offline

- O PWA funciona offline usando service worker
- Dados são salvos localmente quando offline
- Sincronização automática quando a conexão é restaurada

## 🔄 CI/CD

O projeto inclui um pipeline completo no GitHub Actions que:

1. **Build**: Instala dependências e faz build do front-end
2. **Testes**: Executa testes unitários e E2E
3. **Artefatos**: Gera artefatos de build e relatórios de testes
4. **Deploy**: Publica automaticamente no GitHub Pages (branch main/master)

### Workflow

O workflow está configurado em `.github/workflows/ci.yml` e executa:

- ✅ Instalação de dependências
- ✅ Testes unitários (Vitest)
- ✅ Build do front-end
- ✅ Testes E2E (Playwright)
- ✅ Deploy no GitHub Pages

## 📝 Variáveis de Ambiente

### Front-end (apps/web)

```env
VITE_API_URL=http://localhost:3000
```

### Backend (apps/api)

```env
PORT=3000
```

## 🎯 Critérios de Aceite (DoD)

- ✅ **PWA (30%)**: Manifest válido, service worker funcional, app instalável, Lighthouse ≥ 80
- ✅ **API/Backend (25%)**: Backend próprio com endpoints REST, tratamento de erros
- ✅ **Containers (15%)**: Dockerfiles funcionais, docker-compose orquestrando web + api
- ✅ **Testes (15%)**: Testes unitários e E2E passando, relatórios no CI
- ✅ **CI/CD (10%)**: Pipeline de build/test/report no GitHub Actions, publicação no Pages
- ✅ **Documentação (5%)**: README completo, instruções claras, acessibilidade

## 🔒 Segurança

- CORS configurado no backend
- Headers de segurança no Nginx
- Validação de dados nas requisições
- Tratamento de erros adequado

## 📱 Acessibilidade

- Labels ARIA adequados
- Navegação por teclado
- Contraste de cores adequado
- Suporte a leitores de tela

## 🛠️ Tecnologias

- **Front-end**: Vite, Vanilla JS, PWA Plugin
- **Backend**: Node.js, Express
- **Testes**: Vitest (unitários), Playwright (E2E)
- **Containerização**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Deploy**: GitHub Pages

## 📄 Licença

[MIT](LICENSE)

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para questões e suporte, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para o Bootcamp PWA**
