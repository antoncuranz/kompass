LOCAL_BIN:=$(CURDIR)/bin

# HELP =================================================================================================================
# This will output the help for each task
# thanks to https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
.PHONY: help

help: ## Display this help screen
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

codegen: openapi goverter ### run all codegen tasks
.PHONY: codegen

openapi: ### run openapi codegen tasks
	$(LOCAL_BIN)/swag init -g internal/controller/http/router.go --v3.1 --requiredByDefault && \
    $(LOCAL_BIN)/ogen --config integration-test/client/ogen.yml --target integration-test/client/api --clean docs/swagger.yaml
.PHONY: openapi

goverter: ### run goverter codegen tasks
	$(LOCAL_BIN)/goverter gen -g 'output:file ./generated.go' -g 'skipCopySameType' kompass/internal/repo/dbvendo/converter
.PHONY: goverter

mock: ### run mockgen
	$(LOCAL_BIN)/mockgen -source ./internal/repo/contracts.go -package usecase_test > ./internal/usecase/mocks_repo_test.go
	$(LOCAL_BIN)/mockgen -source ./internal/usecase/contracts.go -package usecase_test > ./internal/usecase/mocks_usecase_test.go
.PHONY: mock

bin-deps: ### install tools
	GOBIN=$(LOCAL_BIN) go install tool
.PHONY: bin-deps

build-image: ### build container image
	docker build -t kompass/backend:latest .
.PHONY: bin-deps

test: ### run unit tests
	go test ./...
.PHONY: test

integration-test: ### run integration tests
	go test -v ./integration-test/...
.PHONY: integration-test

format: ### format code
	gofmt -s -w .
.PHONY: format

linter-golangci: ### run golangci-lint
	$(LOCAL_BIN)/golangci-lint run
.PHONY: linter-golangci

pre-commit: openapi mock format linter-golangci test ### run pre-commit
.PHONY: pre-commit
