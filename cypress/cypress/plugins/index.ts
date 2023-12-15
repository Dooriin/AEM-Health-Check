import * as fs from 'fs'
import * as path from 'path'

module.exports = (on, config) => {
  on('task', {
    logFailedEndpoint({ url, status }) {
      const logDirectory =
        '/Users/onofreid/WebstormProjects/browsertrix-crawler/cypress/cypress/downloads'
      const logPath = path.join(logDirectory, 'failedEndpoints.log')
      const logEntry = `Failed Endpoint: ${url}, Status: ${status}\n`

      if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory, { recursive: true })
      }

      fs.appendFileSync(logPath, logEntry)

      return null
    },
  })
}
