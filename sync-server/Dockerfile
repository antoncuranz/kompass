# syntax=docker/dockerfile:1

ARG NODE_VERSION="22.21.0"
ARG ALPINE_VERSION="3.21"
ARG JAZZ_VERSION="0.19.0"

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION}

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
    npm cache clean --force

USER nobody:nogroup
WORKDIR /data
VOLUME ["/data"]

ENTRYPOINT ["/usr/bin/catatonit", "--", "/entrypoint.sh"]