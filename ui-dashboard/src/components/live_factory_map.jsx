import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import "../css/live-factory.css"

const SvgElement = () => {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current)

  }, []);

  return (
    <svg ref={svgRef} className="svg-container" />
  );
};

    
export default SvgElement;
