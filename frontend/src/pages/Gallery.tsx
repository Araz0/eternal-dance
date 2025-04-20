import { PageContainer, InfiniteGallery, VideoOverlay } from '../components/'
import { useCallback, useEffect, useMemo, useState } from 'react'

export interface FileItem {
  id: number
  video: string
  thumbnail: string
}

export const Gallery = () => {
  const [showOverlay, setShowOverlay] = useState(false)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)

  const [galleryData, setGalleryData] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        const response = await fetch('https://api.eternal-dance.art/api.php')
        const data = (await response.json()) as { files: FileItem[] }
        setGalleryData(data.files || [])
      } catch (error) {
        console.error('Error fetching gallery data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGalleryData()
  }, [])

  // Memoize the items to prevent unnecessary re-renders.
  const memoizedItems = useMemo(() => galleryData, [galleryData])

  // Memoize thumbnails so its reference only changes when galleryData changes:
  const thumbnails = useMemo(
    () => galleryData.map((file) => file.thumbnail),
    [galleryData]
  )

  const handleItemClick = useCallback(
    (index: number) => {
      const src = memoizedItems[index].video
      setVideoSrc(src)
      setShowOverlay(true)
    },
    [memoizedItems]
  )

  const handleOverlayClose = useCallback(() => {
    setShowOverlay(false)
    setVideoSrc(null)
  }, [])

  return (
    <PageContainer>
      {!loading && (
        <InfiniteGallery
          thumbnails={thumbnails}
          onItemClick={handleItemClick}
        />
      )}
      <VideoOverlay
        videoSrc={videoSrc ? videoSrc : ''}
        showOverlay={showOverlay}
        handleOverlayClose={handleOverlayClose}
      />
    </PageContainer>
  )
}
