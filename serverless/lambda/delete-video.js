const AWS = require('aws-sdk');

const {
  REGION,
  VIDEOS_TABLE_NAME

} = process.env;

const ivs = new AWS.IVS({
  apiVersion: '2020-07-14',
  REGION // Must be in one of the supported regions
});

const S3 = new AWS.S3({
    apiVersion: '2006-03-01'
  });

const ddb = new AWS.DynamoDB();

const response = (body, statusCode = 200) => {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(body)
    };
  };

// DELETE /video/:id
exports.deleteRecordedVideo = async (event) => {
    try {
      if (!event.pathParameters.id) {
        return response({ message: 'Missing id' }, 400);
      }
  
      let params = {
        TableName: VIDEOS_TABLE_NAME,
        Key: {
          "Id": {
            S: event.pathParameters.id
          }
        }
  
      };
  
      console.info("deleteRecordedVideo > params:", params);
  
      let dbResult = await ddb.getItem(params).promise();
  
      if ((!result.Item.RecordingConfiguration || !result.Item.RecordingConfiguration.S) || (!result.Item.RecordedFilename || !result.Items.RecordedFilename.S)) {
        return response("No recording!", 500);
      }
  
      const r2s3 = JSON.parse(result.Item.RecordingConfiguration.S);
  
      params = {
        Bucket: r2s3.bucketName,
        Key: result.Item.RecordedFilename.S
      };
      const s3Result = await S3.deleteObject(params).promise();
  
  
      dbResult = await ddb.deleteItem(params).promise();
  
      return response({ dbResult, s3Result });
  
    } catch (err) {
  
      console.info("deleteRecordedVideo > err:", err);
      return response(err, 500);
  
    }
  };