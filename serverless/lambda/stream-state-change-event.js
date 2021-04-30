const AWS = require('aws-sdk');
const {
  REGION,
  CHANNELS_TABLE_NAME,
  STORAGE_URL,
  VIDEOS_TABLE_NAME
} = process.env;
const ddb = new AWS.DynamoDB();

exports.customEventFromEventBridge = async (event) => {
    console.log("Stream State Change:", JSON.stringify(event, null, 2));
    const params = {TableName: CHANNELS_TABLE_NAME, Key: {'Id': {S: event.detail.channel_name}}};
    const channel = await ddb.getItem(params).promise();

    if (event.detail.event_name == "Stream Start") {
      try {
        await _updateDDBChannelIsLive(true, event.detail.channel_name);
        return;
      } catch (err) {
        console.info("Stream Start>err:", err, err.stack);
        throw new Error(err);
      }
    }
  
    if (event.detail.event_name == "Stream End") {
      try {
        await _updateDDBChannelIsLive(false, event.detail.channel_name);
        return;
      } catch (err) {
        console.info("Stream End> err:", err, err.stack);
        throw new Error(err);
      }
    }
  
    if (event.detail.recording_status == "Recording End") {
      try {
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
        console.info("Recording End > err:", err, err.stack);
        throw new Error(err);
      }
    }
    return;
};
const _createDdbVideo = async (payload) => {
    try {
      const result = await ddb.putItem({
        TableName: VIDEOS_TABLE_NAME,
        Item: {'Id': { S: payload.id }, 'Channel': { S: payload.channelName },'Title': { S: payload.title },'Subtitle': { S: payload.subtitle },'CreatedOn': { S: payload.createOn },'PlaybackUrl': { S: payload.playbackUrl },'Viewers': { N: payload.viewers },'Length': { S: payload.length },'Thumbnail': { S: payload.thumbnail },'Thumbnails': { SS: payload.thumbnails },}}).promise();
      return result;
    } catch (err) {
      console.info("_createDdbVideo > err:", err, err.stack);
      throw new Error(err);
    }
  };
const _updateDDBChannelIsLive = async (isLive, id, stream) => {
    try {
      const params = {
        TableName: CHANNELS_TABLE_NAME,
        Key: {
          'Id': {
            S: id
          }
        },
        ExpressionAttributeNames: {'#IsLive': 'IsLive','#ChannelStatus': 'ChannelStatus','#Viewers': 'Viewers'},
        ExpressionAttributeValues: {
          ':isLive': { BOOL: isLive},
          ':channelStatus': { S: stream ? JSON.stringify(stream) : '{}'},
          ':viewers': { N: stream ? String(stream.viewerCount) : String(0)}
        },
        UpdateExpression: 'SET #IsLive = :isLive, #ChannelStatus = :channelStatus, #Viewers = :viewers',
        ReturnValues: "ALL_NEW"
    };
    const result = await ddb.updateItem(params).promise();
    return result;
    } catch (err) {
      console.info("Update Channel > err:", err, err.stack);
      throw new Error(err);
    }
};

function msToTime(e){function n(e,n){return("00"+e).slice(-(n=n||2))}var r=e%1e3,i=(e=(e-r)/1e3)%60,t=(e=(e-i)/60)%60;return n((e-t)/60)+":"+n(t)+":"+n(i)+"."+n(r,3)}