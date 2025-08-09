import React, { useEffect, useState } from 'react';
import '../css/training_progress.css';
import { Link } from 'react-router-dom';
import spinner from '../images/Spin@1x-1.0s-50px-50px.svg'; 

function TrainingProgress({ userSelection }) {
  const [info, setInfo] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userSelection) return;

    const loadMissionInfo = async () => {
      setLoading(true);
      setError(null);

      try {
        await new Promise((res) => setTimeout(res, 700));

        const filenameMap = {
          'Normal Operation': 'normal.txt',
          'Cyberattack': 'cyber_attack.txt',
          'Sensor Diagnosis': 'sensor_diagnosis.txt',
          'Maintenance': 'maintenance.txt',
        };

        const filename = filenameMap[userSelection];
        if (!filename) throw new Error('Mission file not found');

        const response = await fetch(`/text_files/${filename}`);
        if (!response.ok) throw new Error('Failed to fetch mission file');

        const content = await response.text();
        setInfo(content);
      } catch (err) {
        console.error(err);
        setError('Failed to load mission information');
        setInfo('');
      } finally {
        setLoading(false);
      }
    };

    loadMissionInfo();
  }, [userSelection]);

  return (
    <div className="progress-panel">
      <h2 className="panel-title">Mission Details</h2>
      
      {loading && (
        <div className="loader-wrapper">
          <img src={spinner} alt="Loading..." className="spinner" />
          <p>Loading {userSelection}...</p>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {!loading && !error && info && (
        <>
          <h3>{userSelection}</h3>
          <p>{info}</p>
          <Link
            to="/training-missions"
            state={{ scenario: userSelection }}
            className="nav-button"
          >
            Would you like to start a simulation?
          </Link>
        </>
      )}

      {!userSelection && <p>Please select a mission to view details.</p>}
    </div>
  );
}

export default TrainingProgress;
