import React, { useEffect, useState } from "react";

function SpLoader({ message = "Loaded!", duration = 3000, image = "../images/Spin@1x-1.0s-50px-50px.svg" }) {
  const [text, setText] = useState('');
  const [showImg, setShowImg] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowImg(false);
      setText(message);
    }, duration);

    return () => clearTimeout(timer); 
  }, [duration, message]);

  return (
    <div className="loader-wrapper">
      {showImg ? (
        <img src={image} alt="Loading..." className="spinner" />
      ) : (
        <h3>{text}</h3>
      )}
    </div>
  );
}

export default SpLoader;
