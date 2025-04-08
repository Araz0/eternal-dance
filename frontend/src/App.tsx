import './App.css'
import Paragraph from './components/Word'
import Header from './components/Header/Header'

function App() {
  return (
    <>
      <Header />
      <div style={{ height: '100vh' }}></div>
      <Paragraph paragraph='An audiovisual installation where movement and emotion intertwine in an eternal dance of transformation.' />
      <div style={{ height: '100vh' }}></div>
    </>
  )
}

export default App
