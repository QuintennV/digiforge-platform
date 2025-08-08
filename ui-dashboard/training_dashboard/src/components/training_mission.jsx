import React from 'react';
import '../css/training_mission.css';

const missions = [
  'Normal Operation',
  'Cyberattack',
  'Sensor Diagnosis',
  'Maintenance',
];

function TrainingMission({ onMissionSelect, selected, disabled = false }) {
  return (
    <div className="side-panel">
      <h2 className="panel-title">Training Missions</h2>
      <ul className="mission-list">
        {missions.map((mission) => (
          <li
            key={mission}
            className={`mission-item 
                        ${selected === mission ? 'active' : ''} 
                        ${disabled ? 'disabled' : ''}`}
            onClick={() => {
              if (!disabled) onMissionSelect(mission);
            }}
          >
            {mission}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TrainingMission;
