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
  // State for the search query.
  const [searchQuery, setSearchQuery] = useState('')

  // Callback to execute when an item is clicked.
  const handleItemClick = useCallback(
    (index: number) => {
      const thumbName = thumbnails[index].split('/').pop()
      const videoId = thumbName ? thumbName.split('.')[0] : ''
      const src = `/videos/${videoId}.mp4`
      setVideoSrc(src)
      setShowOverlay(true)
    },
    [thumbnails]
  )

  // Get centerOnItem function from the custom hook.
  const { centerOnItem } = useCanvas({
    canvasRef,
    thumbnails,
    onItemClick: handleItemClick,
  })

  // Overlay close handler.
  const handleOverlayClose = useCallback(() => {
    setShowOverlay(false)
    setVideoSrc(null)
  }, [])

  // Search handler: when the user searches, locate the first thumbnail matching the query and center it.
  const handleSearch = useCallback(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return

    const foundIndex = thumbnails.findIndex((src) =>
      src.toLowerCase().includes(query)
    )
    if (foundIndex !== -1) {
      centerOnItem(foundIndex)
    }
  }, [searchQuery, thumbnails, centerOnItem])

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
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex',
          gap: '8px',
        }}
      >
        <input
          type='text'
          placeholder='Search by src...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '10px 14px',
            fontSize: '16px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#333', // dark background
            color: '#eee',
            outline: 'none',
            width: '300px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '10px 16px',
            fontSize: '16px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#555', // maintain dark theme
            color: '#fff',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#666')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#555')}
        >
          Search
        </button>
      </div>
    </div>
  )
}

export const InfiniteGallery = memo(InfiniteGalleryRaw)
export default InfiniteGallery
