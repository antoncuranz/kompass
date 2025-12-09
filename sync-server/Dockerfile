# syntax=docker/dockerfile:1

# renovate: datasource=npm depName=jazz-run
ARG JAZZ_VERSION="0.19.11"
ARG NODE_AUTH_TOKEN

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

RUN \
    npm install @antoncuranz/jazz-run@${JAZZ_VERSION} --registry=https://npm.pkg.github.com --//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN} && \
    npm cache clean --force && \
    chown -R root:root /app && chmod -R 755 /app

COPY . /

USER nobody:nogroup
WORKDIR /data
VOLUME ["/data"]

ENTRYPOINT ["/usr/bin/catatonit", "--", "/entrypoint.sh"]
