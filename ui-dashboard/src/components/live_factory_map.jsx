import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import "../css/live-factory.css";

const SvgElement = ({ setCurrentDescriptions }) => {
  const svgRef = useRef(null);
  const [lastAlertId, setLastAlertId] = useState(null);

  // 🔹 dictionary of anomaly explanations
  const anomalyDescriptions = {
    HIGH_TEMP: "The temperature has exceeded the recommneded safe heat of less than 90°C. Cooling is required to prevent any damage to components.",
    HIGH_VIBRATION: "The vibration level has exceeded the safety recomendation level of 3.5. There is a possibilty of imbalance or wear.",
    HiGH_POWER_DRAW: "The amount of power being drawn has exceeded the safety recommendation level of 400W. Potential overload/fault in the system.",
    CRITICAL: "Critical anomaly detected. Shutdown may be required.",
    WARNING: "Warning condition detected. Monitor system closely."
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Triangle generator
    const triangle = d3.symbol().type(d3.symbolTriangle).size(800);

    const fetchAlerts = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/alerts");
        const data = await res.json();

        if (!data || data.length === 0) {
          svg.selectAll("*").remove();
          setCurrentDescriptions([]); // clear panel
          return;
        }

        const latest = data[data.length - 1];
        if (lastAlertId === latest.cycle_id) return;
        setLastAlertId(latest.cycle_id);

        const anomalies = latest.anomalies || [];
        const containerWidth = svgRef.current.clientWidth;
        const containerHeight = svgRef.current.clientHeight;
        const padding = 40;
        const spacing =
          anomalies.length > 1
            ? (containerWidth - 2 * padding) / (anomalies.length - 1)
            : 0;

        // Flash background when anomalies exist
        svg
          .transition()
          .duration(200)
          .style("background-color", anomalies.length > 0 ? "orange" : "white")
          .transition()
          .duration(200)
          .style("background-color", "white");

        // Remove old shapes and labels
        svg.selectAll("path").remove();
        svg.selectAll("text").remove();

        // Add triangles
        svg
          .selectAll("path")
          .data(anomalies)
          .enter()
          .append("path")
          .attr("d", triangle)
          .attr("fill", d => {
            switch (d.severity) {
              case "CRITICAL":
                return "red";
              case "WARNING":
                return "orange";
              default:
                return "grey";
            }
          })
          .attr(
            "transform",
            (_, i) => `translate(${padding + i * spacing}, ${containerHeight / 2})`
          )
          .attr("opacity", 0)
          .transition()
          .duration(300)
          .attr("opacity", 1);

        // Add labels below triangles
        svg
          .selectAll("text")
          .data(anomalies)
          .enter()
          .append("text")
          .attr("x", (_, i) => padding + i * spacing)
          .attr("y", containerHeight / 2 + 30)
          .attr("text-anchor", "middle")
          .attr("font-size", "14px")
          .attr("fill", "black")
          .each(function (d) {
            const t = d3.select(this);
            t.text("");
            const words = d.type.split("_");
            words.forEach((w, i) => {
              t.append("tspan")
                .attr("x", t.attr("x"))
                .attr("dy", i === 0 ? 0 : 16)
                .text(w);
            });
          });

        // 🔹 Update descriptions in parent
        if (anomalies.length > 0) {
          const descs = anomalies.map(
            a =>
              anomalyDescriptions[a.type] ||
              anomalyDescriptions[a.severity] ||
              `Unknown anomaly: ${a.type}`
          );
          setCurrentDescriptions(descs);
        } else {
          setCurrentDescriptions([]);
        }
      } catch (err) {
        console.error("❌ Fetch error:", err);
      }
    };

    // Poll every second
    const interval = setInterval(fetchAlerts, 1000);
    return () => clearInterval(interval);
  }, [lastAlertId, setCurrentDescriptions]);

  return <svg ref={svgRef} className="svg-container" />;
};

export default SvgElement;
