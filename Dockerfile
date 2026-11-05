FROM node:20-alpine AS build

WORKDIR /app

# Install client and build frontend
COPY client/package*.json ./client/
RUN cd client && npm install

COPY client/ ./client/
COPY server/package*.json ./server/
RUN cd client && npm run build

# Production server
FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm install --omit=dev

COPY server/ ./
COPY --from=build /app/server/public ./public

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["node", "index.js"]
