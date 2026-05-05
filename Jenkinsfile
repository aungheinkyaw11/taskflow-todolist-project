pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-southeast-1'
        AWS_ACCOUNT_ID = '788279898314'
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

        BACKEND_IMAGE = "taskflow-backend"
        FRONTEND_IMAGE = "taskflow-frontend"

        IMAGE_TAG = "${BUILD_NUMBER}"

        GIT_REPO = "https://github.com/aungheinkyaw11/taskflow-todolist-project.git"
        GITOPS_BRANCH = "argocd"
        HELM_VALUES_FILE = "helm/taskflow/values-dev.yaml"
    }

    stages {
        stage('Check Source Repo') {
            steps {
                sh '''
                    echo "Current source workspace:"
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

        stage('Checkout GitOps Branch') {
            steps {
                dir('gitops') {
                    checkout([$class: 'GitSCM',
                        branches: [[name: "*/${GITOPS_BRANCH}"]],
                        extensions: [
                            [$class: 'CleanBeforeCheckout']
                        ],
                        userRemoteConfigs: [[
                            credentialsId: 'github_cred',
                            url: "${GIT_REPO}"
                        ]]
                    ])

                    sh '''
                        echo "GitOps branch workspace:"
                        pwd
                        git branch
                        git status
                        ls -la
                    '''
                }
            }
        }

        stage('Update Helm Values in GitOps Branch') {
            steps {
                dir('gitops') {
                    sh '''
                        echo "Updating Helm values for Argo CD"
                        echo "New image tag: $IMAGE_TAG"

                        sed -i "/backend:/,/frontend:/ s/tag:.*/tag: \\"$IMAGE_TAG\\"/" $HELM_VALUES_FILE
                        sed -i "/frontend:/,/configMap:/ s/tag:.*/tag: \\"$IMAGE_TAG\\"/" $HELM_VALUES_FILE

                        echo "Updated values-dev.yaml:"
                        cat $HELM_VALUES_FILE
                    '''
                }
            }
        }

        stage('Commit and Push GitOps Changes') {
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

                            git add $HELM_VALUES_FILE
                            git commit -m "Update dev image tag to $IMAGE_TAG [skip ci]" || echo "No changes to commit"

                            git remote set-url origin https://$GIT_USERNAME:$GIT_TOKEN@github.com/aungheinkyaw11/taskflow-todolist-project.git
                            git push origin HEAD:$GITOPS_BRANCH
                        '''
                    }
                }
            }
        }

        stage('Argo CD Deployment Info') {
            steps {
                sh '''
                    echo "Jenkins finished CI and pushed GitOps change."
                    echo "Argo CD should now detect the argocd branch change and sync automatically."
                    echo "Image tag deployed by Argo CD should be: $IMAGE_TAG"
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