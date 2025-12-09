# syntax=docker/dockerfile:1

# renovate: datasource=npm depName=jazz-run
ARG JAZZ_VERSION="0.19.11"

FROM node:24.11.1-alpine

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

RUN --mount=type=secret,id=github_token \
    echo "@antoncuranz:registry=https://npm.pkg.github.com" > ~/.npmrc && \
    echo "//npm.pkg.github.com/:_authToken=$(cat /run/secrets/github_token)" >> ~/.npmrc && \
    npm install @antoncuranz/jazz-run@${JAZZ_VERSION} && \
    rm ~/.npmrc && \
    npm cache clean --force && \
    chown -R root:root /app && chmod -R 755 /app

COPY . /

USER nobody:nogroup
WORKDIR /data
VOLUME ["/data"]

ENTRYPOINT ["/usr/bin/catatonit", "--", "/entrypoint.sh"]
