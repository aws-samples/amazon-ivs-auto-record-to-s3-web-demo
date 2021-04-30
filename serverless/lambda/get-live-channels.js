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

// GET /live
exports.getLiveChannels = async (event) => {
  console.log("getLiveChannels:", JSON.stringify(event, null, 2));

  try {



    if (event.queryStringParameters && event.queryStringParameters.channelName) {
      console.log("getLiveChannels > by channelName");
      let params = {
        TableName: CHANNELS_TABLE_NAME,
        Key: {
          "Id": {
            S: event.queryStringParameters.channelName
          }
        }

      };

      console.info("getLiveChannels > by channelName > params:", JSON.stringify(params, null, 2));

      const result = await ddb.getItem(params).promise();

      console.info("getLiveChannels > by channelName > result:", JSON.stringify(result, null, 2));

      // empty
      if (!result.Item) {
        return response({});
      }

      // there is only one live stream per channel at time
      const stream = JSON.parse(result.Item.ChannelStatus.S);
      console.log(JSON.stringify(stream));
      // removes types
      const data = {
        "data": {
          id : result.Item.Id ? result.Item.Id.S : '',
          channelArn: result.Item.ChannelArn ? result.Item.ChannelArn.S : '',
          title: result.Item.Title ? result.Item.Title.S : '',
          subtitle: result.Item.Subtitle ? result.Item.Subtitle.S : '',
          thumbnail: '',
          isLive: result.Item.IsLive && result.Item.IsLive.BOOL ? 'Yes' : 'No',
          viewers: stream.viewerCount ? stream.viewerCount : 0,
          playbackUrl: result.Item.PlaybackUrl ? result.Item.PlaybackUrl.S : ''
        }
      };

      console.info("getLiveChannels > by channelName > response:", JSON.stringify(data, null, 2));

      return response(data);
    }

    console.log("getLiveChannels > list");

    const scanParams = {
      "TableName": CHANNELS_TABLE_NAME
    };



    console.info("getLiveChannels > list > params:", JSON.stringify(scanParams, null, 2));

    const result = await ddb.scan(scanParams).promise();

    console.info("getLiveChannels > list > result:", JSON.stringify(result, null, 2));

    // empty
    if (!result.Items) {
      return response([]);
    }

    // removes types
    let channelLive = result.Items[0];
    let stream = {};
    try {
      stream = JSON.parse(channelLive.ChannelStatus.S);
    } catch (err) { }

    const data = {
      "data": {
        id : channelLive.Id ? channelLive.Id.S : '',
        channelArn: channelLive.ChannelArn ? channelLive.ChannelArn.S : '',
        title: channelLive.Title ? channelLive.Title.S : '',
        subtitle: channelLive.Subtitle ? channelLive.Subtitle.S : '',
        thumbnail: '',
        isLive: channelLive.IsLive && channelLive.IsLive.BOOL ? 'Yes' : 'No',
        viewers: stream.viewerCount ? stream.viewerCount : 0,
        playbackUrl: result.Items[0].PlaybackUrl ? result.Items[0].PlaybackUrl.S : ''
      }
    };

    console.info("getLiveChannels > list > response:", JSON.stringify(data, null, 2));

    return response(data);

  } catch (err) {
    console.info("getLiveChannels > err:", err);
    return response(err, 500);
  }
};
