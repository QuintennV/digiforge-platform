import "../css/navbar.css";
import { Link } from "react-router-dom";
import DropdownMenu from "./DropdownMenu.jsx";

function NavBar() {
    return <nav className="navbar">
        <div className="navbar-brand">
            <Link to="/">Training Dashboard</Link>
        </div>
        <div className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            <DropdownMenu />
        </div>
    </nav>
}

export default NavBar