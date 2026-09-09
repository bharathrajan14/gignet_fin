FROM node:20-alpine
WORKDIR /app

# Copy root and shared contracts
COPY package*.json ./
COPY shared ./shared
COPY backend ./backend

WORKDIR /app/backend
RUN npm install --omit=dev

ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "src/server.js"]
