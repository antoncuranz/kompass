FROM node:24.22.3-alpine AS builder

WORKDIR /build

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.31.7-alpine

USER root
RUN apk add --no-cache --upgrade \
    'brotli-libs>=1.2.1-r0' \
    'curl>=8.23.0-r0' \
    'libcurl>=8.23.0-r0' \
    'libexpat>=2.10.0-r0' \
    'musl-utils>=1.2.6-r3' \
    'zlib>=1.3.2-r1'
USER 101

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /build/dist /var/www

EXPOSE 8080
