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

        stage('Update Helm Values') {
            steps {
                sh '''
                    echo "Updating Helm values for Argo CD"
                    echo "New image tag: $IMAGE_TAG"
        
                    sed -i "/backend:/,/frontend:/ s/tag:.*/tag: \\"$IMAGE_TAG\\"/" helm/taskflow/values-dev.yaml
                    sed -i "/frontend:/,/configMap:/ s/tag:.*/tag: \\"$IMAGE_TAG\\"/" helm/taskflow/values-dev.yaml
        
                    echo "Updated values-dev.yaml:"
                    cat helm/taskflow/values-dev.yaml
                '''
            }
        }
        
        stage('Commit Helm Changes') {
            steps {
                sh '''
                    git config user.email "jenkins@taskflow.local"
                    git config user.name "jenkins"
        
                    git add helm/taskflow/values-dev.yaml
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

        // stage('Deploy to EKS with Helm') {
        //     steps {
        //         sh '''
        //             helm upgrade --install taskflow ./helm/taskflow \
        //               -n taskflow \
        //               --create-namespace \
        //               -f ./helm/taskflow/values.yaml \
        //               --set backend.image.repository=$ECR_REGISTRY/$BACKEND_IMAGE \
        //               --set frontend.image.repository=$ECR_REGISTRY/$FRONTEND_IMAGE \
        //               --set backend.image.tag=$IMAGE_TAG \
        //               --set frontend.image.tag=$IMAGE_TAG
        //         '''
        //     }
        // }

        // stage('Verify Deployment') {
        //     steps {
        //         sh '''
        //             kubectl rollout status deployment/taskflow-backend -n taskflow
        //             kubectl rollout status deployment/taskflow-frontend -n taskflow

        //             kubectl get pods -n taskflow

        //             kubectl describe deployment taskflow-backend -n taskflow | grep Image
        //             kubectl describe deployment taskflow-frontend -n taskflow | grep Image
        //         '''
        //     }
        // }
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