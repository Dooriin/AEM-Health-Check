pipeline {
    agent any
    stages {
        stage('Run Cypress Tests') {
            steps {
                script {
                    // Run Cypress tests in the Cypress Docker container
                    docker.image('cypress/included:13.6.3').inside('--entrypoint=""') {
                        dir('/home/project/cypress') {
                            sh 'npx cypress run'
                        }
                    }
                }
            }
        }
    }
}
