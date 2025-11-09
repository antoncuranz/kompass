#!/usr/bin/env bash

exec \
    /app/node_modules/.bin/jazz-run \
        sync \
            "$@"