FROM node:24.13.1-alpine AS build

WORKDIR /app

ARG VITE_API_URL

ENV VITE_API_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm install -g npm@latest
RUN npm install
COPY . .

RUN apk update && apk upgrade openssl libcrypto3 libssl3

RUN addgroup -S appuser && adduser -S appuser -G appuser
RUN chown -R appuser:appuser /app

USER appuser

CMD ["npm", "run", "dev"]