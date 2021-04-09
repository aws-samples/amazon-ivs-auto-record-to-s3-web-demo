const AWS = require('aws-sdk');

const {
  REGION,
  CHANNELS_TABLE_NAME

} = process.env;

const VIDEOS_TABLE_NAME = process.env.VIDEOS_TABLE_NAME ? process.env.VIDEOS_TABLE_NAME : null;

const STORAGE_URL = process.env.STORAGE_URL ? process.env.STORAGE_URL : null;

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

// GET /videos and /video/:id
exports.getVideos = async (event) => {
  console.log("getVideos:", JSON.stringify(event, null, 2));

  try {


    if (event.pathParameters && event.pathParameters.id) {
      console.log("getVideos > by id");

      const params = {
        TableName: VIDEOS_TABLE_NAME,
        Key: {
          'Id': {
            'S': event.pathParameters.id
          }
        }
      };

      console.info("getVideos > by id > params:", JSON.stringify(params, null, 2));

      const result = await ddb.getItem(params).promise();

      console.info("getVideos > by id > result:", JSON.stringify(result, null, 2));

      // empty
      if (!result.Item) {
        return response(null, 404);
      }

      // removes types
      const filtered = {
        title: result.Item.Title ? result.Item.Title.S : '',
        subtitle: result.Item.Subtitle ? result.Item.Subtitle.S : '',
        id: result.Item.Id.S,
        created_on: result.Item.CreatedOn ? result.Item.CreatedOn.S : '',
        playbackUrl: result.Item.PlaybackUrl ? result.Item.PlaybackUrl.S : '',
        thumbnail: result.Item.Thumbnail ? result.Item.Thumbnail.S : '',
        thumbnails: result.Item.Thumbnails ? result.Item.Thumbnails.SS : [],
        views: result.Item.Viewers ? result.Item.Viewers.N : 0,
        length: result.Item.Length ? result.Item.Length.S : ''
      };



      console.info("getLiveChannels > by channelName > response:", JSON.stringify(filtered, null, 2));

      return response(filtered);

    }

    const result = await ddb.scan({ TableName: VIDEOS_TABLE_NAME }).promise();


    console.info("getVideos > result:", JSON.stringify(result, null, 2));

    // empty
    if (!result.Items) {
      return response({ "vods": [] });
    }

    // removes types
    let filteredItem;
    let filteredItems = [];
    let prop;
    for (prop in result.Items) {
      filteredItem = {
        id: result.Items[prop].Id.S,
        title: result.Items[prop].Title.S,
        subtitle: result.Items[prop].Subtitle.S,
        created_on: result.Items[prop].CreatedOn.S,
        playbackUrl: result.Items[prop].PlaybackUrl.S,
        thumbnail: result.Items[prop].Thumbnail ? result.Items[prop].Thumbnail.S : '',
        thumbnails: result.Items[prop].Thumbnails ? result.Items[prop].Thumbnails.SS : [],
        views: result.Items[prop].Viewers ? result.Items[prop].Viewers.N : 0,
        length: result.Items[prop].Length ? result.Items[prop].Length.S : ''
      };


      filteredItems.push(filteredItem);

    }

    console.info("getLiveChannelDetails > by channelName > response:", JSON.stringify(filteredItems, null, 2));
    return response({ "vods": filteredItems });

  } catch (err) {

    console.info("getLiveChannelDetails > err:", err);
    return response(err, 500);

  }
};

