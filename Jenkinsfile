pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-southeast-1'
        AWS_ACCOUNT_ID = '788279898314'
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

        BACKEND_IMAGE = "taskflow-backend"
        FRONTEND_IMAGE = "taskflow-frontend"

        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Check Repo') {
            steps {
                sh '''
                    pwd
                    ls -la
                    git branch
                    git status
                '''
            }
        }

        stage('Login to ECR') {
            steps {
                sh '''
                    aws ecr get-login-password --region $AWS_REGION | \
                    docker login --username AWS --password-stdin $ECR_REGISTRY
                '''
            }
        }

        stage('Build Backend Image') {
            steps {
                sh '''
                    docker build -t $ECR_REGISTRY/$BACKEND_IMAGE:$IMAGE_TAG ./backend
                '''
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh '''
                    docker build -t $ECR_REGISTRY/$FRONTEND_IMAGE:$IMAGE_TAG ./frontend
                '''
            }
        }

        stage('Push Backend Image') {
            steps {
                sh '''
                    docker push $ECR_REGISTRY/$BACKEND_IMAGE:$IMAGE_TAG
                '''
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh '''
                    docker push $ECR_REGISTRY/$FRONTEND_IMAGE:$IMAGE_TAG
                '''
            }
        }

        stage('Deploy to EKS with Helm') {
            steps {
                sh '''
                    helm upgrade --install taskflow ./helm/taskflow \
                      -n taskflow \
                      --create-namespace \
                      -f ./helm/taskflow/values.yaml \
                      --set backend.image.repository=$ECR_REGISTRY/$BACKEND_IMAGE \
                      --set frontend.image.repository=$ECR_REGISTRY/$FRONTEND_IMAGE \
                      --set backend.image.tag=$IMAGE_TAG \
                      --set frontend.image.tag=$IMAGE_TAG
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    kubectl rollout status deployment/taskflow-backend -n taskflow
                    kubectl rollout status deployment/taskflow-frontend -n taskflow

                    kubectl get pods -n taskflow

                    kubectl describe deployment taskflow-backend -n taskflow | grep Image
                    kubectl describe deployment taskflow-frontend -n taskflow | grep Image
                '''
            }
        }
    }

    post {
        success {
            echo "Pipeline completed successfully. Image tag: ${IMAGE_TAG}"
        }

        failure {
            echo "Pipeline failed. Check console logs."
        }
    }
}