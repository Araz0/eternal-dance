import { memo, useEffect, useRef } from "react";
import p5 from "p5";
import styles from "./styles.module.css";

const PaintingCanvasRaw = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sketchRef = useRef<p5 | null>(null);

  useEffect(() => {
    if (sketchRef.current) {
      sketchRef.current.remove();
    }

    if (!containerRef.current) return;

    const sketch = new p5((p: p5) => {
      let brushSize = 20;
      let hue = 0;

      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight * 1.0);
        canvas.parent(containerRef.current!);
        p.colorMode(p.HSL, 360, 100, 100, 100);
        p.background(0, 0, 0);
      };

      p.draw = () => {
        hue = (hue + 0.5) % 360;
        const brushColor = p.color(hue, 80, 60, 50);

        if (p.mouseIsPressed) {
          for (let i = 0; i < 5; i++) {
            const offsetX = p.random(-brushSize, brushSize);
            const offsetY = p.random(-brushSize, brushSize);
            const weight = p.random(5, brushSize);
            p.stroke(brushColor);
            p.strokeWeight(weight);
            p.line(
              p.mouseX + offsetX,
              p.mouseY + offsetY,
              p.pmouseX + offsetX,
              p.pmouseY + offsetY
            );
          }
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight * 1);
      };
    }, containerRef.current);

    sketchRef.current = sketch;

    // Cleanup function to remove sketch when component unmounts
    return () => {
      if (sketchRef.current) {
        sketchRef.current.remove();
      }
    };
  }, []);

  return (
    <>
      <div style={{ position: "relative", width: "100%", height: "100vh" }}>
        <div ref={containerRef} className={styles.canvasContainer} />
        <div className={styles.overlay} />
        <p className={styles.logline}>An audiovisual installation where movement and emotion intertwine in an eternal dance of transformation.</p>
      </div>
    </>
  );
};

export const PaintingCanvas = memo(PaintingCanvasRaw);
