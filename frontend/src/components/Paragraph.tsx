// import { motion, useScroll } from 'framer-motion';
// import { useRef } from 'react';

// import styles from './style.module.css';

// interface ParagraphProps {
//     paragraph: string;
// }

// export default function Paragraph({paragraph} : ParagraphProps) {

//     const container = useRef(null);
//     const { scrollYProgress } = useScroll({
//         target: container,
//         offset: ["start 0.9", "start 0.25"]
//     })

//     return (
//         <motion.p
//             ref={container}
//             className={styles.paragraph}
//             style={{opacity: scrollYProgress}}
//         >
//             {paragraph}
//         </motion.p>
//     )
// }