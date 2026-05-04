pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Repo') {
            steps {
                sh 'pwd'
                sh 'ls -la'
                sh 'ls -la backend'
                sh 'ls -la frontend'
                sh 'ls -la helm'
            }
        }

        stage('Check Tools') {
            steps {
                sh 'git --version'
                sh 'docker --version'
                sh 'aws --version'
            }
        }
    }
}