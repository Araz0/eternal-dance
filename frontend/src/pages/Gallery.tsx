import { PageContainer, InfiniteGallery, FileItem } from '../components/'
import { useEffect, useState } from 'react'

export const Gallery = () => {
  const [galleryData, setGalleryData] = useState<FileItem[]>([])

  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        const response = await fetch('https://api.eternal-dance.art/api.php')
        const data = await response.json()
        setGalleryData(data.files || ([] as FileItem[]))
      } catch (error) {
        console.error('Error fetching gallery data:', error)
      }
    }

    fetchGalleryData()
  }, [])

  return (
    <PageContainer>
      <InfiniteGallery items={galleryData} />
    </PageContainer>
  )
}
