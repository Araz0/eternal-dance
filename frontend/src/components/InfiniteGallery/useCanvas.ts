import { useEffect, useRef, useState } from 'react'

export type UseCanvasProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  exps: number[]
  tileWidth?: number // default 300
  tileHeight?: number // default 400
  tilePadding?: number // default 80
  skipChance?: number // default 0.3
  minZoom?: number // default 0.5
  maxZoom?: number // default 2
  initialScale?: number // default 0.8
}

interface Bounds {
  x: number
  y: number
  w: number
  h: number
}

interface VideoObject {
  thumbnail: HTMLImageElement
  src: string
  col: number
  row: number
  expIndex: number
  _bounds: Bounds
}

export function useCanvas({
  canvasRef,
  exps,
  tileWidth = 300,
  tileHeight = 400,
  tilePadding = 80,
  skipChance = 0.3,
  minZoom = 0.5,
  maxZoom = 2,
  initialScale = 0.8,
}: UseCanvasProps): {
  selectedIndex: number | null
  setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>
} {
  // Calculate thumbnail sizes from the tile config
  const thumbWidth = tileWidth - tilePadding
  const thumbHeight = tileHeight - tilePadding

  // Mutable state to hold our video objects.
  const videoObjectsRef = useRef<VideoObject[]>([])

  // This state will hold the index (from exps) of the clicked item.
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // Using refs for mutable properties used for panning and zooming.
  const scaleRef = useRef<number>(initialScale)
  const offsetXRef = useRef<number>(0)
  const offsetYRef = useRef<number>(0)
  const isDraggingRef = useRef<boolean>(false)
  const startXRef = useRef<number>(0)
  const startYRef = useRef<number>(0)

  // Generate spiral positions (with skipping) to place your items.
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
      if (x > -limit / 2 && x < limit / 2 && y > -limit / 2 && y < limit / 2) {
        // Skip a tile at random based on the skipChance.
        if (Math.random() > skipChance) {
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

  // Load thumbnail images based on exps.
  const loadThumbnails = () => {
    const positions = generateSpiralPositions(20)
    let loadedCount = 0
    const newVideoObjects: VideoObject[] = []
    exps.forEach((id, i) => {
      const img = new Image()
      img.src = `/thumbnails/${id}.jpg`
      img.onload = () => {
        const pos = positions[i]
        if (pos) {
          newVideoObjects.push({
            thumbnail: img,
            src: `/videos/${id}.mp4`,
            col: pos.col,
            row: pos.row,
            expIndex: i,
            _bounds: { x: 0, y: 0, w: 0, h: 0 },
          })
        }
        loadedCount++
        if (loadedCount === exps.length) {
          videoObjectsRef.current = newVideoObjects
          drawGrid()
        }
      }
      img.onerror = () => {
        loadedCount++
        if (loadedCount === exps.length) {
          videoObjectsRef.current = newVideoObjects
          drawGrid()
        }
      }
    })
  }

  // The main drawGrid function. It draws the grid layout and each thumbnail at its designated position.
  const drawGrid = () => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    const { width, height } = canvasRef.current
    ctx.clearRect(0, 0, width, height)

    // Compute how many columns and rows to draw.
    const cols = Math.ceil(width / (tileWidth * scaleRef.current)) + 2
    const rows = Math.ceil(height / (tileHeight * scaleRef.current)) + 2
    const startCol = Math.floor(
      -offsetXRef.current / (tileWidth * scaleRef.current)
    )
    const startRow = Math.floor(
      -offsetYRef.current / (tileHeight * scaleRef.current)
    )

    // Draw grid cells.
    for (let row = startRow; row < startRow + rows; row++) {
      for (let col = startCol; col < startCol + cols; col++) {
        const x = col * tileWidth * scaleRef.current + offsetXRef.current
        const y = row * tileHeight * scaleRef.current + offsetYRef.current

        ctx.fillStyle = '#222'
        ctx.fillRect(
          x,
          y,
          tileWidth * scaleRef.current - 1,
          tileHeight * scaleRef.current - 1
        )

        ctx.strokeStyle = '#555'
        ctx.strokeRect(
          x,
          y,
          tileWidth * scaleRef.current,
          tileHeight * scaleRef.current
        )

        ctx.fillStyle = '#888'
        ctx.font = `${16 * scaleRef.current}px sans-serif`
        ctx.fillText(
          `(${col}, ${row})`,
          x + 10 * scaleRef.current,
          y + 25 * scaleRef.current
        )
      }
    }

    // Draw each video thumbnail image at its center inside its tile.
    videoObjectsRef.current.forEach((obj) => {
      const cellX = obj.col * tileWidth * scaleRef.current + offsetXRef.current
      const cellY = obj.row * tileHeight * scaleRef.current + offsetYRef.current
      const imgW = thumbWidth * scaleRef.current
      const imgH = thumbHeight * scaleRef.current
      const centerX = cellX + (tileWidth * scaleRef.current - imgW) / 2
      const centerY = cellY + (tileHeight * scaleRef.current - imgH) / 2

      // Update the bounds, which will later be used for click detection.
      obj._bounds = { x: centerX, y: centerY, w: imgW, h: imgH }

      try {
        ctx.drawImage(obj.thumbnail, centerX, centerY, imgW, imgH)
      } catch (error) {
        // Silently handle any errors here.
      }
    })
  }

  // Handle click detection on the canvas.
  const handleClick = (x: number, y: number) => {
    const clickedObj = videoObjectsRef.current.find((obj) => {
      const b = obj._bounds
      return b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h
    })
    if (clickedObj) {
      // Set the selected index corresponding to the exp in the array.
      setSelectedIndex(clickedObj.expIndex)
    }
  }

  // Attach event listeners to the canvas for zooming, panning, and clicks.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Resize and center the canvas.
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      offsetXRef.current = canvas.width / 2 - (tileWidth * scaleRef.current) / 2
      offsetYRef.current =
        canvas.height / 2 - (tileHeight * scaleRef.current) / 2
      drawGrid()
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const zoomAmount = -e.deltaY * 0.001
      const mouseX = e.clientX
      const mouseY = e.clientY

      const worldX = (mouseX - offsetXRef.current) / scaleRef.current
      const worldY = (mouseY - offsetYRef.current) / scaleRef.current

      scaleRef.current *= 1 + zoomAmount
      scaleRef.current = Math.max(minZoom, Math.min(scaleRef.current, maxZoom))

      offsetXRef.current = mouseX - worldX * scaleRef.current
      offsetYRef.current = mouseY - worldY * scaleRef.current

      drawGrid()
    }

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true
      startXRef.current = e.clientX - offsetXRef.current
      startYRef.current = e.clientY - offsetYRef.current
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        offsetXRef.current = e.clientX - startXRef.current
        offsetYRef.current = e.clientY - startYRef.current
        drawGrid()
      }
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
    }

    const handleMouseLeave = () => {
      isDraggingRef.current = false
    }

    const handleCanvasClick = (e: MouseEvent) => {
      if (!isDraggingRef.current) {
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        handleClick(x, y)
      }
    }

    window.addEventListener('resize', resizeCanvas)
    canvas.addEventListener('wheel', handleWheel)
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseLeave)
    canvas.addEventListener('click', handleCanvasClick)

    // Initial setup.
    resizeCanvas()
    loadThumbnails()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      canvas.removeEventListener('click', handleCanvasClick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, exps])

  return { selectedIndex, setSelectedIndex }
}
