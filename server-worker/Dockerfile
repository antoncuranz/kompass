FROM oven/bun:1.3.7-alpine

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --production --frozen-lockfile

COPY . .

EXPOSE 8080

CMD ["bun", "src/Program.ts"]