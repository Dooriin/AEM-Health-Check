#!/bin/bash

# Directories and files
crawls_dir="${PWD}/crawls"
endpoints_ts_file="${PWD}/cypress/cypress/fixtures/crawledEndpoints.ts"
pages_jsonl_file="${PWD}/crawls/collections/moodys/pages/pages.jsonl"
cypress_dir="${PWD}/cypress"

# Function to check if file exists with retry
check_file() {
    local file=$1
    local retries=5
    local wait_seconds=5

    for ((i=0; i<retries; i++)); do
        if [ -f "$file" ]; then
            echo "$file exists."
            return 0
        else
            echo "Waiting for $file to be created... Attempt $((i+1))/$retries"
            sleep $wait_seconds
        fi
    done

    echo "$file not found after $retries attempts."
    exit 1
}

# New Steps
# Step 0.1: Install all yarn dependencies
yarn install

# Step 0.2: Build docker container
docker-compose build --no-cache

# Step 0.3: Give tag to docker container
docker tag webrecorder/browsertrix-crawler:latest moodys-crawler:latest

# Step 0.4: Navigate into Cypress folder and do npm install
cd $cypress_dir
npm install

# Step 0.5: Go back to the root directory
cd -