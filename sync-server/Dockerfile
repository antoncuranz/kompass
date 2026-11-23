FROM dhi.io/node:24-alpine-dev@sha256:665a173e7d07f3707c68311c6722c91a4524eb7ffd09fe8f400f62fa12d81fd8

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
    rm -rf /usr/lib/node_modules/npm /usr/bin/npm /usr/bin/npx && \
    chown -R root:root /app && chmod -R 755 /app

COPY entrypoint.sh /entrypoint.sh

USER 65532:65532
WORKDIR /data
VOLUME ["/data"]

ENTRYPOINT ["/usr/bin/catatonit", "--", "/entrypoint.sh"]
