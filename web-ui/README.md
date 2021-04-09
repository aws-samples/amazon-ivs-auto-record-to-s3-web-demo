# Amazon IVS Auto-record to S3 demo web-ui installation instructions

The client app for this demo is built with React.js and is modifiable to suit your implementation needs. This file contains the instructions for setting up your development environment to work with the [serverless backend](https://github.com/aws-samples/amazon-ivs-auto-record-to-s3-web-demo/tree/main/serverless).

## Prerequisites

You will need the following assets and software installations in place to support your development work.

### Software Repository

We recommend using GitHub's Clone menu to clone the IVS R2S3 GitHub repository for a reliable, version-controlled source. You can also use the Clone menu to download the repository for hosting in your preferred source control system.

GitHub uses the Git software for distributed version control. You can download Git and view installation and usage instructions at the <a href="https://git-scm.com/" target="_blank">Git-scm.com</a> website.

### Serverless Installation on an AWS Account

You will need the **ApiGatewayStageUrl** from the Cloudformation stack you created. (If you don't have this, please refer to the (serverless readme)[../serverless] for installation instructions.)

You can get the **ApiGatewayStageUrl** value from the Outputs section of the Cloudformation stack you created with the serverless infrastructure. Use the CloudFormation console to view this information, or with the AWS CLI tool/AWS Cloudshell using the following command: `aws cloudformation describe-stacks --stack-name "Stackname" --profile "Profilename"`. See (Step 4)[https://github.com/aws-samples/amazon-ivs-auto-record-to-s3-web-demo/tree/main/serverless#4-take-a-note-of-the-outputs-of-the-cloudformation-stack] of the installation instructions in the serverless README.md file for full instructions.

Once you have this value, you will need to modify **web-ui/src/config.js** to support your installation. Replace the value from this line:

`export const API_URL = "https://<api-gateway-id>.execute-api.<region>.amazonaws.com/<stage-name>"`

with the stage URL you copied from your stack output section.

### A Note on CloudFront

Given the distributed nature of the CloudFront distribution in the serverless IVS R2S3 infrastructure, make sure you wait a least an hour before you try to use the web-ui client on a new stack. You may get 404 errors if you try to use it before CloudFront has completed its propagation to all EDGE locations.

### Node.JS Server Environment

Install the LTS version of the [NodeJS](https://nodejs.org/) server environment into your development environment.

### Yarn Package Manager

Install the [Yarn Package Manager](https://yarnpkg.com/) into your development environment by executing the command below:

```console
npm i yarn
```

## Quick Start

Run `yarn install` then `yarn start` to start the development server.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)
