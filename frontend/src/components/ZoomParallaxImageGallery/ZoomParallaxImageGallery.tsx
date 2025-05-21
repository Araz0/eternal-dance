import styles from "./styles.module.css";
import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";
import Image from "../Image/Image";

export default function ZoomParallaxImageGallery() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const scale2 = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const scale3 = useTransform(scrollYProgress, [0, 1], [1, 6]);
  const scale4 = useTransform(scrollYProgress, [0, 1], [1, 8]);
  const scale5 = useTransform(scrollYProgress, [0, 1], [1, 9]);

  const pictures = [
    {
      src: "./images/landing-page/image4.jpg",
      scale: scale,
      alt: "Image 1 description"
    },
    {
      src: "./images/landing-page/image6.jpg",
      scale: scale2,
      alt: "Image 2 description"
    },

    {
      src: "./images/landing-page/image5.jpg",
      scale: scale3,
      alt: "Image 3 description"
    },

    {
      src: "./images/landing-page/image2.jpg",
      scale: scale4,
      alt: "Image 4 description"
    },
    {
      src: "./images/landing-page/image7.jpg",
      scale: scale5,
      alt: "Image 5 description"
    }
  ];

  return (
    <div ref={container} className={styles.container}>
      <div className={styles.sticky}>
        {pictures.map(({ src, scale }, index) => {
          return (
            <motion.div key={index} style={{ scale }} className={styles.el}>
              <div className={styles.imageContainer}>
                <Image
                  src={src}
                  alt="Alternative Text"
                  width="100%"
                  height="100%"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
