# syntax=docker/dockerfile:1

FROM node:26.13.1-alpine

ENV \
    NODE_ENV=production

USER root

WORKDIR /app

RUN \
    apk add --no-cache \
        bash \
        ca-certificates \
        tzdata \
        make \
        python3 \
        catatonit

COPY package.json package-lock.json ./

# The entrypoint runs jazz-run directly; npm is only needed while building.
RUN \
    npm ci --omit=dev && \
    npm cache clean --force && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx && \
    chown -R root:root /app && chmod -R 755 /app

COPY entrypoint.sh /entrypoint.sh

USER nobody:nogroup
WORKDIR /data
VOLUME ["/data"]

ENTRYPOINT ["/usr/bin/catatonit", "--", "/entrypoint.sh"]
