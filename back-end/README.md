## Back-End

The back-end is build with

* AWS SAM
* AWS SAM Local
* AWS Lambda (Node.js 8.10)
* AWS API-Gateway

The JS is in the shared and functions/<FUNCTION_NAME> folders.

The template.yaml file is the link between the JS code and AWS.

### setup

`npm i` will install the modules for the npm scripts

### npm scripts

* `setup`
  * installs npm modules for all Lambda functions
  * copies the shared code to all Lambda functions
  * needs to be run before packaging and when the shared code changed
* `package` will upload the JS code for the Lambda functions to an S3 bucket
  and create a packaged.yaml
* `deploy` will run CloudFormation with the packaged.yaml
