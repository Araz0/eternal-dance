import styles from "./styles.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <span>The Eternal Dance</span>
            <ul>
                <li><a href="#">Instagram</a></li>
                <li><a href="#">Imprint</a></li>
            </ul>
        </footer>
    )
}