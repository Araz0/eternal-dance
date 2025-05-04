// InteractiveImageGallery.tsx
import React, { useEffect, useRef } from 'react';
import styles from './styles.module.css';

interface ImageData {
  src: string;
  alt: string;
  baseOffset: { x: number; y: number };
  width: number;
  height: number;
}

interface MouseFollowImageGalleryProps {
  maxMovementRadius?: number;
  movementIntensity?: number;
  lerpFactor?: number; // how fast images move when following cursor
}

const MouseFollowImageGallery: React.FC<MouseFollowImageGalleryProps> = ({
  maxMovementRadius = 40,
  movementIntensity = 0.2,
  lerpFactor = 0.1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerCenter = useRef({ x: 0, y: 0 });
  const mousePosition = useRef({ x: 0, y: 0 });
  const currentMovement = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number>(0);

  const images: ImageData[] = [
    { src: "./images/image1.jpg", alt: "Image 1", baseOffset: { x: -500, y: -450 }, width: 200, height: 300 },
    { src: "./images/image2.jpg", alt: "Image 2", baseOffset: { x: 470, y: 45 }, width: 250, height: 200 },
    { src: "./images/image3.jpg", alt: "Image 3", baseOffset: { x: -310, y: 150 }, width: 180, height: 270 },
    { src: "./images/image4.jpg", alt: "Image 4", baseOffset: { x: 360, y: -350 }, width: 220, height: 280 },
    { src: "./images/image5.jpg", alt: "Image 5", baseOffset: { x: -700, y: -30 }, width: 240, height: 260 },
    { src: "./images/image6.jpg", alt: "Image 6", baseOffset: { x: -50, y: -400 }, width: 200, height: 250 },
    { src: "./images/image7.jpg", alt: "Image 7", baseOffset: { x: 70, y: 180 }, width: 230, height: 240 },
  ];
  

  const imageRefs = useRef<HTMLDivElement[]>([]);

  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  useEffect(() => {
    const updateCenter = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        containerCenter.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }
    };

    updateCenter();
    window.addEventListener('resize', updateCenter);

    return () => window.removeEventListener('resize', updateCenter);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current.x = e.clientX;
      mousePosition.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      const targetDx = mousePosition.current.x - containerCenter.current.x;
      const targetDy = mousePosition.current.y - containerCenter.current.y;

      currentMovement.current.x = lerp(currentMovement.current.x, targetDx, lerpFactor);
      currentMovement.current.y = lerp(currentMovement.current.y, targetDy, lerpFactor);

      const moveDistance = Math.sqrt(
        currentMovement.current.x ** 2 + currentMovement.current.y ** 2
      );
      const intensity = moveDistance > 0
        ? Math.min(moveDistance, maxMovementRadius) / moveDistance
        : 0;

      images.forEach((img, index) => {
        const moveX = currentMovement.current.x * movementIntensity * intensity;
        const moveY = currentMovement.current.y * movementIntensity * intensity;

        const finalX = img.baseOffset.x + moveX;
        const finalY = img.baseOffset.y + moveY;

        const imgDiv = imageRefs.current[index];
        if (imgDiv) {
          imgDiv.style.transform = `translate(${finalX}px, ${finalY}px)`;
        }
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [images, maxMovementRadius, movementIntensity, lerpFactor]);

  return (
    <div
  ref={containerRef}
  className={styles.container}
>
  <div className={styles.imagesWrapper}>
    
    <div className={styles.centerText}>
      <h2>Where and when?</h2>
      <span>Find us at <b>Creativity Rules Festival</b></span><br></br>
      <span>Alte Saline, Hallein</span><br></br>
      <span>28.05.2025 - 31.05.2025</span>
    </div>

    {images.map((img, index) => (
      <div
        key={index}
        ref={(el) => { if (el) imageRefs.current[index] = el; }}
        className={styles.imageWrapper}
        style={{
          position: 'absolute',
          transform: `translate(${img.baseOffset.x}px, ${img.baseOffset.y}px)`,
          willChange: 'transform',
        }}
      >
        <img
          src={img.src}
          alt={img.alt}
          style={{
            width: `${img.width}px`,
            height: `${img.height}px`,
            objectFit: 'cover',
          }}
        />
      </div>
    ))}
  </div>
</div>
  );
};

export default MouseFollowImageGallery;
