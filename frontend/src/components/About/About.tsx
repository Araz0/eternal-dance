import Paragraph from "../Word"
import styles from "./styles.module.css"

export default function About() {
    return (
        <section className={styles.about}>
            <Paragraph paragraph="Through movement, participants of The Eternal Dance become catalysts for change, leaving behind audible and visual traces. Every action, every gesture - whether bold or subtle - shapes a personal story. Above all, The Eternal Dance offers an invitation to explore oneself and experience how even the smallest actions shape change." />
        </section>
    )
}