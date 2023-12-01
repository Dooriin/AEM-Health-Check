const fs = require('fs');
const path = require('path');

// Determine the base directory.
const baseDirectory = __dirname;

// Paths to input and output files, relative to the base directory
const pagesFilePath = path.join(baseDirectory, "crawls/collections/moodys/pages/pages.jsonl");
const outputDirectory = path.join(baseDirectory, "crawls/collections/moodys/pages");

// Function to read JSONL file
function readJSONLFile(filePath) {
  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  return lines.filter(line => line.trim()).map(line => JSON.parse(line));
}

// Function to save to CSV
function saveToCSV(filePath, headers, data) {
  const csvData = data.map(row => headers.map(header => row[header]).join(',')).join('\n');

  // Ensure the directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, headers.join(',') + '\n' + csvData);
}

// Main function to generate CSV files
async function generateCSVFiles() {
  // Process pages.jsonl for the requirements
  const data = readJSONLFile(pagesFilePath);

  // Save all pages
  saveToCSV(
      path.join(outputDirectory, "all_pages.csv"),
      ["url", "statusCode", "refererUrl"],
      data.map(({ url, statusCode, refererUrl }) => ({ url, statusCode, refererUrl: refererUrl || "N/A" }))
  );

  // Save non-200 pages
  saveToCSV(
      path.join(outputDirectory, "non_200_pages.csv"),
      ["url", "statusCode", "refererUrl"],
      data.filter(item => item.statusCode !== 200).map(({ url, statusCode, refererUrl }) => ({ url, statusCode, refererUrl: refererUrl || "N/A" }))
  );
}

generateCSVFiles();
