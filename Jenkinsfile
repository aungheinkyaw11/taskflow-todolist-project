pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-southeast-1'
        AWS_ACCOUNT_ID = '788279898314'
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

        BACKEND_IMAGE = "taskflow-backend"
        FRONTEND_IMAGE = "taskflow-frontend"

        IMAGE_TAG = "${BUILD_NUMBER}"

        HELM_VALUES_FILE = "helm/taskflow/values-dev.yaml"
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

        stage('Update Helm Values') {
            steps {
                sh '''
                    echo "Updating Helm values file: $HELM_VALUES_FILE"
                    echo "New image tag: $IMAGE_TAG"

                    sed -i "/backend:/,/frontend:/ s/tag:.*/tag: \\"$IMAGE_TAG\\"/" $HELM_VALUES_FILE
                    sed -i "/frontend:/,/configMap:/ s/tag:.*/tag: \\"$IMAGE_TAG\\"/" $HELM_VALUES_FILE

                    echo "Updated values-dev.yaml:"
                    cat $HELM_VALUES_FILE
                '''
            }
        }

        stage('Commit Helm Changes') {
            steps {
                sh '''
                    git config user.email "jenkins@taskflow.local"
                    git config user.name "jenkins"

                    git add $HELM_VALUES_FILE

                    git commit -m "Update dev image tag to $IMAGE_TAG [skip ci]" || echo "No changes to commit"
                '''
            }
        }

        stage('Push Helm Changes') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github_cred',
                    usernameVariable: 'GIT_USERNAME',
                    passwordVariable: 'GIT_TOKEN'
                )]) {
                    sh '''
                        git remote set-url origin https://$GIT_USERNAME:$GIT_TOKEN@github.com/aungheinkyaw11/taskflow-todolist-project.git
                        git push origin HEAD:develop
                    '''
                }
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