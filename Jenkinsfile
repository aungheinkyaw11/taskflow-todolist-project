pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-southeast-1'
        AWS_ACCOUNT_ID = '788279898314'
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

        BACKEND_IMAGE = "taskflow-backend"
        FRONTEND_IMAGE = "taskflow-frontend"

        IMAGE_TAG = "${BUILD_NUMBER}"

        GITOPS_REPO = "https://github.com/aungheinkyaw11/taskflow-gitops.git"
        GITOPS_BRANCH = "main"
        GITOPS_VALUES_FILE = "taskflow/values-dev.yaml"
    }

    stages {
        stage('Check App Repo') {
            steps {
                sh '''
                    echo "Current app workspace:"
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

        stage('Checkout GitOps Repo') {
            steps {
                dir('gitops') {
                    checkout([$class: 'GitSCM',
                        branches: [[name: "*/${GITOPS_BRANCH}"]],
                        extensions: [
                            [$class: 'CleanBeforeCheckout']
                        ],
                        userRemoteConfigs: [[
                            credentialsId: 'github_cred',
                            url: "${GITOPS_REPO}"
                        ]]
                    ])

                    sh '''
                        echo "GitOps repo workspace:"
                        pwd
                        git branch
                        git status
                        ls -la
                    '''
                }
            }
        }

        stage('Update GitOps Image Tags') {
            steps {
                dir('gitops') {
                    sh '''
                        echo "Updating GitOps values file"
                        echo "New image tag: $IMAGE_TAG"

                        sed -i "/backend:/,/frontend:/ s/tag:.*/tag: \\"$IMAGE_TAG\\"/" $GITOPS_VALUES_FILE
                        sed -i "/frontend:/,/configMap:/ s/tag:.*/tag: \\"$IMAGE_TAG\\"/" $GITOPS_VALUES_FILE

                        echo "Updated GitOps values file:"
                        cat $GITOPS_VALUES_FILE
                    '''
                }
            }
        }

        stage('Push GitOps Changes') {
            steps {
                dir('gitops') {
                    withCredentials([usernamePassword(
                        credentialsId: 'github_cred',
                        usernameVariable: 'GIT_USERNAME',
                        passwordVariable: 'GIT_TOKEN'
                    )]) {
                        sh '''
                            git config user.email "jenkins@taskflow.local"
                            git config user.name "jenkins"

                            git add $GITOPS_VALUES_FILE
                            git commit -m "Update taskflow dev image tag to $IMAGE_TAG [skip ci]" || echo "No changes to commit"

                            git remote set-url origin https://$GIT_USERNAME:$GIT_TOKEN@github.com/aungheinkyaw11/taskflow-gitops.git
                            git push origin HEAD:$GITOPS_BRANCH
                        '''
                    }
                }
            }
        }

        stage('Argo CD Deployment Info') {
            steps {
                sh '''
                    echo "Jenkins built and pushed image tag: $IMAGE_TAG"
                    echo "Jenkins updated taskflow-gitops repo."
                    echo "Argo CD should auto-sync from taskflow-gitops."
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