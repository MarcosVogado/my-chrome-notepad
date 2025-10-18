FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Copiar arquivos de configuração
COPY package.json ./
COPY scripts ./scripts
COPY tests ./tests
COPY src ./src
COPY icons ./icons
COPY manifest.json ./

# Instalar dependências
RUN npm install

# Configurar permissões para o Chrome no container
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Construir a extensão
RUN npm run build

# Comando padrão para executar os testes
CMD ["npm", "test"]