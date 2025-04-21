import styles from "./styles.module.css"

export default function About() {
    return (
        <section className={styles.about}>
            <p>Through movement, the participants of The Eternal Dance become catalysts for change, leaving behind audible and visual traces. Every action, every gesture - whether bold or subtle - shapes a personal story. Above all, The Eternal Dance offers an invitation to explore oneself and experience how even the smallest actions shape change.</p>
            <div className={styles.wheretosee}>
                <h2>Where and when?</h2>
                <span>Find us at <b>Creativity Rules Festival</b></span><br></br>
                <span>Alte Saline, Hallein</span><br></br>
                <span>28.05.2025 - 31.05.2025</span>
            </div>
        </section>
    )
}