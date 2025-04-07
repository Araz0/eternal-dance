import { memo, useEffect, useRef } from 'react'

const PaintingCanvasRaw = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Dynamically load p5 to avoid SSR issues
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js'
    script.async = true
    script.onload = () => {
      new window.p5((p) => {
        let brushSize = 20
        let hue = 0

        p.setup = () => {
          const canvas = p.createCanvas(p.windowWidth, p.windowHeight)
          canvas.parent(containerRef.current!)
          p.colorMode(p.HSL, 360, 100, 100, 100)
          p.background(0, 0, 100)
        }

        p.draw = () => {
          hue = (hue + 0.5) % 360
          const brushColor = p.color(hue, 80, 60, 50)

          if (p.mouseIsPressed) {
            for (let i = 0; i < 5; i++) {
              const offsetX = p.random(-brushSize, brushSize)
              const offsetY = p.random(-brushSize, brushSize)
              const weight = p.random(5, brushSize)
              p.stroke(brushColor)
              p.strokeWeight(weight)
              p.line(
                p.mouseX + offsetX,
                p.mouseY + offsetY,
                p.pmouseX + offsetX,
                p.pmouseY + offsetY
              )
            }
          }
        }

        p.windowResized = () => {
          p.resizeCanvas(p.windowWidth, p.windowHeight)
        }
      })
    }
    document.body.appendChild(script)
  }, [])

  return (
    <>
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          backdropFilter: 'blur(2px)',
          zIndex: 1,
        }}
      />
    </>
  )
}

export const PaintingCanvas = memo(PaintingCanvasRaw)
