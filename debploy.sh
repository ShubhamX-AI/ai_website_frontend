#!/bin/bash
set -e  # Exit immediately if any command fails

# Check if env is present
if [ ! -f ".env" ]; then
    echo "Error: .env file is not present"
    exit 1
fi

# Update the code from git
echo "Pulling latest code..."
git pull origin main

# Build and run
echo "Building and starting services..."
docker compose up -d --build --wait

# Cleanup
echo "Cleaning up..."
docker system prune -f
echo "Deployment completed successfully."