import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DropdownItem from './DropdownItem';
import "../css/DropdownMenu.css";

// Import your image (adjust path as needed)
import menuIcon from '../images/dropdown.jpg';

function DropdownMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div className="menu-container" ref={menuRef}>
      <div
        className="menu-trigger"
        onClick={() => setOpen((prev) => !prev)}
        style={{ cursor: 'pointer' }}
      >
        <img src={menuIcon} alt="Menu" style={{ width: 30, height: 30 }} />
      </div>

      <div className={`dropdown-menu ${open ? 'active' : 'inactive'}`}>
        <ul>
          <DropdownItem text="Training Missions" onClick={() => handleNavigate('/training-missions')} />
          <DropdownItem text="Live Factory Map" onClick={() => handleNavigate('/live-factory-map')} />
        </ul>
      </div>
    </div>
  );
}

export default DropdownMenu;
