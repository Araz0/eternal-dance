import React, { useRef, useEffect, useState, memo } from 'react'
import { useCanvas } from './useCanvas'

const _exps = [1, 2, 3, 4]
export interface InfiniteGalleryProps {
  // Array of IDs or values which will be used to load thumbnails/videos.
  exps: number[]
  // Optional configuration (if you want to override the defaults).
  tileWidth?: number
  tileHeight?: number
  tilePadding?: number
  skipChance?: number
  minZoom?: number
  maxZoom?: number
  initialScale?: number
}

const InfiniteGalleryRaw: React.FC<InfiniteGalleryProps> = ({
  exps = _exps,
  tileWidth,
  tileHeight,
  tilePadding,
  skipChance,
  minZoom,
  maxZoom,
  initialScale,
}) => {
  // Create a ref for the canvas element.
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Use the custom hook by passing the canvas ref and configuration.
  const { selectedIndex, setSelectedIndex } = useCanvas({
    canvasRef,
    exps,
    tileWidth,
    tileHeight,
    tilePadding,
    skipChance,
    minZoom,
    maxZoom,
    initialScale,
  })

  // States to manage the overlay (video player) and video source.
  const [showOverlay, setShowOverlay] = useState(false)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)

  // When an item is clicked (selectedIndex updated by the hook), configure the video source.
  useEffect(() => {
    if (selectedIndex !== null) {
      // Here we assume the video URL follows a convention.
      const src = `/videos/${exps[selectedIndex]}.mp4`
      setVideoSrc(src)
      setShowOverlay(true)
    }
  }, [selectedIndex, exps])

  // Close handler for the overlay.
  const handleOverlayClose = () => {
    setShowOverlay(false)
    setVideoSrc(null)
    // Clear the selected index for future clicks.
    setSelectedIndex(null)
  }

  return (
    <div style={{ position: 'relative' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      {showOverlay && videoSrc && (
        <div
          style={{
            display: 'flex',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.8)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 20,
              fontSize: 24,
              color: 'white',
              cursor: 'pointer',
            }}
            onClick={handleOverlayClose}
          >
            ✖
          </div>
          <video
            id='videoPlayer'
            src={videoSrc}
            controls
            autoPlay
            style={{
              background: 'black',
              maxWidth: '90vw',
              maxHeight: '90vh',
            }}
          />
        </div>
      )}
    </div>
  )
}

export const InfiniteGallery = memo(InfiniteGalleryRaw)
