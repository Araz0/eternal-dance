import { PageContainer } from '../components'
import Header from '../components/Header/Header'
import MouseFollowImageGallery from '../components/MouseFollowImageGallery/MouseFollowImageGallery'
import { PaintingCanvas } from '../components/PaintingCanvas'
import About from '../components/About/About'
import styles from './styles.module.css'

export const Home = () => {
  return (  
    <>
      <Header />
      <PaintingCanvas />
      {/* <p className={styles.logline}>An audiovisual installation where movement and emotion intertwine in an eternal dance of transformation.</p> */}
      <About />
      <MouseFollowImageGallery 
        maxMovementRadius={100} 
        movementIntensity={0.4} 
        lerpFactor={0.15}
      />
    </>
  )
}
