const AWS = require('aws-sdk');

const {
  REGION,
  VIDEOS_TABLE_NAME

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

/* PUT /Video/:id */
exports.putVideo = async (event) => {
    console.log("putVideo:", JSON.stringify(event, null, 2));
  
    if (!event.pathParameters.id) {
      return response({ message: 'Missing id' }, 400);
    }
  
    try {
      const payload = JSON.parse(event.body);
      const params = {
        TableName: VIDEOS_TABLE_NAME,
        Key: {
          'Id': {
            S: event.pathParameters.id
          }
        },
        ExpressionAttributeNames: {
          '#Title': 'Title',
          '#Subtitle': 'Subtitle'
        },
        ExpressionAttributeValues: {
          ':title': {
            S: payload.title
          },
          ':subtitle': {
            S: payload.subtitle
          },
        },
        UpdateExpression: 'SET #Title = :title, #Subtitle = :subtitle',
        ReturnValues: "ALL_NEW"
      };
  
  
      if (payload.viewers) {
        params.ExpressionAttributeNames['#Viewers'] = 'Viewers';
        params.ExpressionAttributeValues[':viewers'] = {
          N: String(payload.viewers)
        };
  
        params.UpdateExpression = 'SET #Title = :title, #Subtitle = :subtitle, #Viewers = :viewers';
      }
  
  
      console.info("putVideo > params:", JSON.stringify(params, null, 2));
  
      const result = await ddb.updateItem(params).promise();
  
      console.info("putVideo > result:", JSON.stringify(result, null, 2));
  
      const updateResponse = {
        Id: result.Attributes.Id.S ? result.Attributes.Id.S : '',
        Title: result.Attributes.Title.S ? result.Attributes.Title.S : '',
        Subtitle: result.Attributes.Subtitle.S ? result.Attributes.Subtitle.S : '',
        Viewers: result.Attributes.Viewers.N ? parseInt(result.Attributes.Viewers.N, 10) : 0
      };
  
      console.info("putVideo > updateResponse :", JSON.stringify(updateResponse, null, 2));
  
      return response(updateResponse);
  
    } catch (err) {
  
      console.info("putVideo > err:", err);
      return response(err, 500);
    }
  };
  