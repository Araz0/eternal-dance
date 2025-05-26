import { memo, useEffect, useRef, useState } from "react";
import p5 from "p5";
import styles from "./styles.module.css";
import { Link } from "react-router-dom";

const PaintingCanvasRaw: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sketchRef = useRef<p5 | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    // Only initialize p5.js if not on a mobile device
    const isMobile = window.innerWidth <= 768; // You can adjust this breakpoint
    console.log(window.innerWidth)
    if (isMobile) {
      return;
    }

    if (sketchRef.current) {
      sketchRef.current.remove();
    }

    if (!containerRef.current) return;

    const sketch = new p5((p: p5) => {
      let brushSize: number = 20;
      let hue: number = 0;
      let userCanDraw: boolean = false;
      let demoPts: Array<{
        x: number;
        y: number;
        prevX: number | null;
        prevY: number | null;
      }> = [];
      let demoIndex: number = 0;
      let demoPhase: "waiting" | "drawing" | "fading" | "done" = "waiting";
      let demoOpacity: number = 100;

      const generateDemoPath = (): Array<{
        x: number;
        y: number;
        prevX: number | null;
        prevY: number | null;
      }> => {
        const points: Array<{
          x: number;
          y: number;
          prevX: number | null;
          prevY: number | null;
        }> = [];
        const centerX: number = p.width / 2;
        const centerY: number = p.height / 2;
        const width: number = p.width * 0.6;
        const height: number = p.height * 0.6;

        for (let t = 0; t <= 1; t += 0.01) {
          const angle: number = t * p.TWO_PI * 1.5;
          const x: number =
            centerX + width * t * 0.8 * Math.cos(angle) - width * 0.3;
          const y: number =
            centerY +
            height * 0.3 * Math.sin(angle * 3) +
            height * (0.4 - t * 0.8);
          points.push({ x, y, prevX: null, prevY: null });

          if (points.length > 1) {
            points[points.length - 1].prevX = points[points.length - 2].x;
            points[points.length - 1].prevY = points[points.length - 2].y;
          }
        }

        return points;
      };

      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent(containerRef.current!);
        p.colorMode(p.HSL, 360, 100, 100, 100);
        p.background(0, 0, 0);

        p.frameRate(60);
        demoPts = generateDemoPath();

        setTimeout(() => {
          demoPhase = "drawing";
        }, 1000);
      };

      const drawBrushStroke = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        opacity: number = 50
      ): void => {
        const brushColor = p.color(hue, 80, 60, opacity);

        for (let i = 0; i < 5; i++) {
          const offsetX: number = p.random(-brushSize, brushSize);
          const offsetY: number = p.random(-brushSize, brushSize);
          const weight: number = p.random(5, brushSize);
          p.stroke(brushColor);
          p.strokeWeight(weight);
          p.line(x1 + offsetX, y1 + offsetY, x2 + offsetX, y2 + offsetY);
        }
      };

      p.draw = () => {
        hue = (hue + 0.5) % 360;

        if (demoPhase === "drawing") {
          if (demoIndex < demoPts.length) {
            const pt = demoPts[demoIndex];
            if (pt.prevX !== null && pt.prevY !== null) {
              drawBrushStroke(pt.prevX, pt.prevY, pt.x, pt.y);
            }
            demoIndex++;
          } else {
            demoPhase = "fading";
          }
        } else if (demoPhase === "fading") {
          p.background(0, 0, 0, 5);
          demoOpacity -= 2;

          if (demoOpacity <= 0) {
            p.background(0, 0, 0);
            demoPhase = "done";
            userCanDraw = true;
          }
        }

        if (userCanDraw && p.mouseIsPressed) {
          drawBrushStroke(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY);
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    }, containerRef.current);

    sketchRef.current = sketch;

    return () => {
      if (sketchRef.current) {
        sketchRef.current.remove();
      }
    };
  }, []);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div style={{ position: "relative", width: "100%", height: "100vh" }}>
        <header className={styles.header}>
          <h1>
            <Link to="/" onClick={closeMenu}>
              The Eternal Dance
            </Link>
          </h1>

          {/* Desktop Navigation (visible on larger screens) */}
          <nav className={styles.desktopNav}>
            <ul>
              <li>
                <Link to="/team">Team</Link>
              </li>
              <li>
                <Link to="/gallery">Gallery</Link>
              </li>
            </ul>
          </nav>

          {/* Burger Menu Button (visible on mobile) */}
          <button className={styles.burgerButton} onClick={toggleMenu} aria-label={isMenuOpen ? "Close menu" : "Open menu"}>
            <span>{isMenuOpen ? 'Close' : 'Menu'}</span>
          </button>

          {/* Mobile Navigation Overlay (visible when menu is open) */}
          <nav
            className={`${styles.mobileNavOverlay} ${
              isMenuOpen ? styles.mobileNavOverlayOpen : ""
            }`}
          >
            <ul>
              <li>
                <Link to="/" onClick={closeMenu}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/team" onClick={closeMenu}>
                  Team
                </Link>
              </li>
              <li>
                <Link to="/gallery" onClick={closeMenu}>
                  Gallery
                </Link>
              </li>
            </ul>
          </nav>
        </header>
        {!isMobile && (
          <div ref={containerRef} className={styles.canvasContainer} />
        )}
        <div className={styles.overlay} />
        <div className={styles.textContainer}>
          <p className={styles.logline}>
            An audiovisual installation where movement and emotion intertwine in
            an eternal dance of transformation.
          </p>
          <span>28th - 31st May 2025, Alte Saline Hallein</span>
        </div>
      </div>
    </>
  );
};

export const PaintingCanvas = memo(PaintingCanvasRaw);
