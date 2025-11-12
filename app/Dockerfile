FROM node:22.21.0-alpine AS builder

WORKDIR /build

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.29.1-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /build/dist /var/www

COPY docker-entrypoint.sh /docker-entrypoint.d/40-substitute-env.sh
USER root
RUN chown -R nginx:nginx /var/www
USER nginx

EXPOSE 8080
