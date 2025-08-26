import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./pages/home.jsx"
import TrainingMissionPage from './pages/training-mission.jsx';
import './css/App.css'
import NavBar from './components/navbar.jsx'
import LiveFactory from './pages/live_factory.jsx';

function App() {
  return (
    <div>
      <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/training-missions" element={<TrainingMissionPage />} />
          <Route path='live-factory-map' element={<LiveFactory/>}/>
        </Routes>
    </div>
  );
}

export default App;
