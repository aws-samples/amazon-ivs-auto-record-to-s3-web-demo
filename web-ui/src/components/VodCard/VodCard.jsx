import PropTypes from "prop-types";
import styles from "./VodCard.module.css";
import { Link } from "react-router-dom";

function VodCard(props) {
  let prefix = props.linkType === "admin" ? "/admin" : "/video";
  return (
    <Link to={`${prefix}/${props.id}`}>
      <div className={styles.wrapper}>
        <div className={styles.thumbnail}>
          <img
            src={props.thumbnailUrl}
            alt={`Thumbnail for video: ${props.title}`}
          />
        </div>
        <div className={styles.metaWrapper}>
          <span>
            <span className={styles.title}>{props.title}</span>
            <br />
            <span className={styles.subtitle}>{props.subtitle}</span>
          </span>
          <span className={styles.hint}>{props.hint}</span>
        </div>
      </div>
    </Link>
  );
}

VodCard.propTypes = {
  id: PropTypes.string,
  thumbnailUrl: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  hint: PropTypes.string,
  linkType: PropTypes.string,
};

export default VodCard;
