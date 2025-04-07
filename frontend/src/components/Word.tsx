import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import styles from './style.module.css';

interface ParagraphProps {
    paragraph: string;
}

export default function Paragraph({paragraph} : ParagraphProps) {

  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.9", "start 0.25"]
  })

  const words = paragraph.split(" ")
  return (
    <p 
      ref={container}         
      className={styles.paragraph}
    >
    {
      words.map( (word, i) => {
        const start = i / words.length
        const end = start + (1 / words.length)
        return <Word key={i} progress={scrollYProgress} range={[start, end]}>{word}</Word>
      })
    }
    </p>
  )
}

interface WordProps {
    children: any,
    progress: any,
    range: any
}


const Word = ({children, progress, range} : WordProps) => {
  const opacity = useTransform(progress, range, [0.2, 1])
  return <span className={styles.word}>
    <motion.span style={{opacity: opacity, marginRight: "0.25em"}} className={styles.shadow}>{children}</motion.span>  </span>
}