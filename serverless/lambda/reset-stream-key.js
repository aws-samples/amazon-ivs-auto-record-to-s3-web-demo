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

exports.resetStreamKey = async (event) => {
    console.log("resetDefaultStreamKey event:", JSON.stringify(event, null, 2));
    let payload;
    try {
  
      payload = JSON.parse(event.body);
      console.log(`payload `, JSON.stringify(payload));
      let params = {
        TableName: CHANNELS_TABLE_NAME,
        Key: {
          'Id': {
            'S': payload.channelName
          }
        }
      };
  
      console.log('resetDefaultStreamKey event >  getChannel params', JSON.stringify(params, '', 2));
  
      const result = await ddb.getItem(params).promise();
  
      if (!result.Item) {
        console.log('Channel not found');
        return response({});
      }
  
      const channel = result.Item;
  
      const stopStreamParams = {
        channelArn: channel.ChannelArn.S
      };
      console.log("resetDefaultStreamKey event > stopStreamParams:", JSON.stringify(stopStreamParams, '', 2));
  
      await _stopStream(stopStreamParams);
  
      const deleteStreamKeyParams = {
        arn: channel.StreamArn.S
      };
      console.log("resetDefaultStreamKey event > deleteStreamKeyParams:", JSON.stringify(deleteStreamKeyParams, '', 2));
  
      // Quota limit 1 - delete then add
  
      await ivs.deleteStreamKey(deleteStreamKeyParams).promise();
  
      const createStreamKeyParams = {
        channelArn: channel.ChannelArn.S
      };
      console.log("resetDefaultStreamKey event > createStreamKeyParams:", JSON.stringify(createStreamKeyParams, '', 2));
  
      const newStreamKey = await ivs.createStreamKey(createStreamKeyParams).promise();
  
      console.log(" resetDefaultStreamKey event > newStreamKey ", JSON.stringify(newStreamKey));
  
      params = {
        TableName: CHANNELS_TABLE_NAME,
        Key: {
          'Id': {
            S: payload.channelName
          }
        },
        ExpressionAttributeNames: {
          '#StreamArn': 'StreamArn',
          '#StreamKey': 'StreamKey'
        },
        ExpressionAttributeValues: {
          ':streamArn': {
            S: newStreamKey.streamKey.arn
          },
          ':streamKey': {
            S: newStreamKey.streamKey.value
          }
        },
        UpdateExpression: 'SET #StreamArn = :streamArn, #StreamKey = :streamKey',
        ReturnValues: "ALL_NEW"
      };
  
      console.info("resetDefaultStreamKey > params:", JSON.stringify(params, null, 2));
  
      await ddb.updateItem(params).promise();
  
      const key = {
        "data": {
          "ingest": channel.IngestServer.S,
          "key": newStreamKey.streamKey.value
        }
      };
  
      return response(key, 200);
  
    } catch (err) {
  
      console.info("resetDefaultStreamKey > err:", err);
      return response(err, 500);
  
    }
  };

  const _stopStream = async (params) => {

    console.log("_stopStream > params:", JSON.stringify(params, null, 2));
  
    try {
  
      const result = await ivs.stopStream(params).promise();

      return result;
  
    } catch (err) {
  
      console.info("_stopStream > err:", err);
      console.info("_stopStream > err.stack:", err.stack);
  
      // Ignore error
      if (/ChannelNotBroadcasting/.test(err)) {
        return;
      }
  
      throw new Error(err);
  
    }
  };