import { PaintingCanvas } from '../components/PaintingCanvas'
import About from '../components/About/About'
import Footer from '../components/Footer/Footer'
import ZoomParallaxImageGallery from '../components/ZoomParallaxImageGallery/ZoomParallaxImageGallery'
import transition from '../transition'

const Home = () => {
  return (  
    <>
      <PaintingCanvas />
      <ZoomParallaxImageGallery />
      <About />
      <Footer />
    </>
  )
}

export default transition(Home);
