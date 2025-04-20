import { memo, useEffect, useRef, useState } from 'react'
import styles from './VideoOverlay.module.css'
import { CloseIcon } from '../icons'

type VideoOverlayProps = {
  videoSrc: string
  showOverlay: boolean
  handleOverlayClose: () => void
  isMobile?: boolean
}

const VideoOverlayRaw = ({
  videoSrc,
  showOverlay,
  handleOverlayClose,
  isMobile = false,
}: VideoOverlayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (showOverlay) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [showOverlay])

  const handleTimeUpdate = () => {
    if (!isMobile) return
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime
      const duration = videoRef.current.duration
      setProgress((currentTime / duration) * 100)
    }
  }

  if (!showOverlay) return null

  return (
    <div className={styles.overlay} onClick={handleOverlayClose}>
      <div className={styles.closeButton} onClick={handleOverlayClose}>
        <CloseIcon size={32} color='#ccc' />
      </div>
      <div className={styles.videoContainer}>
        <video
          id='videoPlayer'
          ref={videoRef}
          src={videoSrc}
          controls
          autoPlay
          loop
          className={styles.videoPlayer}
          onTimeUpdate={handleTimeUpdate}
        />
        {isMobile && (
          <progress className={styles.progressBar} value={progress} max='100' />
        )}
      </div>
    </div>
  )
}

export const VideoOverlay = memo(VideoOverlayRaw)
