import { memo, useCallback } from 'react'
import styles from './style.module.css'

type ReelsType = {
  id: number
  video: string
  thumbnail: string
}
type ReelsGalleryProps = {
  reels: ReelsType[]
  onItemClick: (id: number) => void
}

const ReelsGalleryRaw = ({ reels, onItemClick }: ReelsGalleryProps) => {
  const handleClick = useCallback(
    (id: number) => {
      const itemIndex = reels.findIndex((item) => {
        return item.id === id
      })
      if (itemIndex) {
        // get its index
        onItemClick(itemIndex)
      }
    },
    [reels, onItemClick]
  )

  return (
    <div className={styles.reelsGallery}>
      {reels.map((reel) => (
        <div key={reel.id} className={styles.reelItem}>
          <img
            src={reel.thumbnail}
            alt={`Thumbnail for reel ${reel.id}`}
            onClick={() => handleClick(reel.id)}
            className={styles.reelThumbnail}
          />
        </div>
      ))}
    </div>
  )
}

export const ReelsGallery = memo(ReelsGalleryRaw)
