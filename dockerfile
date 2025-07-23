# Temel imaj
FROM node:18-alpine

# Uygulama dizini
WORKDIR /app

# Bağımlılık dosyalarını kopyala
COPY package*.json ./

COPY .env.local .env.local

# Bağımlılıkları kur
RUN npm install

# Uygulama dosyalarını kopyala
COPY . .

# Production build
RUN npm run build

# Uygulamanın çalışacağı port
EXPOSE 3000

# Next.js production server
CMD ["npm", "run", "start"]
