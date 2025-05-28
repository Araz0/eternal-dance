import { useSearchParams } from 'react-router-dom'
import {
  PageContainer,
  InfiniteGallery,
  VideoOverlay,
  ReelsGallery,
} from '../components/'
import { useCallback, useEffect, useMemo, useState } from 'react'
import transition from '../transition'

const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/i.test(
  navigator.userAgent
)

export type FileItem = {
  id: number
  video: string
  thumbnail: string
}

const Gallery = () => {
  const [searchParams] = useSearchParams()
  const rawId = searchParams.get('id') // string | null
  const focusedId = rawId !== null ? +rawId : undefined // number | undefined

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
    <>
      {/* <Header /> */}
      <PageContainer>
        {!loading &&
          (isMobileDevice ? (
            <ReelsGallery reels={memoizedItems} onItemClick={handleItemClick} />
          ) : (
            <InfiniteGallery
              thumbnails={thumbnails}
              onItemClick={handleItemClick}
              focusedId={focusedId}
            />
          ))}
        <VideoOverlay
          videoSrc={videoSrc ? videoSrc : ''}
          showOverlay={showOverlay}
          handleOverlayClose={handleOverlayClose}
          isMobile={isMobileDevice}
        />
      </PageContainer>
    </>
  )
}

export default transition(Gallery)