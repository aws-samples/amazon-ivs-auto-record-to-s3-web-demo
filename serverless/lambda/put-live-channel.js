
const AWS = require('aws-sdk');

const {
  REGION,
  CHANNELS_TABLE_NAME

} = process.env;


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

// PUT /live
exports.putLiveChannel = async (event) => {
    console.log("putLiveChannel:", JSON.stringify(event, null, 2));
  
    try {
  
      const body = JSON.parse(event.body);
  
      const params = {
        TableName: CHANNELS_TABLE_NAME,
        Key: {
          'Id': {
            S: body.channelName
          }
        },
        ExpressionAttributeNames: {
          '#Title': 'Title',
          '#Subtitle': 'Subtitle'
        },
        ExpressionAttributeValues: {
          ':title': {
            S: body.title
          },
          ':subtitle': {
            S: body.subtitle
          }
        },
        UpdateExpression: 'SET #Title = :title, #Subtitle = :subtitle',
        ReturnValues: "ALL_NEW"
      };
  
      console.info("putLiveChannel > params:", JSON.stringify(params, null, 2));
  
      const result = await ddb.updateItem(params).promise();
  
      console.info("putLiveChannel > result:", JSON.stringify(result, null, 2));
  
      return response(result);
  
    } catch (err) {
  
      console.info("putLiveChannel > err:", err);
      return response(err, 500);
  
    }
  };
  