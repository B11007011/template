# WebView App Builder Makefile

.PHONY: setup run clean help

# Default target
.DEFAULT_GOAL := help

# Help target
help:
	@echo "WebView App Builder"
	@echo ""
	@echo "Usage:"
	@echo "  make setup    Install dependencies and prepare environment"
	@echo "  make run      Start the development server"
	@echo "  make clean    Remove temporary files and downloads"
	@echo "  make help     Display this help message"
	@echo ""

# Setup target
setup:
	@echo "Setting up WebView App Builder..."
	cd frontend && npm install
	@if [ ! -f frontend/.env ]; then \
		if [ -f frontend/.env.example ]; then \
			cp frontend/.env.example frontend/.env; \
			echo "Created .env file from example. Please edit it with your GitHub token."; \
		else \
			echo "No .env.example file found. Please create a .env file manually."; \
		fi \
	else \
		echo ".env file already exists."; \
	fi
	@if [ ! -d frontend/images ]; then \
		mkdir -p frontend/images; \
		echo "Created images directory."; \
	fi
	@echo "Setup complete!"

# Run target
run:
	@echo "Starting WebView App Builder..."
	cd frontend && npm start

# Clean target
clean:
	@echo "Cleaning temporary files..."
	rm -rf frontend/downloads/* frontend/temp/*
	@echo "Clean complete!" 