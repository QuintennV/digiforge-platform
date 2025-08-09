import React, { useState } from 'react';
import TrainingMission from './training_mission.jsx';
import TrainingProgress from './training_progress.jsx';

function TrainingDashboard() {
  const [selectedMission, setSelectedMission] = useState('');

  return (
    <div className="dashboard-container">
      <TrainingMission onSelect={setSelectedMission} />
      <TrainingProgress userSelection={selectedMission} />
    </div>
  );
}

export default TrainingDashboard;
