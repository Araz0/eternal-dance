import React, { useRef, useState, useCallback, memo } from 'react'
import { useCanvas } from './useCanvas'

// Default thumbnail URLs (update these paths as needed)
const defaultThumbnails = [
  '/thumbnails/1.jpg',
  '/thumbnails/2.jpg',
  '/thumbnails/3.jpg',
  '/thumbnails/4.jpg',
]

export interface InfiniteGalleryProps {
  thumbnails?: string[]
}

const InfiniteGalleryRaw: React.FC<InfiniteGalleryProps> = ({
  thumbnails = defaultThumbnails,
}) => {
  // Create the canvas ref.
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // State for managing the overlay and video source.
  const [showOverlay, setShowOverlay] = useState(false)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)

  // Callback to execute when an item is clicked.
  const handleItemClick = useCallback(
    (index: number) => {
      // For example, assume the video file is named following the thumbnail:
      // e.g. if thumbnail is '/thumbnails/1.jpg' then video is '/videos/1.mp4'
      const thumbName = thumbnails[index].split('/').pop()
      const videoId = thumbName ? thumbName.split('.')[0] : ''
      const src = `/videos/${videoId}.mp4`
      setVideoSrc(src)
      setShowOverlay(true)
    },
    [thumbnails]
  )

  // Call the custom hook.
  useCanvas({
    canvasRef,
    thumbnails,
    onItemClick: handleItemClick,
  })

  // Overlay close handler.
  const handleOverlayClose = useCallback(() => {
    setShowOverlay(false)
    setVideoSrc(null)
  }, [])

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
          onClick={handleOverlayClose}
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
