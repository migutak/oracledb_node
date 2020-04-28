pipeline {
    options {
        // set a timeout of 30 minutes for this pipeline
        timeout(time: 30, unit: 'MINUTES')
    }
    environment {
        DEV_PROJECT = "ecollect"
        STAGE_PROJECT = "dev-stage"
        APP_GIT_URL = "https://github.com/migutak"
        APP_NAME = "oracledb"
    }
    agent {
      node {
        // TODO: run this simple pipeline on jenkins 'master' node
        label 'master'
      }
    }

    stages {

        stage('stage 1') {
            steps {
                script {
                    openshift.withCluster() {
                        openshift.withProject() {
                            echo "stage 1: using project: ${openshift.project()} in cluster ${openshift.cluster()}"
                        }
                    }
                }
            }
        }

        // delete all app resources
        stage('stage Delete resources') {
            steps {
                sh'''
                echo 'deleting all resources...'
                oc project ${DEV_PROJECT}
                oc delete all -l app=${APP_NAME}
                sleep 5
                '''
            }
        }

        // create new app
        stage('stage Create new resources') {
            steps {
                sh'''
                echo 'creating new app...'
                oc project ${DEV_PROJECT}
                oc new-app --name app=${APP_NAME} ${APP_GIT_URL} --strategy docker
                sleep 5
                '''
            }
        }

        // testing
        stage('stage testing') {
            steps {
                sh 'echo testing stage 2!'
            }
        }

        //
        stage('manual approval') {
            steps {
                timeout(time: 60, unit: 'MINUTES') {
                input message: "Move to stage uat?"
                }
            }
        }

        stage('stage uat deploy') {
            steps {
                sh 'echo deploy to uat!'
            }
        }
    }
}