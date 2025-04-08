import { useEffect, useRef, useCallback } from 'react'

export type UseCanvasProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  thumbnails: string[]
  onItemClick: (index: number) => void
  tileWidth?: number // default 300
  tileHeight?: number // default 400
  tilePadding?: number // default 80
  skipChance?: number // default 0.3
  minZoom?: number // default 0.5
  maxZoom?: number // default 2
  initialScale?: number // default 0.8
  showGridLines?: boolean // default false
  showGridIdentifiers?: boolean // default false
  randomizePlacement?: boolean // default false
}

interface Bounds {
  x: number
  y: number
  w: number
  h: number
}

interface GalleryItem {
  thumbnail: HTMLImageElement
  index: number
  col: number
  row: number
  _bounds: Bounds
}

export function useCanvas({
  canvasRef,
  thumbnails,
  onItemClick,
  tileWidth = 300,
  tileHeight = 400,
  tilePadding = 80,
  skipChance = 0.3,
  minZoom = 0.5,
  maxZoom = 2,
  initialScale = 0.8,
  showGridLines = false,
  showGridIdentifiers = false,
  randomizePlacement = true,
}: UseCanvasProps) {
  const thumbWidth = tileWidth - tilePadding
  const thumbHeight = tileHeight - tilePadding

  // Ref to hold gallery items created on image load.
  const itemsRef = useRef<GalleryItem[]>([])
  // Refs to handle panning/zooming
  const scaleRef = useRef<number>(initialScale)
  const offsetXRef = useRef<number>(0)
  const offsetYRef = useRef<number>(0)
  const isDraggingRef = useRef<boolean>(false)
  const startXRef = useRef<number>(0)
  const startYRef = useRef<number>(0)

  // Draw the entire grid and images on the canvas.
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    // Compute grid dimensions.
    const cols = Math.ceil(width / (tileWidth * scaleRef.current)) + 2
    const rows = Math.ceil(height / (tileHeight * scaleRef.current)) + 2
    const startCol = Math.floor(
      -offsetXRef.current / (tileWidth * scaleRef.current)
    )
    const startRow = Math.floor(
      -offsetYRef.current / (tileHeight * scaleRef.current)
    )

    ctx.fillStyle = '#222'
    ctx.fillRect(0, 0, width, height)

    // Draw grid cells.
    for (let row = startRow; row < startRow + rows; row++) {
      for (let col = startCol; col < startCol + cols; col++) {
        const x = col * tileWidth * scaleRef.current + offsetXRef.current
        const y = row * tileHeight * scaleRef.current + offsetYRef.current
        ctx.fillStyle = '#222'
        ctx.fillRect(
          x,
          y,
          tileWidth * scaleRef.current,
          tileHeight * scaleRef.current
        )
        if (showGridLines) {
          ctx.strokeStyle = '#555'
          ctx.strokeRect(
            x,
            y,
            tileWidth * scaleRef.current,
            tileHeight * scaleRef.current
          )
        }
        if (showGridIdentifiers) {
          ctx.fillStyle = '#888'
          ctx.font = `${16 * scaleRef.current}px sans-serif`
          ctx.fillText(
            `(${col}, ${row})`,
            x + 10 * scaleRef.current,
            y + 25 * scaleRef.current
          )
        }
      }
    }

    // Draw each thumbnail image at its computed center.
    itemsRef.current.forEach((item) => {
      const cellX = item.col * tileWidth * scaleRef.current + offsetXRef.current
      const cellY =
        item.row * tileHeight * scaleRef.current + offsetYRef.current
      const imgW = thumbWidth * scaleRef.current
      const imgH = thumbHeight * scaleRef.current

      // Calculate a pseudo-random offset based on the item's index
      const randomOffsetX = randomizePlacement
        ? ((item.index % 10) - 5) *
          (tileWidth * scaleRef.current * 0.02) *
          (item.index % 2 === 0 ? 1 : -1)
        : 0
      const randomOffsetY = randomizePlacement
        ? ((item.index % 7) - 3) *
          (tileHeight * scaleRef.current * 0.02) *
          (item.index % 3 === 0 ? 1 : -1)
        : 0

      const centerX =
        cellX + (tileWidth * scaleRef.current - imgW) / 2 + randomOffsetX
      const centerY =
        cellY + (tileHeight * scaleRef.current - imgH) / 2 + randomOffsetY

      item._bounds = { x: centerX, y: centerY, w: imgW, h: imgH }
      try {
        ctx.drawImage(item.thumbnail, centerX, centerY, imgW, imgH)
      } catch (error) {
        // Silently catch errors (for example, if image is not ready).
        console.error('Error drawing image:', error, item)
      }
    })
  }, [
    canvasRef,
    showGridIdentifiers,
    showGridLines,
    thumbHeight,
    thumbWidth,
    tileHeight,
    tileWidth,
    randomizePlacement,
  ])

  // Generate positions in a spiral layout with random skipping.
  const generateSpiralPositions = useCallback(
    (limit: number) => {
      const positions: { col: number; row: number }[] = []
      let x = 0,
        y = 0,
        dx = 0,
        dy = -1
      const maxI = limit * limit
      for (let i = 0; i < maxI; i++) {
        if (
          x > -limit / 2 &&
          x < limit / 2 &&
          y > -limit / 2 &&
          y < limit / 2
        ) {
          if (Math.random() > skipChance) {
            positions.push({ col: x, row: y })
          }
        }
        if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
          ;[dx, dy] = [-dy, dx]
        }
        x += dx
        y += dy
        if (positions.length >= thumbnails.length) break
      }
      return positions
    },
    [skipChance, thumbnails.length]
  )

  // Load the thumbnail images from the provided URLs.
  const loadThumbnails = useCallback(() => {
    const positions = generateSpiralPositions(20)
    const newItems: GalleryItem[] = []
    let loadedCount = 0
    thumbnails.forEach((src, i) => {
      const img = new Image()
      img.src = src
      const handleLoad = () => {
        const pos = positions[i]
        if (pos) {
          newItems.push({
            thumbnail: img,
            index: i,
            col: pos.col,
            row: pos.row,
            _bounds: { x: 0, y: 0, w: 0, h: 0 },
          })
        }
        loadedCount++
        if (loadedCount === thumbnails.length) {
          itemsRef.current = newItems
          drawGrid()
        }
      }
      img.onload = handleLoad
      img.onerror = handleLoad
    })
  }, [generateSpiralPositions, thumbnails, drawGrid])

  // When the canvas is clicked, find the clicked item and call the provided callback.
  const handleClick = useCallback(
    (x: number, y: number) => {
      const clickedItem = itemsRef.current.find((item) => {
        const { _bounds } = item
        return (
          _bounds &&
          x >= _bounds.x &&
          x <= _bounds.x + _bounds.w &&
          y >= _bounds.y &&
          y <= _bounds.y + _bounds.h
        )
      })
      if (clickedItem) {
        onItemClick(clickedItem.index)
      }
    },
    [onItemClick]
  )

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      const mouseX = e.clientX
      const mouseY = e.clientY
      const zoomAmount = -e.deltaY * 0.001
      const worldX = (mouseX - offsetXRef.current) / scaleRef.current
      const worldY = (mouseY - offsetYRef.current) / scaleRef.current
      scaleRef.current *= 1 + zoomAmount
      scaleRef.current = Math.max(minZoom, Math.min(scaleRef.current, maxZoom))
      offsetXRef.current = mouseX - worldX * scaleRef.current
      offsetYRef.current = mouseY - worldY * scaleRef.current
      drawGrid()
    },
    [minZoom, maxZoom, drawGrid]
  )

  const handleMouseDown = useCallback((e: MouseEvent) => {
    isDraggingRef.current = true
    startXRef.current = e.clientX - offsetXRef.current
    startYRef.current = e.clientY - offsetYRef.current
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDraggingRef.current) {
        offsetXRef.current = e.clientX - startXRef.current
        offsetYRef.current = e.clientY - startYRef.current
        drawGrid()
      }
    },
    [drawGrid]
  )

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  const handleMouseLeave = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  const handleCanvasClick = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current) {
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        handleClick(x, y)
      }
    },
    [handleClick, canvasRef]
  )

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    offsetXRef.current = canvas.width / 2 - (tileWidth * scaleRef.current) / 2
    offsetYRef.current = canvas.height / 2 - (tileHeight * scaleRef.current) / 2
    drawGrid()
  }, [canvasRef, tileWidth, tileHeight, drawGrid])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    resizeCanvas()
    loadThumbnails()
    window.addEventListener('resize', resizeCanvas)
    canvas.addEventListener('wheel', handleWheel)
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseLeave)
    canvas.addEventListener('click', handleCanvasClick)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      canvas.removeEventListener('click', handleCanvasClick)
    }
  }, [
    canvasRef,
    resizeCanvas,
    loadThumbnails,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleCanvasClick,
  ])

  // Optionally return a redraw method.
  return { redraw: drawGrid }
}
