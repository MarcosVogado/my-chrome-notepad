FROM node:20-alpine AS build

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage de produção com Nginx
FROM nginx:alpine

# Copiar arquivos buildados
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuração do Nginx (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

