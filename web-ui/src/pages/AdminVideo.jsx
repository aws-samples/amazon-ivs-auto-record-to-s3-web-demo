import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { isEmpty } from "lodash"

import Navbar from "../components/Navbar/Navbar";
import VideoPlayer from "../components/VideoPlayer/VideoPlayer";
import SaveFooter from "../components/SaveFooter/SaveFooter";
import styles from "./AdminVideo.module.css";

import API from "../get-video-api";

import * as config from "../config";

function putAPI(payload) {
  console.log("SAMPLE: PUT changes to api...");
  console.log(payload);
  console.log("=============================");
}

function NotFoundError() {
  return (
    <>
      <h1 className={styles.h1}>Error: Video not found</h1>
    </>
  );
}

function ThumbnailRadio(props) {
  return (
    <>
      <input
        className={styles.thumbnailRadio}
        type="radio"
        id={props.id}
        name={props.name}
        value={props.value}
        checked={props.checked}
        onChange={props.onChange}
      />
      <label htmlFor={props.id}>
        <img
          alt={`${props.name}`}
          className={styles.thumbnailRadioImage}
          src={props.thumbnail}
        />
      </label>
    </>
  );
}

function AdminVideo() {

  let { id } = useParams();

  const [videoTitle, setVideoTitle] = useState("");
  const [videoSubtitle, setVideoSubtitle] = useState("");
  const [formChanged, setFormChanged] = useState(false);
  const [selectedThumbnail, setSelectedThumbnail] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const [response, setResponse] = useState(false);
  const [apiFetched, setApiFetched] = useState(false);

  const fetchAPI = () => {
    // Call API and set the matched value if we're mounted
    if (config.USE_MOCK_DATA && config.USE_MOCK_DATA === true){
      const API_RETURN = API.vods.find((vod) => vod.id === id);;
      setResponse(API_RETURN);
      setVideoTitle(API_RETURN.title);
      setVideoSubtitle(API_RETURN.subtitle);
      setSelectedThumbnail(API_RETURN.thumbnail);
      setApiFetched(true);
    } else {
      const getVideoUrl = `${config.API_URL}/video/${id}`;
      fetch(getVideoUrl)
        .then(function (response) {
          if (response.ok) {
            setApiFetched(true);
            return response.json()
          }
          else {
            return null;
          }
        })
        .then((res) => {
          if (!response && res) {
            setResponse(res);
            setVideoTitle(res.title);
            setVideoSubtitle(res.subtitle);
            setSelectedThumbnail(res.thumbnail);
            setApiFetched(true);
          }
          else {
            setResponse(null)
          }
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
  }, []);

  const handleOnChange = (e) => {
    setFormChanged(true);
    switch (e.currentTarget.id) {
      case "title":
        setVideoTitle(e.currentTarget.value);
        break;
      case "subtitle":
        setVideoSubtitle(e.currentTarget.value);
        break;
      default:
        break;
    }
  };

  const handleThumbnailChange = (e) => {
    setFormChanged(true);
    setSelectedThumbnail(`${e.currentTarget.value}`);
  };

  const handleSave = () => {
    const payload = {
      title: videoTitle,
      subtitle: videoSubtitle,
      thumbnail: selectedThumbnail,
    };
    // Update API

    if (config.USE_MOCK_DATA && config.USE_MOCK_DATA === true) {
      putAPI(payload);
    } else {
      const putVideoUrl = `${config.API_URL}/video/${id}`;
      fetch(putVideoUrl, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      .then(response => response.json())
      .then((res) => {
        setVideoTitle(res.title);
        setVideoSubtitle(res.subtitle);
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

  if (response === null) return <NotFoundError/>
  if (isEmpty(response)) return (
    <section className="full-width screen-height fl fl-j-center fl-a-center">
      <h1> Loading ...</h1>
    </section>
  )

  return (
    <>
      <Navbar />
      {response ? (
        <>
          <SaveFooter visible={formChanged} onSave={handleSave} />
          <section className="pd-t-3 pd-b-3 pd-l-2 pd-r-2">
            <p><Link to="/admin">Admin panel</Link></p>
            <h1 className="mg-b-3">Edit video details</h1>
            <fieldset >
              <label htmlFor="title">Video title</label>
              <input className={styles.field}
                  type="text"
                  name="title"
                  id="title"
                  placeholder="Title"
                  onChange={handleOnChange}
                  onKeyPress={handleKeyPress}
                  value={videoTitle}
                ></input>


              <label htmlFor="subtitle">Video subtitle</label>
              <input className={styles.field}
                type="text"
                name="subtitle"
                id="subtitle"
                placeholder="Subtitle"
                value={videoSubtitle}
                onChange={handleOnChange}
                  onKeyPress={handleKeyPress}
              ></input>
            </fieldset>
          </section>
          <section className="pd-2">
            <label>Thumbnail</label>
            <fieldset className={styles.thumbnailSelectors}>
              <ThumbnailRadio
                id={response.thumbnails[0]}
                name={"thumbnail"}
                value={response.thumbnails[0]}
                checked={selectedThumbnail === `${response.thumbnails[0]}`}
                onChange={handleThumbnailChange}
                thumbnail={response.thumbnails[0]}
              />
              <ThumbnailRadio
                id={response.thumbnails[1]}
                name={"thumbnail"}
                value={response.thumbnails[1]}
                checked={selectedThumbnail === `${response.thumbnails[1]}`}
                onChange={handleThumbnailChange}
                thumbnail={response.thumbnails[1]}
              />
              <ThumbnailRadio
                id={response.thumbnails[2]}
                name={"thumbnail"}
                value={response.thumbnails[2]}
                checked={selectedThumbnail === `${response.thumbnails[2]}`}
                onChange={handleThumbnailChange}
                thumbnail={response.thumbnails[2]}
              />
            </fieldset>
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
                  videoStream={response.playbackUrl}
                />
                <div className="mg-t-2">
                  <h3>{response.videoTitle}</h3>
                </div>
                <p className="mg-t-1 color-alt">{response.videoSubtitle}</p>
              </div>
            ) : (
              <></>
            )}
          </section>
          <div style={{ height: "12rem" }}></div>
        </>
      ) : (
        <>
        </>
      )}

    </>
  );
}

export default AdminVideo;
