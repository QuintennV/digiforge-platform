import React, { useState } from 'react';
import TrainingMission from '../components/training_mission.jsx';
import TrainingProgress from '../components/training_progress.jsx';

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
