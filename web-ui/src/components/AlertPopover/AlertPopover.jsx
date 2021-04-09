import PropTypes from "prop-types";
import styles from "./AlertPopover.module.css"

function AlertPopover(props) {
  const icon = props.error ?
    (<div class="icon icon--inverted icon--24 notice__icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"></path><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg></div>)
    :
    (<div className="icon icon--24 notice__icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div>)
  return (
    <div className={`pos-absolute full-width ${props.visible ? styles.showPopover : styles.hidePopover}`}>
      <div className={`notice ${props.error ? "notice--error" : "notice--success"}`}>
        <div className="notice__content">
          {icon}
          <p>{props.text}</p>
        </div>
      </div>
    </div>
  );
}

AlertPopover.propTypes = {
  visible: PropTypes.bool,
  text: PropTypes.string,
  error: PropTypes.bool
};

export default AlertPopover;
