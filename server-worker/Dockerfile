FROM dhi.io/bun:1.4-alpine-dev AS builder

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --production --frozen-lockfile

COPY . .

FROM dhi.io/bun:1.4-alpine

WORKDIR /app
COPY --from=builder /app /app

EXPOSE 8080

CMD ["bun", "src/Program.ts"]
