import React, { useRef, useState, useCallback, memo } from 'react'
import { useCanvas } from './useCanvas'
import { VideoOverlay } from './VideoOverlay'
import { SearchInput } from './SearchInput'

// Define the structure of the new prop.
export interface FileItem {
  id: number
  video: string
  thumbnail: string
}

export interface InfiniteGalleryProps {
  items: FileItem[]
}

const InfiniteGalleryRaw: React.FC<InfiniteGalleryProps> = ({ items }) => {
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
      const src = items[index].video
      setVideoSrc(src)
      setShowOverlay(true)
    },
    [items]
  )

  // Get centerOnItem function from the custom hook.
  const { centerOnItem } = useCanvas({
    canvasRef,
    thumbnails: items.map((file) => file.thumbnail),
    onItemClick: handleItemClick,
  })

  // Overlay close handler.
  const handleOverlayClose = useCallback(() => {
    setShowOverlay(false)
    setVideoSrc(null)
  }, [])

  // Search handler: when the user searches, locate the first file matching the query and center it.
  const handleSearch = useCallback(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return

    const foundIndex = items.findIndex((file) =>
      file.thumbnail.toLowerCase().includes(query)
    )
    if (foundIndex !== -1) {
      centerOnItem(foundIndex)
    }
  }, [searchQuery, items, centerOnItem])

  return (
    <div style={{ position: 'relative' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <VideoOverlay
        videoSrc={videoSrc ? videoSrc : ''}
        showOverlay={showOverlay}
        handleOverlayClose={handleOverlayClose}
      />
      <SearchInput
        onSearchClick={handleSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </div>
  )
}

export const InfiniteGallery = memo(InfiniteGalleryRaw)
