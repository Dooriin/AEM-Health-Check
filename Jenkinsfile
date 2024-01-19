pipeline {
    agent any
    stages {
        stage('Run Cypress Tests') {
            steps {
                dir('/home/cypress') {
                    sh 'npm install' // Install Cypress and dependencies
                    sh 'npx cypress run' // Run Cypress tests
                }
            }
        }
    }
    post {
        success {
            // Add steps for Slack notification on success
        }
        failure {
            // Add steps for Slack notification on failure
        }
    }
}
