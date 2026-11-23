FROM dhi.io/bun:1.4-alpine-dev@sha256:a7c5682da1594763cd702dcd4b5b4af419d34432b31e250041bc2aab6c581f23 AS builder

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --production --frozen-lockfile

COPY . .

FROM dhi.io/bun:1.4-alpine@sha256:de13301a2d83ee38fe6bd81e2f6dec95e157545a99b5907bb1e1d4b761abbf89

WORKDIR /app
COPY --from=builder /app /app

EXPOSE 8080

CMD ["bun", "src/Program.ts"]
