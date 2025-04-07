import styles from "./styles.module.css"

export default function Header() {
    return (
        <header className={styles.header}>
            <h1>The Eternal Dance</h1>
            <nav>
                <ul>
                    <li><a>About</a></li>
                    <li><a>Team</a></li>
                    <li><a>Gallery</a></li>
                </ul>
            </nav>
        </header>
    )
}