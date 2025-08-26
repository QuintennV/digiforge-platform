import React, { useState } from "react";
import SvgElement from "../components/live_factory_map"; 
import "../css/live-factory.css";

function LiveFactory() {
  const [currentDescriptions, setCurrentDescriptions] = useState([]);

  const anomalyTextColor = "#646cff";

  return (
    <div className="live-factory-container">
      <h2>Live Factory Map</h2>

      {/* Flex container for SVG and description side by side */}
      <div style={{ display: "flex", gap: "1rem" }}>
        {/* SVG wrapper */}
        <div style={{ width: "600px", height: "400px", backgroundColor: "white" }}>
          <SvgElement setCurrentDescriptions={setCurrentDescriptions} />
        </div>

        {/* Dynamic anomaly description panel styled like .side */}
        {currentDescriptions.length > 0 && (
          <div
            style={{
              flex: 1,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              padding: "15px",
              borderRadius: "16px",
              maxHeight: "600px",
              overflowY: "auto",
              boxShadow: "0 0 10px rgba(122, 92, 255, 0.3)",
            }}
          >
            <h3
            style={{
                color: "#61dafb"
            }
            }>Active Anomalies</h3>
            <ul>
              {currentDescriptions.map((desc, i) => (
                <li key={i} style={{ color: anomalyTextColor }}>
                  {desc}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveFactory;
