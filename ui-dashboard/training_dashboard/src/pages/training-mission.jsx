import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import TrainingMission from '../components/training_mission.jsx';
import '../css/training_mission.css';
import '../css/training-mission.css';

function TrainingMissionPage() {
  const location = useLocation();
  const initialScenario = location.state?.scenario || null;

  const [scenario, setScenario] = useState(initialScenario);

  const handleMissionSelect = (mission) => {
    if (!scenario) {
      setScenario(mission);
    }
  };

  return (
<div className="mission-page" >
  <div>
    <TrainingMission
      selected={scenario}
      onMissionSelect={handleMissionSelect}
      disabled={!!scenario}
    />
  </div>
      
  <div style={{ width: '70%', paddingLeft: '110px', color: 'white' }}>
    {scenario ? (
      <div className="simulation-start-card">
        <h2>Starting Simulation: {scenario}</h2>
        <button className="start-button">Launch Scenario</button>
        <button
          className="back-button"
          onClick={() => setScenario(null)}
        >
          Choose Another Mission
        </button>
      </div>
    ) : (
      <p>Please select a training scenario to begin the simulation.</p>
    )}
  </div>
</div>

  );
}

export default TrainingMissionPage;
