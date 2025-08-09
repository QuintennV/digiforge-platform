import React from 'react';
import "../css/DropdownItem.css"

function DropdownItem({ text, onClick }) {
  return (
    <li className="dropdownItem">
      <button onClick={onClick} className="dropdown-link">
        {text}
      </button>
    </li>
  );
}

export default DropdownItem;
