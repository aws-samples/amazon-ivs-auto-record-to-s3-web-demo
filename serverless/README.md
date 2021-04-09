# Amazon IVS Auto-record to Amazon S3 Serverless Installation Instructions

This file includes instructions for installing the Amazon IVS Auto-record to S3 web demo serverless infrastructure. A text editor will be handy for copying keys and values and configuring commands to paste into CLI screens.

If you choose to use either the AWS CLI application or the CloudShell UI, we have included sample commands for all applicable steps of the installation.

## 1. Configure a Command Line Interface for the installation

**OPTION #1 - Using AWS CloudShell (Preferred Option)**

AWS CloudShell is a browser-based, pre-authenticated shell that you can launch directly from the AWS Management Console. You can run AWS CLI commands against AWS services using your preferred shell (Bash, PowerShell, or Z shell). Since this is a browser-based tool, you can do this without needing to download or install command line tools.

To start working with the shell, sign in to the AWS Management Console and choose AWS CloudShell from the home page.

![CloudShell](https://docs.aws.amazon.com/cloudshell/latest/userguide/images/launch_page.png)

**OPTION #2 - Using the AWS Command Line Interface (CLI)**

The AWS CLI application is a command line tool which can be installed on a local computer. Running the application will present a conventional command shell which will let you execute AWS commands directly on AWS accounts. If you need help with the tool, here's the [main AWS Command Line Interface page](https://aws.amazon.com/cli/).

You can download and install the AWS CLI version 2 from [this page](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html).

## Create an Access key ID and a Secret Access Key (Only Required for CLI Access)

These keys are your credentials to access the AWS account with the proper access privileges to manage this software installation. In order to protect your AWS account, keep the keys confidential and never email them. Do not share them outside your organization, even if an inquiry appears to come from AWS or Amazon.com.
Remember, **no one who legitimately represents Amazon will ever ask you for your secret key.**

When you create an access key, the key pair is active by default, and you can use the pair right away. Here are the steps to use:

1. Sign in to the AWS Management Console and open the [IAM console](https://console.aws.amazon.com/iam/).
2. In the navigation pane, choose **Users**.
3. Choose the name of the user whose access keys you want to create, and then choose the **Security Credentials** tab.
4. In the Access keys section, choose Create access key.
5. To view the new access key pair, choose **Show**. **This is a one-time dialog box. You will not have access to the secret access key again after this dialog box closes.**

- Your credentials will look something like this:
  - Access key ID: AKIAIOSFODNN7EXAMPLE
  - Secret access key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

6. To download the key pair, choose **Download .csv file** and store the keys in a secure location. **You will not have access to download the secret access key pair again after this dialog box closes.**
7. After you download the key pair .csv file, choose **Close**.

Once you've completed this process, you can begin using AWS Cloudshell or the CLI to complete the rest of this process.

### Creating and Using a CLI Profile

The AWS CLI (Command Line Interface) application needs to include your credentials with the commands you send to AWS. It does this via a collection of settings called a **profile**.

The AWS CLI tool uses a default profile which you can configure with the **configure** command and the **--profile** option. You can also create and use additional named profiles with different credentials and settings by specifying the new profile name after the **--profile**  option.

To configure the default profile for the CLI with your permissions, just type or copy/paste the commands below into the CLI application (press Enter after each line). Use your Access Key ID and Secret Access Key instead of the example ones shown.

```console
aws configure --profile default
AWS Access Key ID [None]: EXAMPLEID4UbXK33JRYKC
AWS Secret Access Key [None]: EXAMPLEKEY4Ub1ObyoPOPU/pvuvTPTE72/o7hX
Default region name [None]: us-east-1
Default output format [None]: text
```

If you have created an individual profile, just add **--profile profilename** to your CLI commands as you perform this installation. For example, the following command will list ("ls") the contents of the S3 bucket using the ivsuser profile.

```console
aws s3 ls --profile ivsuser
```

*If you receive any errors such as "command not found", check that the command you're entering is accurate with no extra spaces or characters. You can also use the "**aws help**" or "**aws [command] help**" commands to investigate errors.*

## 2. Create an S3 bucket

The S3 bucket is where the files of the installation will be housed. As the bucket will be accessible by network / Internet, the bucket name must comply with the rules of AWS' DNS (Domain Name System) naming. The bucket name must be:

- All lowercase letters or numbers, with dashes allowed (but no other special characters).
- Between 3 and 63 characters long.
- Unique across all of Amazon S3 (you may need a couple of tries to create a unique one).

**OPTION #1 - Using the CLI or CloudShell**

Execute the command below using the CLI or the CloudShell console. (Remember to append "--profile Profilename" if you are using an individual profile.)

```console
aws s3api create-bucket --bucket <my-bucket-name> --region <my-region> \
--create-bucket-configuration LocationConstraint=<my-region>
```

- Replace `<my-bucket-name>` with the **DNS-compliant name** you chose for your bucket.
- Replace `<my-region>` with the **AWS Region** where you want the bucket to reside.

**OPTION #2 - Using the Web Console**

1. Sign in to the AWS Management Console and open the [Amazon S3 console](https://console.aws.amazon.com/s3/).
2. Choose Create bucket. The Create bucket wizard will open.
3. In Bucket name, enter the **DNS-compliant name** for your bucket.
4. In Region, choose the **AWS Region** where you want the bucket to reside.
5. In Bucket settings for Block Public Access, choose the **Block Public Access** settings that you want to apply to the bucket. As a best practice, it is recommended to block _all_ public access.
*These are all of the settings needed for the IVS R2S3 installation. You can apply other settings as required for other purposes.*
6. Choose **Create bucket**. You will receive a confirmation message and be redirected back to the main S3 Buckets view.

## 2. Upload dependencies to the S3 bucket

Now that the AWS account settings and resources are in place, it's time to prepare the software environment. The first action is to upload the supporting software, or "dependencies", for IVS. You must first compress (zip) the following resources:

```
serverless/dependencies/index.js      -> serverless/dependencies/api_backend.zip
serverless/dependencies/custom_lambda -> serverless/dependencies/custom_lambda.zip

```
After you have compressed the resources, your file tree should resemble the following:

- IVS R2S3 software folder
  - README.md (this file)
  - ivs-PreviewV2.json
  - r2s3-serverless.yaml
  - **dependencies folder**
    - **api_backend.zip**
    - **custom_lambda.zip**

**OPTION #1 - Using the CLI or CloudShell**
Execute the command below using the CLI or the CloudShell console. Make sure to replace `<my-bucket-name>` with the name of the S3 bucket you created.

```console
aws s3 cp ./dependencies s3://<my-bucket-name>/ --recursive
```

Notes: If you use the CLI, make sure you execute the command in the directory where you stored the dependencies. If you use CloudShell, you will have to upload the dependencies files to the CloudShell console first.

**OPTION #2 - Using the Web Console**

1. Sign in to the AWS Management Console and open the [Amazon S3 console](https://console.aws.amazon.com/s3/).
2. In the Buckets list, choose the bucket you created for the IVS R2S3 software.
3. Choose **Upload**.
4. In the Upload window, do one of the following:
   - Drag and drop the .zip files from the **IVS R2S3 software / dependencies** folder to the **Upload window**.
   OR
   - Choose **Add file**, use the browser window to navigate to the **IVS R2S3 software / dependencies** folder, and choose the .zip files to upload.
  *It is not necessary for you to enable versioning.*
5. To upload the listed files and folders without configuring additional upload options, at the bottom of the page, choose **Upload**.
*Amazon S3 uploads your objects and folders. When the upload completes, you can see a success message on the **Upload: status** page.
To configure additional object properties before uploading, see **To configure additional object properties**.*

## 3. Deploy the R2S3 Serverless CloudFormation Template

The IVS R2S3 software includes an AWS CloudFormation template to automatically build the installation stack.

**OPTION #1 - Using the CLI or CloudShell**

Execute the command below using the CLI or the CloudShell web console.

```console
aws cloudformation deploy --template-file r2s3-serverless.yaml --stack-name IVS-R2S3 --parameter-overrides DependenciesBucketName=<my-bucket-name> Title=<title> Subtitle=<subtitle> --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --region=<my-region> --profile "Profilename"
```
Make sure to:

- Replace `<my-bucket-name>` with the name of the bucket you created earlier.
- Replace `<title>` with the title (name) for your stream.
- Replace `<subtitle>` with the subtitle (description) for your stream.
- Replace `<my-region>` with the AWS Region where your bucket resides.
- Use the name of the Profile you created as the "Profilename".

**OPTION #2 -Using the Web Console**

1. Sign in to the AWS Management Console and open the [Amazon CloudFormation console](https://console.aws.amazon.com/cloudformation/).
2. Create a new stack by using one of the following options:
   - Choose **Create Stack**. *This is the only option if you have a currently running stack.*
   - Choose **Create Stack** on the Stacks page. *This option is visible only if you have no running stacks.*
   ![CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/images/console-create-stack-stacks-create-stack.png)
3. On the Specify template page, choose a stack template selecting the **Template is ready** option.
4. Select the **Upload a template file** option.
5. Click on the **Choose file** button and upload the **2s3-serverless.yaml template**.
6. Click on **Next**.
   - In the **Stack name** field, enter **IVS-R2S3**.
   - In the **LambdaSourceStoreBucketName** field, enter the name you selected when you created your bucket.
   - In the **Title** field, enter a title (name) for your stream.
   - In the **Subtitle** field, enter a subtitle (description) for your stream.
7. Click **Next** to advance to the **Configure Stack Options / Advanced Options** page, then click **Next** again to advance to the Review "Stackname" page.
8. Review the settings and use the **Edit** buttons to correct any issues such as misspellings.
9. Scroll to the bottom of the Review Stackname page and select all of the checkboxes in the **Capabilities and Transforms** section.
10. Click on **Create stack** to finalize the settings and create the stack. You will see the Stack Details page, and the **Events / Status field** will display the progress of the stack creation process. Once the stack creation process is complete, the **Events report** will list all of the creation events and their status.

## 4. Take a Note of the Outputs of the CloudFormation Stack

You can view the keys set up by your stack at any time using the CLI or the CloudShell console as shown below.

At this point, you will need to record the values of specific keys for future steps. You can copy and paste them into a text editor or just leave your browser or CLI application open to keep the information handy.

**OPTION #1 - Using the CLI or CloudShell**

Execute the command below using the CLI or the CloudShell console, using the name of the stack as the "Stackname" and the name of the profile you created as the "Profilename".

```console
aws cloudformation describe-stacks --stack-name "Stackname" --profile "Profilename"

```

The command will return a set of information about the stack, including the output keys and values. Record the values of these outputs for use in the next steps:

- ApiGatewayStageUrl
- IvsChannelArn
- IvsStorageBucketName

**OPTION #2 - Using the Web Console**

1. Sign in to the AWS Management Console and open the [Amazon CloudFormation console](https://console.aws.amazon.com/cloudformation/).
2. In the Stacks section, select the stack that was created, then click on the **Outputs** tab.
3. Record the values of these outputs for use in the next steps:
   - ApiGatewayStageUrl
   - IvsChannelArn
   - IvsStorageBucketName

## 5. Create the Recording Configuration Resource

**OPTION #1 - Using the CLI or CloudShell**

Execute the command below using the CLI or the CloudShell console.

- Replace `<ivs-recording-bucket-name>` with the name of the IVS R2S3 storage bucket. You can get the name of this bucket by performing Step 4. from the value of the IvsStorageBucketName key.
- Replace `<my-region>` with the AWS Region where your bucket resides.

```console
aws ivs create-recording-configuration --destination-configuration "s3={bucketName=<ivs-recording-bucket-name>}" --name IVS-R2S3-Recording-Configuration --region <my-region>
```

From the output of this command take note of the **ARN** of the record configuration resource. It will be used in the following two steps.

**OPTION #2 - Using the Web Console**

1. Sign in to the AWS Management Console and open the [Amazon IVS console](https://console.aws.amazon.com/ivs/channels).
2. Click on the "Recording configurations" section.
3. Click on the "Create recording configuration" button.
   - Enter a name for the recording configuration (this is optional).
   - Click on "Select an existing Amazon S3 bucket"
   - Look for the S3 bucket that was created by the stack. You can get the name of this bucket from the **IvsStorageBucketName** listed in Step 4. ...Outputs of the CloudFormation Stack.
   - Click on the "Create recording configuration."

Go back to the recording configurations page and take note of the **ARN** of the record configuration that you just created. It will be used in the following two steps.

## 6. Get the status of the Recording Configuration Resource

Typically, creation of the recording configuration takes a few seconds, but it can be up to 20 seconds. To check that the recording configuration has been created, execute the command below using the CLI or the CloudShell console.

```console
aws ivs get-recording-configuration --arn <ivs-recording-configuration-arn> --region <my-region>
```

- Replace `<ivs-recording-configuration-arn>` with the value taken in the prior step.
- Replace `<my-region>` with the AWS Region where your bucket resides.

The command will return a response after execution. If the state of the resource is **ACTIVE**, proceed to the next step. If not, troubleshoot the command you entered and try again until you receive the **ACTIVE** message.

## 7. Enable Recording in the channel created by the Cloudformation template

**OPTION #1 - Using the CLI or CloudShell**

Execute the command below using the CLI or the CloudShell console.

```console
aws ivs update-channel --arn <ivs-channel-arn> --recording-configuration-arn <ivs-recording-configuration-arn> --region us-west-2
```

- Replace `<ivs-channel-arn>` with the value taken for `IVSChannelArnOutput` in step 4.
- Replace `<ivs-recording-configuration-arn>` with the value taken in the step 5.

**OPTION #2 - Using the Web Console**

1. Sign in to the AWS Management Console and open the [Amazon IVS console](https://console.aws.amazon.com/ivs/channels).
2. Click on the "channels" section.
3. Select the channel that was created with the template. The default name is "IVS-Channel".
4. Click on the "Edit" button.
   - In the "Record and store streams" section, click on the "Auto-record to S3" radio button.
   - Click the "Choose an existing recording configuration dropdown".
   - Select the recording configuration that you created in step #7.
   - Click on "Save changes".

**And that's it!** You've successfully set up the demo software on your AWS account.

## 8. Set up the React client Application

Copy your **ApiGatewayStageUrl** and follow the instructions in the web-ui [README.md](../web-ui/README.md).

# Connecting to the IVS Channel

To connect to the IVS channel with your video capture hardware or streaming application, you will need to use the values of the **IvsStreamKey** and the **IvsChannelIngestEndpointOutput** outputs. You can use the AWS CloudFormation console or the AWS CLI to view these values.

**OPTION #1 - Using the CLI or CloudShell**

Execute the command below using the CLI or the CloudShell console, using the name of the stack as the "Stackname" and the name of the profile you created as the "Profilename".

```console
aws cloudformation describe-stacks --stack-name "Stackname" --profile "Profilename"

```

The command will return a set of information about the stack, including the **IvsStreamKey** and the **IvsChannelIngestEndpointOutput** outputs and values.

**Option 2 - Using the Web Console**

1. Sign in to the AWS Management Console and open the [Amazon CloudFormation console](https://console.aws.amazon.com/cloudformation/).
2. In the Stacks section, select the stack that was created, then click on the **Outputs** tab. The **IvsStreamKey** and the **IvsChannelIngestEndpointOutput** outputs and values will be listed.

# Application Removal and Cleanup

The application uses a small amount of AWS resources even when not in active use. If you wish to uninstall the software to prevent ongoing AWS charges or just to clean up your AWS account, just follow these steps to remove the installed components.

### Empty the S3 Bucket created by CloudFormation for the IVS R2S3 software

1. Sign in to the AWS Management Console and open the [S3 Management Console](https://console.aws.amazon.com/s3/).
2. Select the bucket for the IVS R2S3 software. (The bucket name is also viewable as the value of **IVSStorageBucketName** shown in Step 4. ...Outputs of the CloudFormation Stack.)
3. Click on the **Empty** button, type "**permanently delete**" in the confirmation textbox and then click on the **Empty** button again.

### Delete the IVS R2S3 software's CloudFormation Stack

1. Sign in to the AWS Management Console and open the [Amazon CloudFormation console](https://console.aws.amazon.com/cloudformation/).
2. Select the stack you created in step #3.
3. Click on the "Delete" button.
4. Click on the "Delete stack" button.

### Delete the Recording Configuration

1. After you have deleted the CloudFormation stack, sign in to the AWS Management Console and open the [Amazon IVS console](https://console.aws.amazon.com/ivs/channels).
2. Click on the "Recording configurations" section.
3. Select the recording configuration that you created on step #7.
4. Click on the "Delete" button.
   - Type "Delete" in the confirmation textbox.
   - Click on the "Delete" button.

### Delete the S3 Bucket That You Created Manually

1. Sign in to the AWS Management Console and open the [S3 Management Console](https://console.aws.amazon.com/s3/).
2. Look for the bucket that you created on step #2.
3. Select the bucket, then click on the "Empty" button.
   - Type "permanently delete" in the confirmation textbox and click on the "Empty" button.
4. Select the bucket again, and click on the "Delete" button.
5. Type the name of the bucket in the confirmation textbox.
6. Click on the "Delete bucket" button.

That's it! You have successfully removed all of the IVS R2S3 software components from your AWS account.
