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
  
      let dbResult = await ddb.deleteItem(params).promise();
  
      return response({ dbResult });
  
    } catch (err) {
  
      console.info("deleteRecordedVideo > err:", err);
      return response(err, 500);
  
    }
  };