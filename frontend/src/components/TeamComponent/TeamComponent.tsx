import styles from "./styles.module.css";
import { useState, useRef } from "react";

export default function TeamComponent() {
  const teamMembers = [
    {
      name: "Lena Ochmann",
      description: "is a lighting artist in video games and studying Realtime Art & Visual Effects.",
      link: "https://www.linkedin.com/in/lena-ochmann/?originalSubdomain=de",
      image: "./images/team/lena.jpeg"
    },
    {
      name: "Loujain Sami",
      description: "is an interior designer & digital artist and studying Realtime Art & Visual Effects.",
      link: "https://www.linkedin.com/in/loujain-sami-420b4a146/?originalSubdomain=qa",
      image: "./images/team/loujain.jpg"
    },
    {
      name: "Attila Soós",
      description: "is an audio designer and studying MultiMediaArt Audio.",
      link: "https://www.linkedin.com/in/attila-so%C3%B3s-2522491b2/",
      image: "./images/team/attila.jpeg"
    },
    {
      name: "Araz Al Hamdani",
      description: "is a creative technologist and studying MultiMediaTechnology, Web Development.",
      link: "https://www.linkedin.com/in/araz0/",
      image: "./images/team/araz.jpeg"
    },
    {
      name: "Tanja Nicole Gruber",
      description: "is a creative & developer and studying MultiMediaTechnology, Web Development.",
      link: "https://www.linkedin.com/in/tanjanicole/",
      image: "./images/team/tanja.jpeg"
    }
  ];

  const [hoveredMember, setHoveredMember] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const previewRef = useRef(null);

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <section className={styles.team} onMouseMove={handleMouseMove}>
      {/* <h2>Team</h2> */}

      <div 
        ref={previewRef}
        className={`${styles.preview} ${hoveredMember !== null ? styles.visible : ""}`}
        style={{ 
          top: mousePosition.y - 150, 
          left: mousePosition.x + 50, 
          backgroundImage: hoveredMember !== null ? `url(${teamMembers[hoveredMember].image})` : "none" 
        }}
      >
      </div>

      <div className={styles.teamMembers}>
        {teamMembers.map((member, index) => (
          <div 
            key={index} 
            className={styles.member}
            onMouseEnter={() => setHoveredMember(index)}
            onMouseLeave={() => setHoveredMember(null)}
          >
            <p>
              <b><a href={member.link} target="_blank" rel="noopener noreferrer">{member.name}</a></b> {member.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
