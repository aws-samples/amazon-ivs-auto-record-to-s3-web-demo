import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import Navbar from "../components/Navbar/Navbar";
import VideoPlayer from "../components/VideoPlayer/VideoPlayer";
import SaveFooter from "../components/SaveFooter/SaveFooter";
import AlertPopover from "../components/AlertPopover/AlertPopover";
import styles from "./AdminLive.module.css";

import LiveAPI from "../live-stream-api";
import StreamDetailsAPI from "../stream-details-api";

import * as config from "../config";

function resetKeyAPI() {
  // For use with mock data
  return StreamDetailsAPI.data.key;
}

function putLiveAPI(payload) {
  // For use with mock data
  return false;
}

function fetchLiveAPI() {
  // For use with mock data
  return LiveAPI.data;
}

function fetchDetailsAPI() {
  // For use with mock data
  return StreamDetailsAPI.data;
}

function AdminLive() {

  let { id } = useParams();

  const [streamTitle, setStreamTitle] = useState("");
  const [streamSubtitle, setStreamSubtitle] = useState("");
  const [formChanged, setFormChanged] = useState(false);
  const [copyConfirm, setCopyConfirm] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertError, setAlertError] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [alertTimeout, setAlertTimeout] = useState(null);

  const [ingestServer, setIngestServer] = useState("");
  const [streamKey, setStreamKey] = useState("");

  const [liveResponse, setLiveResponse] = useState(false);
  const [detailsResponse, setDetailsResponse] = useState(false);

  useEffect(() => {
    // Set mounted to true so that we know when first mount has happened
    let mounted = true;

    if (config.USE_MOCK_DATA && config.USE_MOCK_DATA === true) {
       // Call mock API and set the matched value if we're mounted
      const LIVE_API_RETURN = fetchLiveAPI();
      if (mounted && !liveResponse) {
        setLiveResponse(LIVE_API_RETURN);
        setStreamTitle(LIVE_API_RETURN.title);
        setStreamSubtitle(LIVE_API_RETURN.subtitle);
      }

      const DETAILS_API_RETURN = fetchDetailsAPI();
      if (mounted && !detailsResponse) {
        setDetailsResponse(DETAILS_API_RETURN);
        setIngestServer(DETAILS_API_RETURN.ingest);
        setStreamKey(DETAILS_API_RETURN.key);
      }
    } else {
      const getLiveChannelUrl = `${config.API_URL}/live?channelName=${id}`;
      fetch(getLiveChannelUrl)
      .then(response => response.json())
      .then((res) => {
        if (mounted && !liveResponse) {
          setLiveResponse(res.data);
          setStreamTitle(res.data.title);
          setStreamSubtitle(res.data.subtitle);
        }
      })
      .catch((error) => {
        console.error(error);
      });

      // Get Live Details
      const getLiveDetailsUrl = `${config.API_URL}/live-details?channelName=${id}`;
      fetch(getLiveDetailsUrl)
      .then(response => response.json())
      .then((liveDetailsResponse) => {
        if (mounted && !detailsResponse) {
          setDetailsResponse(liveDetailsResponse.data);
          setIngestServer(`rtmps://${liveDetailsResponse.data.ingest}/443/app/`);
          setStreamKey(liveDetailsResponse.data.key);
        }

      })
      .catch((error) => {
        console.error(error);
      });

    }

    // Set mounted to false when the component is unmounted
    return () => (mounted = false);
  }, [id, liveResponse, detailsResponse]);

  const handleOnChange = (e) => {
    setFormChanged(true);
    switch (e.currentTarget.id) {
      case "stream-title":
        setStreamTitle(e.currentTarget.value);
        break;
      case "stream-subtitle":
        setStreamSubtitle(e.currentTarget.value);
        break;
      default:
        break;
    }
  };

  const handleSave = () => {
    const payload = {
      channelName: id,
      title: streamTitle,
      subtitle: streamSubtitle,
    };
    if (config.USE_MOCK_DATA && config.USE_MOCK_DATA === true){
      // Update Mock API
      putLiveAPI(payload);
    } else {
      // Update API
      const apiUrl = `${config.API_URL}/live`;
      fetch(apiUrl, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      .then(response => response.json())
      .then((res) => {
         setStreamKey(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
    }

    // Hide save
    setFormChanged(false);
  };

  const handlePreviewClick = () => {
    setShowPreview(!showPreview);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSave();
    }
  };

  const flashAlertPopover = (message) => {
    if (alertTimeout) {
      clearTimeout(alertTimeout);
    }

    const alert_duration = 5;
    setCopyConfirm(true);

    const timer = setTimeout(() => {
      setCopyConfirm(false);
    }, alert_duration * 1000);
    setAlertTimeout(timer);
  }

  const handleIngestCopy = () => {
    navigator.clipboard.writeText(ingestServer);
    setAlertMessage("Copied ingest server");
    setAlertError(false);
    flashAlertPopover();
  }

  const handleStreamKeyCopy = () => {
    navigator.clipboard.writeText(streamKey);
    setAlertMessage("Copied stream key");
    setAlertError(false);
    flashAlertPopover();
  }

  const handleKeyReset = () => {

    if (config.USE_MOCK_DATA && config.USE_MOCK_DATA === true){
      resetKeyAPI();
    } else {
      const resetStreamKeyUrl = `${config.API_URL}/reset-key`;
      fetch(resetStreamKeyUrl, {
        method: 'PUT',
        body: JSON.stringify({
          channelName: id
        })
      })
      .then(response => response.json())
      .then((res) => {
        setStreamKey(res.data.key);
        setAlertMessage("Stream key reset");
        setAlertError(false);
        flashAlertPopover();
      })
      .catch((error) => {
        setAlertMessage("Failed to reset stream key");
        setAlertError(true);
        flashAlertPopover();
        console.error(error);
      });
    }
  };

  return (
    <>
      <Navbar />
      <SaveFooter visible={formChanged} onSave={handleSave} />
      <AlertPopover visible={copyConfirm} text={alertMessage} error={alertError}/>
      <section className="pd-t-3 pd-b-3 pd-l-2 pd-r-2">
        <p><Link to="/admin">Admin panel</Link></p>
        <h1 className="mg-b-3">Edit live stream</h1>
        <fieldset>
          <label htmlFor="stream-title">Stream title</label>
          <input className={styles.field}
            type="text"
            name="stream-title"
            id="stream-title"
            placeholder="Title"
            onChange={handleOnChange}
            onKeyDown={handleKeyPress}
            value={streamTitle}
          ></input>

          <label htmlFor="stream-subtitle">Stream subtitle</label>
          <input className={styles.field}
            type="text"
            name="stream-subtitle"
            id="stream-subtitle"
            placeholder="Subtitle"
            onChange={handleOnChange}
            onKeyDown={handleKeyPress}
            value={streamSubtitle}
          ></input>
        </fieldset>
      </section>
      <section className="pd-t-3 pd-b-5 pd-l-2 pd-r-2">
        <fieldset>
          <label htmlFor="stream-ingest">Ingest server</label>
          <div className={styles.inlineButtons}>
            <input
              type="text"
              name="stream-ingest"
              id="stream-ingest"
              placeholder="Ingest server"
              value={ingestServer}
              readOnly
            ></input>
            <button
              className="btn btn--primary"
              onClick={handleIngestCopy}
            >
              Copy
            </button>
          </div>

          <label htmlFor="stream-key">Stream key</label>
          <div className={styles.inlineButtons}>
            <input
              type="password"
              name="stream-key"
              id="stream-key"
              placeholder="Stream key"
              value={streamKey}
              readOnly
            ></input>
            <button className="btn btn--secondary" onClick={handleKeyReset}>
              Reset
            </button>
            <button
              className="btn btn--primary"
              onClick={handleStreamKeyCopy}
            >
              Copy
            </button>
          </div>
        </fieldset>
      </section>
      <section className="pd-2">
        <p className={styles.label}>Stream status</p>
        <p>{`${liveResponse.isLive === "Yes" ? "Live" : "Offline" }`}</p>
      </section>
      <section className="pd-2">
        <button
          onClick={handlePreviewClick}
          className="btn btn--secondary full-width"
        >
          {showPreview ? "Hide video preview" : "Show video preview"}
        </button>
        {showPreview ? (
          <div className="pd-t-2">
            <VideoPlayer
              controls={true}
              muted={true}
              videoStream={liveResponse.playbackUrl}
            />
            <div className="mg-t-2">
              <h3 className={styles.h1}>{streamTitle}</h3>
            </div>
            <p className="mg-t-1 color-alt">{streamSubtitle}</p>
          </div>
        ) : (
          <></>
        )}
      </section>
      <div style={{ height: "12rem" }}></div>
    </>
  );
}

export default AdminLive;
