import { Routes, Route } from 'react-router-dom'
import { Gallery, Home, Team } from './pages'
import './variables.css'

function App() {
  return (
    <Routes>
      <Route path='/' index element={<Home />} />
      <Route path='/gallery' element={<Gallery />} />
      <Route path='/team' element={<Team />} />
    </Routes>
  )
}

export default App
