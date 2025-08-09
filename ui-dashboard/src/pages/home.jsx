import React, { useState } from 'react';
import "../css/home.css";
import TrainingMission from '../components/training_mission.jsx';
import SvgElement from '../components/live_factory_map.jsx';
import TrainingProgress from '../components/training_progress.jsx';

function Home() {
  const [selectedMission, setSelectedMission] = useState('');

  return (
    <div className="home-layout">
      <div className="dashboard-layout">
        <TrainingMission onMissionSelect={setSelectedMission} selected={selectedMission} />
      </div>

      <div className="factory-map">
        <h2 className="panel-title">Live Factory Map</h2>
        <SvgElement />
      </div>

      <div className="right_side">
        <TrainingProgress userSelection={selectedMission} />
      </div>
    </div>
  );
}

export default Home;
