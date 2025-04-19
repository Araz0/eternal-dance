import { memo } from 'react'

type VideoOverlayProps = {
  videoSrc: string
  showOverlay: boolean
  handleOverlayClose: () => void
}

const VideoOverlayRaw = ({
  videoSrc,
  showOverlay,
  handleOverlayClose,
}: VideoOverlayProps) => {
  if (!showOverlay) return
  return (
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
  )
}

export const VideoOverlay = memo(VideoOverlayRaw)
