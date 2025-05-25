import React, { useRef, memo, useCallback, useState, useEffect } from 'react'
import { useCanvas } from './useCanvas'
import { SearchInput } from '../SearchInput'

export interface InfiniteGalleryProps {
  thumbnails: string[]
  onItemClick: (index: number) => void
  focusedId?: number
}

const InfiniteGalleryRaw: React.FC<InfiniteGalleryProps> = ({
  thumbnails,
  onItemClick,
  focusedId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Get centerOnItem function from the custom hook.
  const { zoomToItem } = useCanvas({
    canvasRef,
    thumbnails,
    onItemClick,
  })

  // Search handler: when the user searches, locate the first file matching the query and center it.
  const handleSearch = useCallback(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return

    const foundIndex = thumbnails.findIndex((thumbnail) =>
      thumbnail.toLowerCase().includes(query)
    )
    if (foundIndex !== -1) {
      zoomToItem(foundIndex)
    }
  }, [zoomToItem, searchQuery, thumbnails])

  useEffect(() => {
    if (!focusedId) return
    zoomToItem(focusedId)
  }, [focusedId, zoomToItem])

  return (
    <div style={{ position: 'relative' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <SearchInput
        onSearchClick={handleSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </div>
  )
}

export const InfiniteGallery = memo(InfiniteGalleryRaw)
