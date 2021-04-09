const cfnResp = require("cfn-response");
const AWS = require("aws-sdk");

const ddb = new AWS.DynamoDB();

exports.handler = async (event, context) => {
    console.log("=========== event ===================");
    console.log(JSON.stringify(event));
    console.log("=========== context ===================");
    console.log(JSON.stringify(context));

    if (event.RequestType != "Create") {
        return response(event, context, cfnResp.SUCCESS, {});
    }

    try{

        let payload = {
            id : event.ResourceProperties.Id,
            channelArn : event.ResourceProperties.ChannelArn,
            title : event.ResourceProperties.Title,
            subtitle : event.ResourceProperties.Subtitle,
            ingestServer : event.ResourceProperties.IngestServer,
            playbackUrl : event.ResourceProperties.PlaybackUrl,
            streamKey : event.ResourceProperties.StreamKey,
            streamArn : event.ResourceProperties.StreamArn
          };
          
        
        const result = await _createDdbChannel(payload, process.env.CHANNELS_TABLE_NAME);
        
        console.info("loadChannelInfo > createDdbChannel : ", JSON.stringify(result, null, 2));

        return response(event, context, cfnResp.SUCCESS, {});

        
    }catch(err){
        console.log(`Error: ${err}`);
        return response(event, context, cfnResp.FAILED, {});
    }



};

const _createDdbChannel = async (payload, table) => {
    const params = {
        TableName: table,
        Item: {
            'Id': { S: payload.id },
            'ChannelArn': { S: payload.channelArn },
            'IngestServer': { S: payload.ingestServer },
            'PlaybackUrl': { S: payload.playbackUrl },
            'Title': { S: payload.title },
            'Subtitle': { S: payload.subtitle },
            'StreamKey': { S: payload.streamKey },
            'StreamArn': { S: payload.streamArn },
            'IsLive': { BOOL: false }
        }
    };
    
    const result = await ddb.putItem(params).promise();

    console.info("_createDdbChannel > result:", result);

    return result;
  
  };

  function response(event, context, status, responseData) {
    return new Promise(() => cfnResp.send(event, context, status,
        responseData ? responseData : {}, event.LogicalResourceId));
}
