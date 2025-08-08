import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./pages/home"
import TrainingMissionPage from './pages/training-mission';
import './css/App.css'
import NavBar from './components/navbar'

function App() {
  return (
    <div>
      <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/training-missions" element={<TrainingMissionPage />} />
          <Route path='live-factory-map'/>
        </Routes>
    </div>
  );
}

export default App;
