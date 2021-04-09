import Navbar from "../components/Navbar/Navbar";
import VideoPlayer from "../components/VideoPlayer/VideoPlayer";
import VodCardController from "../components/VodCardController";
import styles from "./Home.module.css";

import * as config from "../config";

import LiveAPI from "../live-stream-api";

import React, { useEffect, useState } from "react";

function LiveComponent(props) {
  return (
    <>
      <VideoPlayer
        controls={true}
        muted={true}
        videoStream={props.playbackUrl}
      />
      { props.isLive === "Yes" ?  (
        <div className="pd-t-2">
          <h1 className={styles.h1}>{props.title}</h1>
          <p className="mg-t-1 color-alt">
            {props.subtitle} • {`${props.viewers} viewers`}
          </p>
        </div>
      ) : (
        <>
          <div className="mg-t-2">
            <h1 className={styles.offline}>Channel Offline</h1>
          </div>
        </>
      )}
    </>
  );
}

function Home() {
  const [response, setResponse] = useState(false);
  const [timerID, setTimerID] = useState(false);

  const fetchAPI = () => {
    if (config.USE_MOCK_DATA === true){
      const API_RETURN = LiveAPI.data;
      setResponse(API_RETURN);
    } else {
      // Call API and set the matched value if we're mounted
      const getLiveChannelUrl = `${config.API_URL}/live`;
      fetch(getLiveChannelUrl)
        .then(response => response.json())
        .then((res) => {
          setResponse(res.data);
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

  return (
    <>
      <Navbar />
      <section className="pd-2 formatted-text">
        <LiveComponent
          playbackUrl={response.playbackUrl}
          title={response.title}
          subtitle={response.subtitle}
          viewers={response.viewers}
          isLive={response.isLive}
        />
      </section>
      <section className="mg-t-2 pd-2 formatted-text">
        <h2 className={styles.h2}>Recorded streams</h2>
        <VodCardController linkType="home" />
      </section>
    </>
  );
}

export default Home;
