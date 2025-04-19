import { PageContainer, InfiniteGallery, FileItem } from '../components/'
import { useEffect, useState } from 'react'

export const Gallery = () => {
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

  return (
    <PageContainer>
      {!loading && <InfiniteGallery items={galleryData} />}
    </PageContainer>
  )
}
