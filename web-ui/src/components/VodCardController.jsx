import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import VodCard from "./VodCard/VodCard";
import API from "../get-video-api";
import FormatTimestamp from "../utility/FormatTimestamp";
import * as config from "../config";

function sortByKey(array, key) {
  return array.sort(function(a, b) {
    var x = a[key]; var y = b[key];
    return ((x > y) ? -1 : ((x < y) ? 1 : 0));
  });
}

function VodCardController(props) {
  const [response, setResponse] = useState({});
  const [timerID, setTimerID] = useState(false);

  const fetchAPI = () => {
    // Call API and set the matched value if we're mounted
    if (config.USE_MOCK_DATA && config.USE_MOCK_DATA === true){
      const vods = API.vods;
      setResponse(vods);
    } else {
      const getVideosUrl = `${config.API_URL}/videos`;

      fetch(getVideosUrl)
      .then(response => response.json())
      .then((res) => {
        const sortedVods = sortByKey(res.vods, "created_on")
        setResponse(sortedVods);
      })
      .catch((error) => {
        console.error(error);
      });
    }
  }

  useEffect(() => {
    // Set mounted to true so that we know when first mount has happened
    let mounted = true;

    if (!timerID && mounted) {
      fetchAPI();
      const timer = setInterval(() => {
        fetchAPI();
      }, config.POLL_DELAY_MS)
      setTimerID(timer);
    }

    // Set mounted to false & clear the interval when the component is unmounted
    return () => {
      mounted = false;
      clearInterval(timerID);
    }
  }, [timerID])

  const formattedAPIResponse = [];

  // Format Thumbnail, title, subtitle, hint into array of objects
  for (let index = 0; index < response.length; index++) {
    const vod = response[index];
    const time = FormatTimestamp(vod.length);
    const hintMeta = `${vod.views} views • ${time}`;
    formattedAPIResponse.push({
      id: vod.id,
      title: vod.title,
      subtitle: vod.subtitle,
      hint: hintMeta,
      thumbnailUrl: vod.thumbnail,
    });
  }

  return (
    <>
      {formattedAPIResponse.map((v, i) => {
        return (
          <VodCard
            key={v.id}
            id={v.id}
            title={v.title}
            subtitle={v.subtitle}
            hint={v.hint}
            thumbnailUrl={v.thumbnailUrl}
            linkType={props.linkType}
          />
        );
      })}
    </>
  );
}

VodCardController.propTypes = {
  offset: PropTypes.string,
  linkType: PropTypes.string,
};

export default VodCardController;
