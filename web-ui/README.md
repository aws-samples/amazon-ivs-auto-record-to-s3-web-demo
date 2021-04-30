# Amazon IVS Auto-record to S3 demo web-ui installation instructions

The client app for this demo is built with React.js and is modifiable to suit your implementation needs. This file contains the instructions for setting up your development environment to work with the [serverless backend](../serverless).

## Prerequisites

### 1. Set up serverless backend
Before you run the client application, you must finish setting up the [serverless backend](../serverless). See [Step 4](../serverless#4-take-note-of-the-stack-outputs) of the serverless readme for full instructions.

Once you have this value, you'll' need to modify `web-ui/src/config.js` to support your installation. Replace the value from this line with the **ApiGatewayStageUrl** you copied from the stack outputs of the serverless setup.

```
export const API_URL = "https://<api-gateway-id>.execute-api.<region>.amazonaws.com/<stage-name>"
```

**Important CloudFront information:**
Given the distributed nature of the CloudFront distribution used in the serverless backend, you may get 404 errors if you try to use it before CloudFront has completed its propagation to all EDGE locations. If you are experiencing errors with the application, wait a least an hour before you try to use the web-ui client on a new stack.

### 2. Install nodejs

Install the LTS version of the [NodeJS](https://nodejs.org/) server environment into your development environment.

### 3. Install the Yarn package manager

Install the [Yarn package manager](https://yarnpkg.com/) into your development environment by executing the following command:

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
