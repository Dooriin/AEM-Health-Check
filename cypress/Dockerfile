# Use the official Cypress base image with browsers and Node.js
FROM cypress/browsers:node18.16.0-chrome113-ff113-edge113

# Set working directory
WORKDIR /e2e

# Copy project files into the Docker image
COPY package.json .
COPY cypress.config.ts .
COPY cypress cypress

# Install project dependencies
RUN npm install

# Display information about Cypress and the browsers
RUN npx cypress info

# Command to run Cypress tests
ENTRYPOINT ["npx", "cypress", "run"]
