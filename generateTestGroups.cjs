const fs = require('fs');
const path = require('path');

// Assuming this script is located in the root of your project
const testDir = path.join(__dirname, 'cypress/cypress/e2e/splitTests');
const testFiles = fs.readdirSync(testDir);

const numberOfGroups = 6;
const groups = Array.from({ length: numberOfGroups }, () => []);

testFiles.forEach((file, index) => {
  const groupIndex = index % numberOfGroups;
  groups[groupIndex].push(file);
});

const commands = groups.map((group) => {
  const testFilePaths = group.map(file => `cypress/cypress/e2e/splitTests/${file}`).join(',');
  return `npx cypress run --spec "${testFilePaths}"`;
});

fs.writeFileSync(path.join(__dirname, 'cypressParallelCommands.json'), JSON.stringify(commands, null, 2));

console.log('Test groups created for parallel execution. Check cypressParallelCommands.json for commands.');
