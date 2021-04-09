import Navbar from "../components/Navbar/Navbar";
import VideoPlayer from "../components/VideoPlayer/VideoPlayer";
import VodCardController from "../components/VodCardController";
import LiveCard from "../components/LiveCard/LiveCard";
import styles from "./AdminHome.module.css";

import LiveAPI from "../live-stream-api";

import * as config from "../config";
import { useEffect, useState } from "react";

function AdminHome() {
  const [response, setResponse] = useState({});
  const [timerID, setTimerID] = useState(false);

  const fetchLiveAPI = () => {
    if (config.USE_MOCK_DATA && config.USE_MOCK_DATA === true){
      const LIVE_API = LiveAPI.data;
      setResponse(LIVE_API);
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
  };

  useEffect(() => {
    // Set mounted to true so that we know when first mount has happened
    let mounted = true;

    if (!timerID && mounted) {
      fetchLiveAPI();
      const timer = setInterval(() => {
        fetchLiveAPI();
      }, config.POLL_DELAY_MS)
      setTimerID(timer);
    }

    // Set mounted to false & clear the interval when the component is unmounted
    return () => {
      mounted = false;
      clearInterval(timerID);
    }
  }, [timerID])


  const hintText = (response.isLive && response.isLive === "Yes") ? `LIVE • ${response.viewers}` : "Offline";
  return (
    <>
      <Navbar />
      <section className="pd-t-3 pd-b-3 pd-l-2 pd-r-2">
        <h1 className="mg-b-2">Admin panel</h1>
        <h2 className={styles.h2}>Live stream</h2>
        <LiveCard
          title={response.title}
          subtitle={response.subtitle}
          hint={hintText}
          thumbnailUrl={response.thumbnail}
          linkType="admin"
          id={response.id}

        >
          <VideoPlayer
            muted={true}
            controls={false}
            videoStream={response.playbackUrl}
          />
        </LiveCard>
      </section>
      <section className="pd-2 formatted-text">
        <h2 className={styles.h2}>Recorded streams</h2>
        <VodCardController linkType="admin" />
      </section>
    </>
  );
}

export default AdminHome;
