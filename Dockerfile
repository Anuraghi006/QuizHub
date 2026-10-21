FROM node:22-slim

WORKDIR /app

# Install dependencies first so Docker can cache this layer
COPY package*.json ./
RUN npm ci

# Build the frontend, then drop dev dependencies
COPY . .
RUN npm run build && npm prune --omit=dev

ENV NODE_ENV=production
ENV PORT=4000
ENV DB_PATH=/app/data/quiz.db
EXPOSE 4000

CMD ["node", "server/index.js"]
