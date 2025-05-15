import { Routes, Route } from 'react-router-dom'
import { Gallery, Home, Team, Imprint } from './pages'
import './variables.css'

function App() {
  return (
    <Routes>
      <Route path='/' index element={<Home />} />
      <Route path='/gallery' element={<Gallery />} />
      <Route path='/team' element={<Team />} />
      <Route path='/imprint' element={<Imprint />} />
    </Routes>
  )
}

export default App
