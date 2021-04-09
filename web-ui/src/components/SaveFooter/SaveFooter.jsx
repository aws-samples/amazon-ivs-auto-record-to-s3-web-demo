import PropTypes from "prop-types";
import styles from "./SaveFooter.module.css";

function SaveFooter(props) {
  return (
    <div
      className={
        props.visible ? styles.wrapper : `${styles.wrapper} ${styles.hidden}`
      }
    >
      <div className={styles.container}>
        <span className="color-inverted">You have unsaved changes</span>
        <button className="btn btn--primary btn--pad" onClick={props.onSave}>
          Save
        </button>
      </div>
    </div>
  );
}

SaveFooter.propTypes = {
  visible: PropTypes.bool,
  onSave: PropTypes.func,
};

export default SaveFooter;
