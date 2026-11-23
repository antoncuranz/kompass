# Step 1: Modules caching
FROM dhi.io/golang:1.27-alpine-dev@sha256:f5765dcea1354da7d6b6e12eb84949fed6336dc9c022edc49af932be879f71c0 AS modules

COPY go.mod go.sum /modules/

WORKDIR /modules

RUN go mod download

# Step 2: Builder
FROM dhi.io/golang:1.27-alpine-dev@sha256:f5765dcea1354da7d6b6e12eb84949fed6336dc9c022edc49af932be879f71c0 AS builder

COPY --from=modules /go/pkg /go/pkg
COPY . /app

WORKDIR /app

RUN apk add --no-cache tzdata
RUN CGO_ENABLED=0 GOOS=linux \
    go build -tags migrate -o /bin/app ./cmd/app

# Step 3: Final
FROM scratch

COPY --from=builder /app/config /config
COPY --from=builder /bin/app /app
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /usr/share/zoneinfo/ /usr/share/zoneinfo/

CMD ["/app"]
