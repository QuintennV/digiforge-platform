import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/training-mission.css';

function TrainingMissionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cycleResult, setCycleResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const cameFromMain = location.state?.scenario ? true : false;

  const handleYes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:5000/api/run-cycle');
      const data = await response.json();

      // Pick CNC mill data if available
      let selected = data.find(msg => msg.machine && msg.machine.includes("CNC")) || {};

      // Merge any missing fields from other machines to avoid undefined values in side panel
      data.forEach(msg => {
        Object.keys(msg).forEach(key => {
          if (!(key in selected)) selected[key] = msg[key];
        });
      });

      setCycleResult(selected);

    } catch (error) {
      console.error('Error running cycle:', error);
      setCycleResult({ error: 'Failed to fetch cycle data' });
    } finally {
      setLoading(false);
    }
  };

  const handleNo = () => {
    navigate('/');
  };

  return (
    <div className="mission-page">
      {/* MAIN COLUMN */}
      <div className="simulation-start-card" style={{ flex: 2 }}>
        <h2>{cameFromMain ? 'Starting Simulation' : 'Would you like to start a simulation?'}</h2>
        <button className="start-button" onClick={handleYes}>Launch Scenario</button>
        {!cameFromMain && <button className="back-button" onClick={handleNo}>No</button>}

        {loading && <p style={{ color: 'yellow' }}>Running cycle...</p>}

        {cycleResult && (
          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#222', borderRadius: '5px' }}>
            {cycleResult.error ? (
              <p style={{ color: 'red' }}>{cycleResult.error}</p>
            ) : (
              <>
                <h3>Cycle Result (Raw JSON)</h3>
                <pre
                  style={{
                    color: 'lightgreen',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}
                >
                  {JSON.stringify(cycleResult, null, 2)}
                </pre>
              </>
            )}
          </div>
        )}
      </div>

      {/* SIDE PANEL */}
      {cycleResult && (
        <div className="side">
          <h3 style={{ color: '#61dafb' }}>Information Explained</h3>

          {cycleResult.spindle_temp !== undefined && (
            <p>
              Spindle Temp: {cycleResult.spindle_temp} °C –{' '}
              {cycleResult.spindle_temp < 70
                ? "The temperature is at a normal level."
                : cycleResult.spindle_temp <= 90
                ? "Slightly high temperature. It is advised to check on the system to remove the possibility of overheating."
                : "Warning! High temperature has been detected. Immediately check the system due to the risk of spindle damage."}
            </p>
          )}

          {cycleResult.vibration !== undefined && (
            <p>
              Vibration: {cycleResult.vibration} g –{' '}
              {cycleResult.vibration < 1.5
                ? "Vibration is within normal range."
                : cycleResult.vibration <= 3.5
                ? "Vibration is at an elevated level, which could lead to possible mechanical wear. It is advised to check your system as soon as possible"
                : "Critical vibration detected. Immediate inspection is recommended."}
            </p>
          )}

          {cycleResult.power_draw !== undefined && (
            <p>
              Power Draw: {cycleResult.power_draw} W –{' '}
              {cycleResult.power_draw < 350
                ? "This level of power consumption is normal and does not need checking."
                : cycleResult.power_draw < 400
                ? "This level of power consumption is slightly higher than normal. It is advisable to check the system to ensure there's no damage"
                : "High power comsumption detected! There could be a possible overload or fault, please check the system immediately."}
            </p>
          )}

          {cycleResult.inspection !== undefined && (
            <p>
              Inspection: {cycleResult.inspection} –{' '}
              {cycleResult.inspection === "PASS"
                ? "Acceptable quality that generally means that all aspects of the system are within the recommended range."
                : "This signals that a defect has been detected, typically occurs when large aspects of the system are above the recommended values."}
            </p>
          )}

          {cycleResult.operation && <p>Operation: {cycleResult.operation} – Current task performed by the CNC mill, e.g., cutting, drilling, or idle.</p>}
          {cycleResult.tool_id && <p>Tool ID: {cycleResult.tool_id} – Identifies the tool currently used in the CNC mill. Certain operations require specific tools.</p>}
          {cycleResult.robotic_arm_task && <p>Robotic Task: {cycleResult.robotic_arm_task} – Task performed by the robotic arm, like loading material, unloading parts, or assembling components.</p>}
          {cycleResult.part_id && <p>Part ID: {cycleResult.part_id} – Identifier of the part currently processed on the conveyor belt.</p>}
          {cycleResult.inspection_result && <p>Inspection Result: {cycleResult.inspection_result} – Result from the inspection system. Highlights quality check outcome for the part.</p>}
        </div>
      )}
    </div>
  );
}

export default TrainingMissionPage;
