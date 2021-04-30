
const AWS = require('aws-sdk');

const {
  REGION,
  CHANNELS_TABLE_NAME

} = process.env;

const ivs = new AWS.IVS({
  apiVersion: '2020-07-14',
  REGION // Must be in one of the supported regions
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
// GET /live-details
exports.getLiveChannelDetails = async (event) => {
    console.log("getLiveChannelDetails:", JSON.stringify(event, null, 2));
  
    try {
  
      if (!event.queryStringParameters.channelName) {
        return response({ message: 'Missing channelName' }, 400);
      }
  
      let params = {
        TableName: CHANNELS_TABLE_NAME,
        Key: {
          "Id": {
            S: event.queryStringParameters.channelName
          }
        }
      };
  
      console.info("getLiveChannelDetails > by channelName > params:", JSON.stringify(params, null, 2));
  
      const result = await ddb.getItem(params).promise();
  
      console.info("getLiveChannelDetails > by channelName > result:", JSON.stringify(result, null, 2));
  
      // empty
      if (!result.Item) {
        return response({});
      }
  
      console.log(`channel  ${JSON.stringify(result)}`);
  
      const channel = result.Item;
  
      const streamObj = await ivs.getStreamKey({ arn: channel.StreamArn.S }).promise();
      const channelObj = await ivs.getChannel({ arn: channel.ChannelArn.S }).promise();
  
      console.log(`stream object  ${JSON.stringify(streamObj)}`);
      console.log(`channel object  ${JSON.stringify(channelObj)}`);
  
      const finalResult = {
        "data": {
          ingest: channelObj.channel.ingestEndpoint,
          key: streamObj.streamKey.value
        }
      };
  
      console.info("getLiveChannelDetails > by channelName > response:", JSON.stringify(finalResult, null, 2));
      return response(finalResult, 200);
  
  
    } catch (err) {
  
      console.info("getLiveChannelDetails > err:", err);
      return response(err, 500);
  
    }
  };