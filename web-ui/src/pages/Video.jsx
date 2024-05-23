import Navbar from "../components/Navbar/Navbar";
import VideoPlayer from "../components/VideoPlayer/VideoPlayer";
import styles from "./Home.module.css";

import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import FormatTimestamp from "../utility/FormatTimestamp";
import API from "../get-video-api";

import * as config from "../config";


// Function to fetch video data from the API
// This implementation is a bit lazy, as it parses for the matched
// video id client-side, but ideally the API should find and return
// the correct video given an id.

function NotFoundError() {
  return (
    <>
      <h1 className={styles.h1}>Error: Video not found</h1>
    </>
  );
}

function Video() {
  let { id } = useParams();
  const history = useHistory();

  const [apiResponse, setApiResponse] = useState({});
  const [apiFetched, setApiFetched] = useState(false);
  const [apiError, setApiError] = useState();

  const fetchAPI = () => {
    if (config.USE_MOCK_DATA && config.USE_MOCK_DATA === true){
      const API_RETURN = API.vods.find((vod) => vod.id === id);
      setApiResponse(API_RETURN);
      setApiFetched(true);
      setApiError(null);
    } else {
      const getVideoUrl = `${config.API_URL}/video/${id}`;
      fetch(getVideoUrl)
        .then(response => response.json())
        .then((res) => {
          if (res === null) throw new Error('Video not found');
          setApiResponse(res);
          setApiFetched(true);
          setApiError(null);
        })
        .catch((error) => {
          setApiFetched(true);
          setApiError(error);
        });
    }
  }

  useEffect(() => {
    // Set mounted to true so that we know when first mount has happened
    let mounted = true;

    if (mounted && !apiFetched) {
      fetchAPI()
    }

    // Set mounted to false when the component is unmounted
    return () => { mounted = false };
  }, []);

  const handleOnPlay = () => {
    // update number of views
    const putVideoUrl = `${config.API_URL}/video/${apiResponse.id}`;
    const currentViews = parseInt(apiResponse.views, 10);

    fetch(putVideoUrl, {
      method: 'PUT',
      body: JSON.stringify({
        title: apiResponse.title,
        subtitle: apiResponse.subtitle,
        viewers: currentViews + 1
      })
    })
    .then(response => response.json())
    .catch((error) => {
      console.error(error);
    });
  }

  const handleDelete = async () => {
    const confirmation = window.confirm("Do you really want to delete this video?");
    if (!confirmation) return;

    const deleteVideoUrl = `${config.API_URL}/video/${apiResponse.id}`;

    try {
      const response = await fetch(deleteVideoUrl, {
        method: 'DELETE',
        body: JSON.stringify()
      });
      history.push('/');
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <Navbar />
        {apiFetched && (
          <section className="pd-2 formatted-text">
            {apiError !== null ? 
              (<NotFoundError />) : 
              (<>
                <VideoPlayer
                  videoStream={apiResponse.playbackUrl}
                  controls={true}
                  muted={false}
                  onPlay={handleOnPlay}
                />
                  <div className="fl pd-t-2">
                    <div className="fl fl-col fl-j-start fl-grow-1">
                      <h1 className={styles.h1}>{apiResponse.title}</h1>
                      <p className="color-alt">{apiResponse.subtitle}</p>
                    </div>
                    <div>
                      <button onClick={handleDelete}>Delete</button>
                    </div>
                  </div>
                { apiResponse.views ? (
                  <div className="pd-t-2">
                    <p className="color-hint">{`${apiResponse.views} views • ${FormatTimestamp(apiResponse.length)}`}</p>
                  </div>
                ): (
                  <>
                  </>
                )}
        
              </>)
            }
          </section>
        )}
    </>
  );
}

export default Video;
