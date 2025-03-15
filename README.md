# contentstack-cli-lambda-ecr-integration

As we know, [@contentstack/cli](https://github.com/contentstack/cli) is a CLI used to perform Contentstack operations, and it’s installed locally on your machine. What if you want to use the CLI as a dependency in your Node.js projects or containerized applications? Since csdx is an executable command provided by the Contentstack CLI, it needs a specific configuration and setting of the internal environment variables for paths, etc.

**I’m using content stored in [this](https://github.com/hanoak/contentstack-starter-app-data) repository to import it to contentstack stack.**

# Features

This repository helps you to do the following things:

1. Use [@contentstack/cli](https://github.com/contentstack/cli) in your Node.js/Express.js application.
2. Use [@contentstack/cli](https://github.com/contentstack/cli) in your image and run locally.
3. Use [@contentstack/cli](https://github.com/contentstack/cli) in your image and run it on Lambda.

## **Prerequisites**

1. Npm & Node.js
2. AWS CLI installed and authenticated
3. Docker
4. Contentstack account with stack created along with a management token.

## **Contentstack CLI’s internal env variables configuration**

Below are the environmental variables we need to set for the CLI in a) the .env file and b) the Dockerfile for the container image. I’ve already configured them for you, please do not change them.

    CS_CLI_LOG_PATH=/tmp #CLI generates logs & we need to store it in /tmp as root. This is for AWS Lambda
    CS_CLI_CONFIG_PATH=/tmp/cli_token #CLI also generates config files & we need to store them in /tmp as root. This is for AWS Lambda
    NPM_CONFIG_CACHE=/tmp/.npm

## **Common usage**

1. `git clone https://github.com/hanoak/contentstack-cli-lambda-ecr-integration.git`
2. `cd contentstack-cli-lambda-ecr-integration`
3. `npm i`

## **Usage in Node.js/Express.js application**

npm run dev This spins up an Express.js application on port 5000 and opens / route for us to download, extract, and import content to your stack. You can now hit the following API endpoint

    POST / HTTP/1.1
    Host: localhost:5000
    Content-Type: application/json
    Content-Length: 118

    {
        "region": "NA",
        "api_key": "blt2fc1a***********",
        "management_token": "cseb04c84c3769************"
    }

The above API endpoint accepts the region in the payload with the following values:

1. `NA`
2. `EU`
3. `AZURE-NA`
4. `AZURE-EU`
5. `GCP-NA`

## **Usage in Docker image to run locally.**

Let’s build a docker image by the following command
`docker build --build-arg APP_ENV=LOCAL --platform linux/x86_64 -t cli-lambda-test .`

Run the docker image with the following command, it spins up an API endpoint
`localhost:9000/2015-03-31/functions/function/invocations`

`docker run --platform linux/x86_64 -p 9000:8080 cli-lambda-test`

Now hit the above API endpoint with the following details:

     POST /2015-03-31/functions/function/invocations HTTP/1.1
        Host: localhost:9000
        Content-Type: application/json
        Content-Length: 147

        {
          "body": "{\"region\":\"NA\",\"api_key\":\"blt2fc1a***********\",\"management_token\":\"cseb04c84c3769************\"}",
          "httpMethod": "POST"
        }

## **Usage in Docker image to run on AWS Lambda.**

1.  Create an ECR repository and make a note of its ARN. I’m naming it as `cli-lambda-test`.
2.  Retrieve an authentication token and authenticate your Docker client to your registry. Use the AWS CLI: It'll be like `aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 333322221111.dkr.ecr.us-east-1.amazonaws.com`
3.  Run the following command to build, tag, and push the image to the created ECR repository(in my case, `cli-lambda-test`):
    `docker buildx build --build-arg APP_ENV=AWS --platform linux/x86_64 --provenance=false \ -t 333322221111.dkr.ecr.us-east-1.amazonaws.com/cli-lambda-test:latest \ --push .`
4.  Create a Lambda function with the following configurations, and add your image ARN to your lamnda.

        AWSTemplateFormatVersion: '2010-09-09'
        Transform: AWS::Serverless-2016-10-31
        Description: An AWS Serverless Application Model template describing your function.
        Resources:
         clilambda:
          Type: AWS::Serverless::Function
          Properties:
          CodeUri: .
          Description: ''
          MemorySize: 2048
          Timeout: 900
          Architectures:
           - x86_64
          EphemeralStorage:
           Size: 1024
          EventInvokeConfig:
           MaximumEventAgeInSeconds: 21600
           MaximumRetryAttempts: 2
          ImageUri: 333322221111.dkr.ecr.us-east-1.amazonaws.com/cli-lambda-test:latest
         PackageType: Image
         RecursiveLoop: Terminate
         SnapStart:
          ApplyOn: None
         Events:
          Api1:
           Type: Api
           Properties:
            Path: /cli-lambda
            Method: ANY

5.  Let your Lambda function by invoking it.
