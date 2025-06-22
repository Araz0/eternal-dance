import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import styles from "./styles.module.css";
import { teamMembers } from "../../lib/data/teamMembers";

export type TeamMember = {
  id: number;
  name: string;
  description: string;
  link: string;
  roles: string[];
  imageUrl: string;
};

const FullScreenScrollReveal: React.FC = () => {
  const { scrollYProgress } = useScroll();

    const [isMobile, setIsMobile] = useState(false);
  
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };
  
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
  

  const scaleDuration = 0.04;
  const textOpacityDuration = 0.04;
  const pauseDuration = 0.06;
  const totalPhaseDuration =
    scaleDuration + textOpacityDuration + pauseDuration; // 0.14

  const rectangles = teamMembers.map((data, index) => {
    let scale, textOpacity;

    if (index === 0) {
      scale = useTransform(scrollYProgress, [-scaleDuration, 0], [0, 1]);
      textOpacity = useTransform(
        scrollYProgress,
        [-textOpacityDuration, 0],
        [0, 1]
      );
    } else {
      const currentItemAnimationStart = index * totalPhaseDuration;

      scale = useTransform(
        scrollYProgress,
        [currentItemAnimationStart, currentItemAnimationStart + scaleDuration],
        [0, 1]
      );
      textOpacity = useTransform(
        scrollYProgress,
        [
          currentItemAnimationStart + scaleDuration,
          currentItemAnimationStart + scaleDuration + textOpacityDuration,
        ],
        [0, 1]
      );
    }

    return {
      ...data,
      scale,
      textOpacity,
      className: styles.scalingRectangle,
      textColor: "white",
    };
  });


  return (
    <div className={styles.scrollRevealContainer}>
      <div className={styles.scrollContent}>
        {rectangles.map((rect) => (
          <div key={rect.id} className={styles.rectangleContainer}>
            <motion.div
              className={rect.className}
              style={{ scaleX: rect.scale, scaleY: rect.scale }}
            ></motion.div>

            <motion.div
              className={styles.imageContainer}
              style={{
                scaleX: rect.scale,
                scaleY: rect.scale,
                opacity: rect.scale,
              }}
            >
              <img
                src={rect.imageUrl}
                alt={`${rect.name}'s portrait`}
                className={styles.rectangleImage}
              />
            </motion.div>

            <motion.div
              className={styles.name}
              style={{
                opacity: rect.textOpacity,
                position: "fixed",
                top: "6rem",
                left: "5%",
                zIndex: 1000,
                textShadow: '1px 1px 10px black',
              }}
            >
              {rect.name}
            </motion.div>

            <motion.div
              className={styles.description}
              style={{
                opacity: rect.textOpacity,
                position: "fixed",
                bottom: "2rem",
                left: "5%",
                zIndex: 1000,
              }}
            >
              {rect.description}
            </motion.div>

            <motion.a
              className={styles.link}
              style={{
                opacity: rect.textOpacity,
                position: "fixed",
                bottom: isMobile ? "6rem" : "2rem",
                right: "5%",
                zIndex: 1000,
              }}
              href={rect.link}
            >
              Linkedin
            </motion.a>

            <motion.div
              className={styles.rolesContainer}
              style={{
                opacity: rect.textOpacity,
                position: "fixed",
                top: isMobile ? undefined : "6rem",
                bottom: isMobile ? "8rem" : undefined,
                textShadow: '1px 1px 10px black',
                right: "5%",
                zIndex: 1000,
              }}
            >
              {rect.roles.map((role, roleIndex) => (
                <span key={roleIndex} className={styles.role}>
                  {role}
                </span>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FullScreenScrollReveal;
