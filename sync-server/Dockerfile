FROM dhi.io/node:24-alpine-dev

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
