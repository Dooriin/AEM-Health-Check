const fs = require('fs')
const path = require('path')
// Replace with the path to your HTML file
const htmlFilePath = '/Users/onofreid/WebstormProjects/browsertrix-crawler/endpoints/V3_URLs.txt'
// Replace with the path where you want to save the JSON file
const jsonFilePath = '/Users/onofreid/WebstormProjects/browsertrix-crawler/cypress/cypress/fixtures/endpoints.json'

// Read the HTML file
fs.readFile(htmlFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the HTML file:', err)

    return
  }

  // Regular expression to match URLs
  const urlRegex = /https?:\/\/[^\s"<>]+/g
  // Extract URLs
  const urls = data.match(urlRegex)

  // Write to JSON file
  fs.writeFile(jsonFilePath, JSON.stringify(urls, null, 2), (err) => {
    if (err) {
      console.error('Error writing the JSON file:', err)

      return
    }

    console.log('JSON file created successfully at', jsonFilePath)
  })
})
