pipeline {
    agent { docker { image 'cypress/base:latest' } }

    parameters {
        booleanParam(name: 'ADD_FAIL_MESSAGE', defaultValue: false, description: 'Flag to include failure messages')
    }

    environment {
        TERM = 'xterm'
    }

    stages {
        stage('Prepare Xvfb and Install Dependencies') {
            steps {
                script {
                                        sh '''
                                          echo "Current directory:"
                                          pwd
                                          echo "Files in the current directory:"
                                          ls -la
                                        '''
                    // Proceed with Cypress directory setup
                    dir('/cypress') {
                        sh '''
                          echo "Current directory:"
                          pwd
                          echo "Files in the current directory:"
                          ls -la
                        '''
                        sh 'npm install'
                        sh 'npx cypress install'
                        sh 'rm -rf cypress/reports'
                    }
                }
            }
        }

        stage('Cypress Parallel Tests') {
            parallel {
                stage('Test Group 1') {
                    steps {
                        script {
                            dir('/cypress') {
                                sh 'npx cypress run --headless --env split=4,splitIndex=0'
                            }
                        }
                    }
                }
                stage('Test Group 2') {
                    steps {
                        script {
                            dir('/cypress') {
                                sh 'npx cypress run --headless --env split=4,splitIndex=1'
                            }
                        }
                    }
                }
                stage('Test Group 3') {

                    steps {
                        script {
                            dir('/cypress') {
                                sh 'npx cypress run --headless --env split=4,splitIndex=2'
                            }
                        }
                    }
                }
                stage('Test Group 4') {

                    steps {
                        script {
                            dir('/cypress') {
                                sh 'npx cypress run --headless --env split=4,splitIndex=3'
                            }
                        }
                    }
                }
            }
        }
    }

}

def sendNotification() {
    // Define the node within the function to avoid "No such DSL method 'node' found" error
    node {
        dir('/cypress') {
            sh 'npm run merge-reports'
            sh 'npm run generate-report'

            def combinedReportPath = 'cypress/reports/combined-report.json'
            def combinedReport = readJSON file: combinedReportPath
            def totalTests = combinedReport.stats.tests
            def passedTests = combinedReport.stats.passes
            def failedTests = combinedReport.stats.failures
            def failedDetails = ''
            def addFailMessage = params.ADD_FAIL_MESSAGE

            combinedReport.results.each { result ->
                result.suites.each { suite ->
                    suite.tests.each { test ->
                        if (test.state == 'failed') {
                            def urlPart = (test.title =~ /assets for - (.+)$/)[0][1]
                            def errorMessage = test.err.message
                            errorMessage = errorMessage.replaceAll("\\[", "").replaceAll("\\]", "").replaceAll("\n", "\n    ")

                            if (addFailMessage) {
                                failedDetails += "* ${urlPart}\n  ```\n${errorMessage}\n```\n\n"
                            } else {
                                failedDetails += "* ${urlPart}\n"
                            }
                        }
                    }
                }
            }

            failedDetails = failedDetails.trim()
            def summaryMessage = "Cypress Test Summary: ${passedTests}/${totalTests} tests passed. ${failedTests} failed.\nFailed Tests:\n${failedDetails}"

            slackSend (
                tokenCredentialId: 'RealSlackToken',
                color: (failedTests == 0) ? 'good' : 'danger',
                message: summaryMessage
            )
        }
        // Clean up Xvfb processes
        sh 'pkill Xvfb'
    }
}