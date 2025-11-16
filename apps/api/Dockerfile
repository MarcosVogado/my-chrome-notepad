FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências (sem dev dependencies em produção)
RUN npm ci --omit=dev

# Copiar código fonte
COPY . .

EXPOSE 3000

CMD ["node", "index.js"]

