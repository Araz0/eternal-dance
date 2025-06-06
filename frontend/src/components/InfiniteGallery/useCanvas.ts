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
  randomizePlacement?: boolean // default true
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
  skipChance = 0.0,
  minZoom = 0.5,
  maxZoom = 2,
  initialScale = 0.8,
  showGridLines = true,
  showGridIdentifiers = true,
  randomizePlacement = false,
}: UseCanvasProps) {
  const thumbWidth = tileWidth - tilePadding
  const thumbHeight = tileHeight - tilePadding

  // Ref to hold gallery items created on image load.
  const itemsRef = useRef<GalleryItem[]>([])
  // Refs to handle panning/zooming.
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

    // Fill background.
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
      if (!item.thumbnail.complete || item.thumbnail.naturalWidth === 0) return
      const cellX = item.col * tileWidth * scaleRef.current + offsetXRef.current
      const cellY =
        item.row * tileHeight * scaleRef.current + offsetYRef.current
      const imgW = thumbWidth * scaleRef.current
      const imgH = thumbHeight * scaleRef.current

      // Calculate a pseudo-random offset based on the item's index.
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

      // Here we compute the drawn image's top-left position.
      const centerX =
        cellX + (tileWidth * scaleRef.current - imgW) / 2 + randomOffsetX
      const centerY =
        cellY + (tileHeight * scaleRef.current - imgH) / 2 + randomOffsetY

      // Save the drawn image bounds.
      item._bounds = { x: centerX, y: centerY, w: imgW, h: imgH }
      try {
        ctx.drawImage(item.thumbnail, centerX, centerY, imgW, imgH)
      } catch (error) {
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

      img.onload = () => {
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

      img.onerror = () => {
        console.warn(`Thumbnail failed to load at index ${i}: ${src}`)
        loadedCount++
        if (loadedCount === thumbnails.length) {
          itemsRef.current = newItems
          drawGrid()
        }
      }
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

  const zoomToItem = useCallback(
    (index: number, targetScale: number = maxZoom) => {
      const canvas = canvasRef.current
      if (!canvas) return

      // 1) clamp and set the new scale
      const clamped = Math.max(minZoom, Math.min(targetScale, maxZoom))
      scaleRef.current = clamped

      // 2) find the item and compute its tile center in world coords
      const item = itemsRef.current.find((it) => it.index === index)
      if (!item) return
      const tileCenterX =
        item.col * tileWidth * clamped + (tileWidth * clamped) / 2
      const tileCenterY =
        item.row * tileHeight * clamped + (tileHeight * clamped) / 2

      // 3) recalculate offsets so that tileCenterX,Y lands in the canvas center
      offsetXRef.current = canvas.width / 2 - tileCenterX
      offsetYRef.current = canvas.height / 2 - tileCenterY

      // 4) redraw at the new zoom & offset
      drawGrid()
    },
    [canvasRef, drawGrid, tileWidth, tileHeight, minZoom, maxZoom]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    resizeCanvas()
    loadThumbnails()
    window.addEventListener('resize', resizeCanvas)
    canvas.addEventListener('wheel', handleWheel)
    canvas.addEventListener('pointerdown', handleMouseDown)
    canvas.addEventListener('pointermove', handleMouseMove)
    canvas.addEventListener('pointerup', handleMouseUp)
    canvas.addEventListener('pointerleave', handleMouseLeave)
    canvas.addEventListener('click', handleCanvasClick)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('pointerdown', handleMouseDown)
      canvas.removeEventListener('pointermove', handleMouseMove)
      canvas.removeEventListener('pointerup', handleMouseUp)
      canvas.removeEventListener('pointerleave', handleMouseLeave)
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

  return { zoomToItem }
}
