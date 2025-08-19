import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/training-mission.css';

function TrainingMissionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const cameFromMain = location.state?.scenario ? true : false;

  const handleYes = () => {
    console.log("Launching simulation...");
  };

  const handleNo = () => {
    navigate('/');
  };

  if (cameFromMain) {
    return (
      <div className="mission-page" style={{ paddingTop: '80px', color: 'white' }}>
        <div className="simulation-start-card">
          <h2>Starting Simulation</h2>
          <button className="start-button" onClick={handleYes}>Launch Scenario</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mission-page" style={{ paddingTop: '80px', color: 'white' }}>
      <div className="simulation-start-card">
        <h2>Would you like to start a simulation?</h2>
        <button className="start-button" onClick={handleYes}>Yes</button>
        <button className="back-button" onClick={handleNo}>No</button>
      </div>
    </div>
  );
}

export default TrainingMissionPage;
