import styles from "./styles.module.css";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <video
        className={styles.backgroundVideo}
        src="./images/footer-background.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className={styles.overlay}></div>
      <div className={styles.content}>
        <span>The Eternal Dance</span>
        <div>
          <ul>
            <li>
              <a href="#">Instagram</a>
            </li>
            <li>
              <Link to='/imprint'>Imprint</Link>
            </li>
          </ul>
          <span className={styles.credit}>© 2025 The Eternal Dance</span>
        </div>
      </div>
    </footer>
  );
}
