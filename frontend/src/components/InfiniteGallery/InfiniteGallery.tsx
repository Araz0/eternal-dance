import { memo, useEffect, useRef, useState } from 'react'

const TILE_WIDTH = 300
const TILE_HEIGHT = 400
const TILE_PADDING = 80
const THUMB_WIDTH = TILE_WIDTH - TILE_PADDING
const THUMB_HEIGHT = TILE_HEIGHT - TILE_PADDING
const SKIP_TILE_CHANCE = 0.3
const exps: number[] = [1, 2, 3, 4, 1, 2, 3, 4]

interface VideoObject {
  thumbnail: HTMLImageElement
  src: string
  col: number
  row: number
  id: string
  _bounds?: { x: number; y: number; w: number; h: number }
}

const InfiniteGalleryRaw: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const videoPlayerRef = useRef<HTMLVideoElement>(null)

  const [videoObjects, setVideoObjects] = useState<VideoObject[]>([])
  const [scale, setScale] = useState<number>(0.8)
  const minZoom = 0.5
  const maxZoom = 2

  let offsetX = 0
  let offsetY = 0
  let startX = 0
  let startY = 0
  let isDragging = false

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const centerAtOrigin = () => {
      offsetX = canvas.width / 2 - (TILE_WIDTH * scale) / 2
      offsetY = canvas.height / 2 - (TILE_HEIGHT * scale) / 2
    }

    const generateSpiralPositions = (
      limit: number
    ): { col: number; row: number }[] => {
      const positions: { col: number; row: number }[] = []
      let x = 0,
        y = 0,
        dx = 0,
        dy = -1
      const maxI = limit * limit
      for (let i = 0; i < maxI; i++) {
        if (
          -limit / 2 < x &&
          x < limit / 2 &&
          -limit / 2 < y &&
          y < limit / 2
        ) {
          if (Math.random() > SKIP_TILE_CHANCE) {
            positions.push({ col: x, row: y })
          }
        }
        if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
          ;[dx, dy] = [-dy, dx]
        }
        x += dx
        y += dy
        if (positions.length >= exps.length) break
      }
      return positions
    }

    const loadThumbnails = (callback: () => void) => {
      const positions = generateSpiralPositions(20)
      let loaded = 0
      const newObjects: VideoObject[] = []

      exps.forEach((id, i) => {
        const img = new Image()
        img.src = `/thumbnails/${id}.jpg`
        img.onload = () => {
          const pos = positions[i]
          if (pos) {
            newObjects.push({
              thumbnail: img,
              src: `/videos/${id}.mp4`,
              col: pos.col,
              row: pos.row,
              id: `vid${i}`,
            })
          }
          loaded++
          if (loaded === exps.length) {
            setVideoObjects(newObjects)
            callback()
          }
        }
      })
    }

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cols = Math.ceil(canvas.width / (TILE_WIDTH * scale)) + 2
      const rows = Math.ceil(canvas.height / (TILE_HEIGHT * scale)) + 2
      const startCol = Math.floor(-offsetX / (TILE_WIDTH * scale))
      const startRow = Math.floor(-offsetY / (TILE_HEIGHT * scale))

      for (let row = startRow; row < startRow + rows; row++) {
        for (let col = startCol; col < startCol + cols; col++) {
          const x = col * TILE_WIDTH * scale + offsetX
          const y = row * TILE_HEIGHT * scale + offsetY

          ctx.fillStyle = '#222'
          ctx.fillRect(x, y, TILE_WIDTH * scale - 1, TILE_HEIGHT * scale - 1)

          ctx.strokeStyle = '#555'
          ctx.strokeRect(x, y, TILE_WIDTH * scale, TILE_HEIGHT * scale)

          ctx.fillStyle = '#888'
          ctx.font = `${16 * scale}px sans-serif`
          ctx.fillText(`(${col}, ${row})`, x + 10 * scale, y + 25 * scale)
        }
      }

      videoObjects.forEach((obj) => {
        const cellX = obj.col * TILE_WIDTH * scale + offsetX
        const cellY = obj.row * TILE_HEIGHT * scale + offsetY
        const imgW = THUMB_WIDTH * scale
        const imgH = THUMB_HEIGHT * scale
        const centerX = cellX + (TILE_WIDTH * scale - imgW) / 2
        const centerY = cellY + (TILE_HEIGHT * scale - imgH) / 2
        obj._bounds = { x: centerX, y: centerY, w: imgW, h: imgH }
        try {
          ctx.drawImage(obj.thumbnail, centerX, centerY, imgW, imgH)
        } catch {
          console.error(`Error drawing image for object with src: ${obj.src}`)
        }
      })
    }

    const handleClick = (x: number, y: number) => {
      const clicked = videoObjects.find((obj) => {
        const b = obj._bounds
        return b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h
      })
      if (clicked && videoPlayerRef.current && overlayRef.current) {
        videoPlayerRef.current.src = clicked.src
        overlayRef.current.style.display = 'flex'
      }
    }

    const init = () => {
      resizeCanvas()
      centerAtOrigin()
      loadThumbnails(() => {
        drawGrid()
      })
    }

    init()
    window.addEventListener('resize', () => {
      resizeCanvas()
      drawGrid()
    })

    canvas.addEventListener('click', (e) => {
      if (!isDragging) handleClick(e.clientX, e.clientY)
    })

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault()
      const zoomAmount = -e.deltaY * 0.001
      const mouseX = e.clientX
      const mouseY = e.clientY
      const worldX = (mouseX - offsetX) / scale
      const worldY = (mouseY - offsetY) / scale
      const newScale = scale * (1 + zoomAmount)
      setScale(Math.max(minZoom, Math.min(newScale, maxZoom)))
      offsetX = mouseX - worldX * scale
      offsetY = mouseY - worldY * scale
      drawGrid()
    })

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true
      startX = e.clientX - offsetX
      startY = e.clientY - offsetY
    })
    canvas.addEventListener('mousemove', (e) => {
      if (isDragging) {
        offsetX = e.clientX - startX
        offsetY = e.clientY - startY
        drawGrid()
      }
    })
    canvas.addEventListener('mouseup', () => (isDragging = false))
    canvas.addEventListener('mouseleave', () => (isDragging = false))
  }, [videoObjects])

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <div
        ref={overlayRef}
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.8)',
          zIndex: 10,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          onClick={() => {
            if (overlayRef.current && videoPlayerRef.current) {
              videoPlayerRef.current.pause()
              videoPlayerRef.current.src = ''
              overlayRef.current.style.display = 'none'
            }
          }}
          style={{
            position: 'absolute',
            top: 10,
            right: 20,
            fontSize: 24,
            color: 'white',
            cursor: 'pointer',
          }}
        >
          ✖
        </div>
        <video
          ref={videoPlayerRef}
          controls
          autoPlay
          style={{ background: 'black', maxWidth: '90vw', maxHeight: '90vh' }}
        />
      </div>
    </>
  )
}

export const InfiniteGallery = memo(InfiniteGalleryRaw)
