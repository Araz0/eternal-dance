import { Routes, Route } from 'react-router-dom'
import { Gallery, Home } from './pages'

function App() {
  return (
    <Routes>
      <Route path='/' index element={<Home />} />
      <Route path='/gallery' element={<Gallery />} />
    </Routes>
  )
}

export default App
