import React from 'react'
import { Link } from 'react-router-dom'
import { FaStethoscope, FaUserCircle } from 'react-icons/fa'
import './index.css'

const Header = () => {
  return (
    <header className="header-container">
      <div className="header-content">
        <Link to="/" className="logo-container">
          <FaStethoscope className="logo-icon" />
          <h2 className="logo-text">NirogGyan</h2>
        </Link>
        
        <nav className="nav-container">
          <Link to="/" className="nav-link">
            Find Doctors
          </Link>
          <div className="user-profile">
            <FaUserCircle className="profile-icon" />
            <span className="profile-text">Profile</span>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header