import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
    console.log("Navbar rendering...");
  return (
    <div className="navbar bg-gray-100 shadow-sm">
        <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">EventMan</Link>
        </div>
        <div className="flex-none">
            <ul className="menu menu-horizontal px-1">
                <li><Link to="/events">Events</Link></li>
                {/* Static links for now */}
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/profile">Profile (Test)</Link></li>
                <li><Link to="/create-event">Create (Test)</Link></li>
            </ul>
        </div>
    </div>
  )
}

export default Navbar