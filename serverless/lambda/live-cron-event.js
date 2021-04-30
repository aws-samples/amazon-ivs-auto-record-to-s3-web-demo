

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

const _updateDDBChannelIsLive = async (isLive, id, stream) => {

    try {
      const params = {
        TableName: CHANNELS_TABLE_NAME,
        Key: {
          'Id': {
            S: id
          },
        },
        ExpressionAttributeNames: {
          '#IsLive': 'IsLive',
          '#ChannelStatus': 'ChannelStatus',
          '#Viewers': 'Viewers'
        },
        ExpressionAttributeValues: {
          ':isLive': {
            BOOL: isLive
          },
          ':channelStatus': {
            S: stream ? JSON.stringify(stream) : '{}'
          },
          ':viewers': {
            N: stream ? String(stream.viewerCount) : String(0)
          }
        },
        UpdateExpression: 'SET #IsLive = :isLive, #ChannelStatus = :channelStatus, #Viewers = :viewers',
        ReturnValues: "ALL_NEW"
      };
  
      console.info("_updateDDBChannelIsLive > params:", JSON.stringify(params, null, 2));
  
      const result = await ddb.updateItem(params).promise();
  
      return result;
    } catch (err) {
      console.info("_updateDDBChannelIsLive > err:", err, err.stack);
      throw new Error(err);
    }
  
  };
  
  const _isLive = async (counter) => {
    console.info("_isLive > counter:", counter);
  
    const liveStreams = await ivs.listStreams({}).promise();
    console.info("_isLive > liveStreams:", liveStreams);
  
    if (!liveStreams) {
      console.log("_isLive: No live streams. Nothing to check");
      return;
    }
  
    const result = await ddb.scan({ TableName: CHANNELS_TABLE_NAME }).promise();
    if (!result.Items) {
      console.log("_isLive: No channels. Nothing to check");
      return;
    }
  
    let len = result.Items.length;
    while (--len >= 0) {
  
      const channelArn = result.Items[len].ChannelArn.S;
  
      console.log("_isLive > channel:", channelArn);
      const liveStream = liveStreams.streams.find(obj => obj.channelArn === channelArn);
      console.log("_isLive > liveStream:", JSON.stringify(liveStream, null, 2));
  
      await _updateDDBChannelIsLive((liveStream ? true : false), result.Items[len].Id.S, liveStream);
  
    }
  };
  /* Cloudwatch event */
  exports.isLiveCron = async (event) => {
    console.log("isLiveCron event:", JSON.stringify(event, null, 2));
  
    // Run three times before the next scheduled event every 1 minute
    const waitTime = 3 * 1000; // 3 seconds
    let i = 0;
    _isLive(i + 1); // run immediately
    for (i; i < 2; i++) {
      await new Promise(r => setTimeout(r, waitTime)); // wait 3 seconds
      console.log("isLiveCron event: waited 3 seconds");
      _isLive(i + 1);
    }
  
    console.log("isLiveCron event: end");
  
    return;
  };