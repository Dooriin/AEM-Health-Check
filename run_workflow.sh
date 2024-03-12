#!/bin/bash
#
## Directories and files
crawls_dir="${PWD}/crawls"
endpoints_ts_file="${PWD}/cypress/cypress/fixtures/crawledEndpoints.ts"
pages_jsonl_file="${PWD}/crawls/collections/moodys/pages/pages.jsonl"
cypress_dir="${PWD}/cypress"
splitEndpoints_dir="${PWD}/cypress/cypress/fixtures/splitEndpoints"
splitTests_dir="${PWD}/cypress/cypress/e2e/splitTests"

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

# Existing Steps
# Step 1: Delete 'crawls' directory and crawledEndpoints.ts file
rm -rf $crawls_dir
rm -f $endpoints_ts_file

# Step 2: Run the crawler container
docker run -v ${PWD}/crawls:/crawls/ -v ${PWD}/crawl-config.yaml:/config -v ${PWD}/crawler.js:/app/crawler.js -v ${PWD}/util:/app/util -it moodys-crawler crawl --config /config/main.yaml --workers 10 --saveState always --collection moodys --statsFilename stats.json

# Step 3: Check if the pages.jsonl file is generated
check_file $pages_jsonl_file

# Step 4: Run post crawl processing
node post_crawl_processing.cjs

# Step 5: Check if the crawledEndpoints.ts file is generated
check_file $endpoints_ts_file

# New Steps: Delete the specific Cypress folders before running tests
echo "Deleting old Cypress test folders..."
rm -rf $splitEndpoints_dir
rm -rf $splitTests_dir
echo "Old Cypress test folders deleted."

# Step 6: Change directory to Cypress folder and run Cypress tests
cd $cypress_dir
npx ts-node splitAndGenerateTests.ts
#npx cypress run

# Change back to the original directory
cd -

# Add any additional steps or error handling as needed
