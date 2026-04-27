import React from 'react';
import '../Styles/Nav_Bar.css'; // We will create this next

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="nav-logo">DyScreen</div>
            <ul className="nav-links">
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
                {/* <li><a href="/login">Login</a></li> */}
            </ul>
        </nav>
    );
}