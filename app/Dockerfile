FROM node:24.13.1-alpine AS builder

WORKDIR /build

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.29.5-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /build/dist /var/www

EXPOSE 8080
