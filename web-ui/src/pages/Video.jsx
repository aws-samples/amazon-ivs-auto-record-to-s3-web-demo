import Navbar from "../components/Navbar/Navbar";
import VideoPlayer from "../components/VideoPlayer/VideoPlayer";
import styles from "./Home.module.css";

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

  const [videoViews, setVideoViews] = useState(0);
  const [response, setResponse] = useState({});
  const [apiFetched, setApiFetched] = useState(false);

  const fetchAPI = () => {
    if (config.USE_MOCK_DATA && config.USE_MOCK_DATA === true){
      const API_RETURN = API.vods.find((vod) => vod.id === id);
      setResponse(API_RETURN);
      setVideoViews(API_RETURN.views);
      setApiFetched(true);
    } else {
      const getVideoUrl = `${config.API_URL}/video/${id}`;
      fetch(getVideoUrl)
        .then(response => response.json())
        .then((res) => {
          setResponse(res);
          setVideoViews(res.views)
          setApiFetched(true);
        })
        .catch((error) => {
          console.error(error);
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
  });

  function VideoMatched(props) {
    return (
      <>
        <VideoPlayer
          videoStream={props.playbackUrl}
          controls={true}
          muted={false}
          onPlay={handleOnPlay}
        />
          <div className="pd-t-2">
            <h1 className={styles.h1}>{props.title}</h1>
            <p className="mg-t-1 color-alt">{props.subtitle}</p>
          </div>
        { props.views ? (
          <div className="pd-t-2">
            <p className="color-hint">{`${props.views} views • ${props.length}`}</p>
          </div>
        ): (
          <>
          </>
        )}

      </>
    );
  }

  const handleOnPlay = () => {
    // update number of views
    const putVideoUrl = `${config.API_URL}/video/${response.id}`;
    const currentViews = parseInt(response.views, 10);

    fetch(putVideoUrl, {
      method: 'PUT',
      body: JSON.stringify({
        title: response.title,
        subtitle: response.subtitle,
        viewers: currentViews + 1
      })
    })
    .then(response => response.json())
    .then((res) => {
      setVideoViews(res.Viewers)
    })
    .catch((error) => {
      console.error(error);
    });
  }

  return (
    <>
      <Navbar />
      <section className="pd-2 formatted-text">
        {response ? (
          <VideoMatched
            title={response.title}
            playbackUrl={response.playbackUrl}
            subtitle={response.subtitle}
            views={videoViews}
            length={response.length}
            onPlay={handleOnPlay}
          />
        ) : (
          <NotFoundError />
        )}
      </section>
    </>
  );
}

export default Video;
