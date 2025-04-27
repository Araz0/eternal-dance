import styles from "./styles.module.css";

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
              <a href="#">Imprint</a>
            </li>
          </ul>
          <span className={styles.credit}>© 2025 The Eternal Dance</span>
        </div>
      </div>
    </footer>
  );
}
