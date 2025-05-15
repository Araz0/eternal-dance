import Header from '../components/Header/Header'
import MouseFollowImageGallery from '../components/MouseFollowImageGallery/MouseFollowImageGallery'
import { PaintingCanvas } from '../components/PaintingCanvas'
import About from '../components/About/About'
import Footer from '../components/Footer/Footer'

export const Home = () => {
  return (  
    <>
      {/* <Header /> */}
      <PaintingCanvas />
      {/* <p className={styles.logline}>An audiovisual installation where movement and emotion intertwine in an eternal dance of transformation.</p> */}
      <About />
      <MouseFollowImageGallery 
        maxMovementRadius={100} 
        movementIntensity={0.4} 
        lerpFactor={0.15}
      />
      <Footer />
    </>
  )
}