const _stopStream = async (params) => {

  console.log("_stopStream > params:", JSON.stringify(params, null, 2));

  try {

    const result = await ivs.stopStream(params).promise();
    // console.info("_stopStream > result:", result);
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

const _createRecordingConfiguration = async (payload) => {
  if (!payload) {
    return response("Empty request", 400);
  }

  if (!payload.name) {
    return response("Must configuration name.", 400);
  }

  if (!payload.bucketName) {
    return response("Must bucket name.", 400);
  }

  const params = {
    recordingConfiguration: {
      name: payload.name,
      destinationConfiguration: {
        s3: {
          bucketName: payload.bucketName,
          // bucketPrefix: payload.bucketPrefix // ?
        }
      },
      tags: payload.tags
    }
  };

  try {
    return await ivs.createRecordingConfiguration(params).promise();
  } catch (err) {
    throw err;
  }
};

const _createDdbChannel = async (payload) => {

  try {
    const result = await ddb.putItem({
      TableName: CHANNELS_TABLE_NAME,
      Item: {
        'Id': { S: payload.Id },
        'ChannelArn': { S: payload.channelArn },
        'IngestServer': { S: payload.ingestServer },
        'PlaybackUrl': { S: payload.playbackUrl },
        'Title': { S: payload.title },
        'Subtitle': { S: payload.subtitle },
        'StreamKey': { S: payload.streamKey },
        'StreamArn': { S: payload.streamArn },
        'IsLive': { BOOL: false }
      }
    }).promise();

    console.info("_createDdbChannel > result:", result);

    return result;
  } catch (err) {
    console.info("_createDdbChannel > err:", err, err.stack);
    throw new Error(err);
  }

};

const _createDdbVideo = async (payload) => {

  try {
    const result = await ddb.putItem({
      TableName: VIDEOS_TABLE_NAME,
      Item: {
        'Id': { S: payload.id },
        'Channel': { S: payload.channelName },
        'Title': { S: payload.title },
        'Subtitle': { S: payload.subtitle },
        'CreatedOn': { S: payload.createOn },
        'PlaybackUrl': { S: payload.playbackUrl },
        'Viewers': { N: payload.viewers },
        'Length': { S: payload.length },
        'Thumbnail': { S: payload.thumbnail },
        'Thumbnails': { SS: payload.thumbnails },
      }
    }).promise();

    console.info("_createDdbVideo > result:", JSON.stringify(result));

    return result;
  } catch (err) {
    console.info("_createDdbVideo > err:", err, err.stack);
    throw new Error(err);
  }

};

exports.createChannel = async (event) => {
  console.log("createChannel event:", JSON.stringify(event, null, 2));

  let payload;

  try {
    payload = JSON.parse(event.body);
  } catch (err) {
    return response(err, 500);
  }

  if (!payload || !payload.name) {
    return response("Must provide name.", 400);
  }

  const params = {
    latencyMode: payload.latencyMode || 'NORMAL',
    name: payload.name,
    tags: payload.tags || {},
    type: payload.type || 'BASIC'
  };

  try {
    const createChannelResult = await ivs.createChannel(params).promise();

    if (payload.recordingConfiguration) {
      try {
        const createRecordingConfigurationResult = await _createRecordingConfiguration(payload.recordingConfiguration);
        return response({
          createChannelResult,
          createRecordingConfigurationResult
        });
      } catch (err) {
        return response({
          createChannelResult,
          createRecordingConfigurationResult: err
        }, 500);
      }
    }

    return response(createChannelResult);
  } catch (err) {
    return response(err, 500);
  }

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
    }

    return response(key, 200);

  } catch (err) {

    console.info("resetDefaultStreamKey > err:", err);
    return response(err, 500);

  }
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

/* Cloudwatch event */

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

/* EventBridge */

exports.customEventFromEventBridge = async (event) => {
  console.log("customEventFromEventBridge:", JSON.stringify(event, null, 2));

  const params = {
    TableName: CHANNELS_TABLE_NAME,
    Key: {
      'Id': {
        S: event.detail.channel_name
      },
    }
  };


  const channel = await ddb.getItem(params).promise();

  console.log("customEventFromEventBridge >  getChannel :", JSON.stringify(channel));

  if (event.detail.event_name == "Stream Start") {
    try {
      await _updateDDBChannelIsLive(true, event.detail.channel_name);

      return;

    } catch (err) {
      console.info("_customEventFromEventBridge > Stream Start > err:", err, err.stack);
      throw new Error(err);
    }
  }

  if (event.detail.event_name == "Stream End") {
    try {
      await _updateDDBChannelIsLive(false, event.detail.channel_name);

      return;

    } catch (err) {
      console.info("_customEventFromEventBridge > Stream End> err:", err, err.stack);
      throw new Error(err);
    }
  }

  if (event.detail.recording_status == "Recording End") {
    try {
      console.log("customEventFromEventBridge > Recording End > getChannel :", JSON.stringify(channel));
      let payload = {
        id: event.detail.stream_id,
        channelName: event.detail.channel_name,
        title: channel.Item.Title.S,
        subtitle: channel.Item.Subtitle.S,
        length: msToTime(event.detail.recording_duration_ms),
        createOn: event.time,
        playbackUrl: `${STORAGE_URL}/${event.detail.recording_s3_key_prefix}/media/hls/master.m3u8`,
        viewers: channel.Item.Viewers.N,
        thumbnail: `${STORAGE_URL}/${event.detail.recording_s3_key_prefix}/media/thumbnails/thumb0.jpg`,
        thumbnails: [
          `${STORAGE_URL}/${event.detail.recording_s3_key_prefix}/media/thumbnails/thumb0.jpg`,
          `${STORAGE_URL}/${event.detail.recording_s3_key_prefix}/media/thumbnails/thumb1.jpg`,
          `${STORAGE_URL}/${event.detail.recording_s3_key_prefix}/media/thumbnails/thumb2.jpg`,
        ]
      };


      await _createDdbVideo(payload);

      return;

    } catch (err) {
      console.info("_customEventFromEventBridge > Recording End > err:", err, err.stack);
      throw new Error(err);
    }
  }
  return;
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

function msToTime(s) {

  // Pad to 2 or 3 digits, default is 2
  function pad(n, z) {
    z = z || 2;
    return ('00' + n).slice(-z);
  }

  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);
}