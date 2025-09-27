.PHONY: build test deploy help

# Build the Move project
build:
	sui move build

# Run Move tests
test:
	sui move test

# Deploy the Move package to the Sui network
deploy:
	sui client publish --gas-budget 200000000

# Display help information
help:
	@echo "Available targets:"
	@echo "  build        - Build the Move project"
	@echo "  test         - Run Move tests"
	@echo "  deploy       - Deploy to Sui network"
	@echo "  help         - Show this help message"