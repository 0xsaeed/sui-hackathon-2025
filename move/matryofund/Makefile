.PHONY: build test deploy help

ssh:
	eval $$(ssh-agent)
	ssh-add

clear:
	clear
# Build the Move project
build:clear
	sui move build

# Run Move tests
test:clear
	sui move test

# Deploy the Move package to the Sui network
deploy:clear
	sui client publish --gas-budget 200000000

# Display help information
help:
	@echo "Available targets:"
	@echo "  build        - Build the Move project"
	@echo "  test         - Run Move tests"
	@echo "  deploy       - Deploy to Sui network"
	@echo "  help         - Show this help message"