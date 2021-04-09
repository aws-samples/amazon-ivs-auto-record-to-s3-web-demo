import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";

function Navbar() {
  return (
    <header className={styles.header}>
      <h1>
        <NavLink className={styles.link} to="/">
          Home
        </NavLink>
      </h1>
      <NavLink className={styles.link} activeClassName={styles.adminActive} to="/admin">
        Admin Panel →
      </NavLink>
    </header>
  );
}

export default Navbar;
