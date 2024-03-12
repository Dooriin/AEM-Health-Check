pipeline {
    agent { docker { image 'cypress/browsers:latest' } }

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
                    // Start Xvfb on different display numbers for each parallel group
                    sh 'Xvfb :99 -screen 0 1280x1024x24 &'
                    sh 'Xvfb :100 -screen 0 1280x1024x24 &'
                    sh 'Xvfb :101 -screen 0 1280x1024x24 &'
                    sh 'Xvfb :102 -screen 0 1280x1024x24 &'
                    sh 'Xvfb :103 -screen 0 1280x1024x24 &'
                    sh 'Xvfb :104 -screen 0 1280x1024x24 &'
                    sh 'Xvfb :105 -screen 0 1280x1024x24 &'
                    sh 'Xvfb :106 -screen 0 1280x1024x24 &'
                    sh 'Xvfb :107 -screen 0 1280x1024x24 &'
                    sh 'Xvfb :108 -screen 0 1280x1024x24 &'

                    dir('/home/project/cypress') {
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
                    environment { DISPLAY = ':99' }
                    steps {
                        script {
                            dir('/home/project/cypress') {
                                sh 'npx cypress run --headless --env split=10,splitIndex=0'
                            }
                        }
                    }
                }
                stage('Test Group 2') {
                    environment { DISPLAY = ':100' }
                    steps {
                        script {
                            dir('/home/project/cypress') {
                                sh 'npx cypress run --headless --env split=10,splitIndex=1'
                            }
                        }
                    }
                }
                stage('Test Group 3') {
                    environment { DISPLAY = ':101' }
                    steps {
                        script {
                            dir('/home/project/cypress') {
                                sh 'npx cypress run --headless --env split=10,splitIndex=2'
                            }
                        }
                    }
                }
                stage('Test Group 4') {
                    environment { DISPLAY = ':102' }
                    steps {
                        script {
                            dir('/home/project/cypress') {
                                sh 'npx cypress run --headless --env split=10,splitIndex=3'
                            }
                        }
                    }
                }
                stage('Test Group 5') {
                    environment { DISPLAY = ':103' }
                    steps {
                        script {
                            dir('/home/project/cypress') {
                                sh 'npx cypress run --headless --env split=10,splitIndex=4'
                            }
                        }
                    }
                }
                stage('Test Group 6') {
                    environment { DISPLAY = ':104' }
                    steps {
                        script {
                            dir('/home/project/cypress') {
                                sh 'npx cypress run --headless --env split=10,splitIndex=5'
                            }
                        }
                    }
                }
                stage('Test Group 7') {
                    environment { DISPLAY = ':105' }
                    steps {
                        script {
                            dir('/home/project/cypress') {
                                sh 'npx cypress run --headless --env split=10,splitIndex=6'
                            }
                        }
                    }
                }
                stage('Test Group 8') {
                    environment { DISPLAY = ':106' }
                    steps {
                        script {
                            dir('/home/project/cypress') {
                                sh 'npx cypress run --headless --env split=10,splitIndex=7'
                            }
                        }
                    }
                }
                stage('Test Group 9') {
                    environment { DISPLAY = ':107' }
                    steps {
                        script {
                            dir('/home/project/cypress') {
                                sh 'npx cypress run --headless --env split=10,splitIndex=8'
                            }
                        }
                    }
                }
                stage('Test Group 10') {
                    environment { DISPLAY = ':108' }
                    steps {
                        script {
                            dir('/home/project/cypress') {
                                sh 'npx cypress run --headless --env split=10,splitIndex=9'
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
        dir('/home/project/cypress') {
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
