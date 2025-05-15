import styles from "./styles.module.css";
import { useState, useRef } from "react";
import { teamMembers } from "../../lib/data/teamMembers";

const TeamComponent = () => {
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const previewRef = useRef(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <section className={styles.team} onMouseMove={handleMouseMove}>
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

export default TeamComponent;