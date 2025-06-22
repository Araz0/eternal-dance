import { Routes, Route, useLocation } from "react-router-dom";
import "./variables.css";
import Gallery from "./pages/Gallery";
import Home from "./pages/Home";
import Team from "./pages/Team";
import Imprint from "./pages/Imprint";
import { AnimatePresence } from "framer-motion";

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" index element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/team" element={<Team />} />
        <Route path="/imprint" element={<Imprint />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
