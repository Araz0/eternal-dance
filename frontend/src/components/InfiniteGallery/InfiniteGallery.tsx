import React, { useRef, memo, useCallback, useState } from 'react'
import { useCanvas } from './useCanvas'
import { SearchInput } from '../SearchInput'

export interface InfiniteGalleryProps {
  thumbnails: string[]
  onItemClick: (index: number) => void
}

const InfiniteGalleryRaw: React.FC<InfiniteGalleryProps> = ({
  thumbnails,
  onItemClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Get centerOnItem function from the custom hook.
  const { centerOnItem } = useCanvas({
    canvasRef,
    thumbnails,
    onItemClick,
  })

  console.log('## ~ thumbnails:', thumbnails)

  // Search handler: when the user searches, locate the first file matching the query and center it.
  const handleSearch = useCallback(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return

    const foundIndex = thumbnails.findIndex((thumbnail) =>
      thumbnail.toLowerCase().includes(query)
    )
    if (foundIndex !== -1) {
      centerOnItem(foundIndex)
    }
  }, [centerOnItem, searchQuery, thumbnails])

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
