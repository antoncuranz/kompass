# syntax=docker/dockerfile:1

# renovate: datasource=npm depName=jazz-run
ARG JAZZ_VERSION="0.19.13"

FROM node:24.12.0-alpine

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

RUN \
    npm install jazz-run@${JAZZ_VERSION} && \
    npm cache clean --force && \
    chown -R root:root /app && chmod -R 755 /app

COPY . /

USER nobody:nogroup
WORKDIR /data
VOLUME ["/data"]

ENTRYPOINT ["/usr/bin/catatonit", "--", "/entrypoint.sh"]
