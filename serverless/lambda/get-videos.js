
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
  
  
  
        console.info("getVideos > by Id > response:", JSON.stringify(filtered, null, 2));
  
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
  
      console.info("getVideos > response:", JSON.stringify(filteredItems, null, 2));
      return response({ "vods": filteredItems });
  
    } catch (err) {
  
      console.info("getVideos > err:", err);
      return response(err, 500);
  
    }
  };