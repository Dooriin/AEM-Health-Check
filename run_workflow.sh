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

# Existing Steps
# Step 1: Delete 'crawls' directory and crawledEndpoints.ts file
rm -rf $crawls_dir
rm -f $endpoints_ts_file

# Step 2: Run the crawler container
docker run -v ${PWD}/crawls:/crawls/ -v ${PWD}/crawl-config.yaml:/config -v ${PWD}/crawler.js:/app/crawler.js -v ${PWD}/util:/app/util -it moodys-crawler crawl --config /config/main.yaml --generateWACZ --workers 10 --saveState always --collection moodys --statsFilename stats.json

# Step 3: Check if the pages.jsonl file is generated
check_file $pages_jsonl_file

# Step 4: Run post crawl processing
node post_crawl_processing.cjs

# Step 5: Check if the crawledEndpoints.ts file is generated
check_file $endpoints_ts_file

# Step 6: Change directory to Cypress folder and run Cypress tests
cd $cypress_dir
npx cypress run

# Change back to the original directory
cd -

# Add any additional steps or error handling as needed
