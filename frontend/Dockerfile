# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist/kerya-frontend ./dist/kerya-frontend

EXPOSE 3000

CMD ["serve", "-s", "dist/kerya-frontend", "-l", "3000"]
