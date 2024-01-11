const { exec } = require('child_process')
const { CrawledData } = require('./cypress/fixtures/crawledEndpoints');

const endpoints = CrawledData.endpoints
const numberOfChunks = 4 // Adjust this number based on your desired parallelism

const chunkSize = Math.ceil(endpoints.length / numberOfChunks)
const chunks = []

for (let i = 0; i < numberOfChunks; i++) {
  chunks.push(endpoints.slice(i * chunkSize, (i + 1) * chunkSize))
}

chunks.forEach((chunk, index) => {
  const envVariable = `CYPRESS_ENDPOINTS_CHUNK=${JSON.stringify(chunk)}`
  const command = `${envVariable} npx cypress run`

  console.log(`Starting test runner ${index + 1}`)

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error in test runner ${index + 1}:`, err)
      return
    }
    console.log(`Test runner ${index + 1} output:`, stdout, stderr)
  })
})
