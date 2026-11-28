FROM dhi.io/node:24-alpine-dev@sha256:665a173e7d07f3707c68311c6722c91a4524eb7ffd09fe8f400f62fa12d81fd8 AS builder

WORKDIR /build

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM dhi.io/nginx:1.31-alpine@sha256:8f759926203e4ec4efd10f20beb92451db5d9d980846657440c53292e32ac52e

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /build/dist /var/www

EXPOSE 8080
