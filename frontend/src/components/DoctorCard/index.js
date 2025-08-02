import React from 'react'
import { Link } from 'react-router-dom'
import { FaStar, FaRupeeSign, FaClock } from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'
import './index.css'

const DoctorCard = props => {
  const { doctorDetails } = props
  const {
    id,
    name,
    specialization,
    profileImage,
    experience,
    qualification,
    availabilityStatus,
    consultationFee,
    rating
  } = doctorDetails

  const getStatusClass = status => {
    switch (status) {
      case 'Available Today':
        return 'status-available'
      case 'Fully Booked':
        return 'status-booked'
      case 'On Leave':
        return 'status-leave'
      default:
        return 'status-available'
    }
  }

  const getStatusIcon = status => {
    switch (status) {
      case 'Available Today':
        return '✓'
      case 'Fully Booked':
        return '✕'
      case 'On Leave':
        return '⊘'
      default:
        return '✓'
    }
  }

  return (
    <div className="doctor-card">
      <div className="doctor-image-container">
        <img 
          src={profileImage} 
          alt={name}
          className="doctor-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300/667eea/ffffff?text=Doctor'
          }}
        />
        <div className={`availability-badge ${getStatusClass(availabilityStatus)}`}>
          <span className="status-icon">{getStatusIcon(availabilityStatus)}</span>
          <span className="status-text">{availabilityStatus}</span>
        </div>
      </div>

      <div className="doctor-info">
        <div className="doctor-header">
          <h3 className="doctor-name">{name}</h3>
          <MdVerified className="verified-icon" />
        </div>
        
        <p className="doctor-specialization">{specialization}</p>
        <p className="doctor-qualification">{qualification}</p>
        
        <div className="doctor-stats">
          <div className="stat-item">
            <FaStar className="star-icon" />
            <span>{rating}</span>
          </div>
          <div className="stat-item">
            <FaClock className="clock-icon" />
            <span>{experience}</span>
          </div>
        </div>

        <div className="consultation-fee">
          <FaRupeeSign className="rupee-icon" />
          <span className="fee-amount">{consultationFee}</span>
          <span className="fee-text">consultation fee</span>
        </div>

        <Link 
          to={`/doctor/${id}`} 
          className={`view-profile-btn ${availabilityStatus === 'On Leave' ? 'disabled' : ''}`}
        >
          {availabilityStatus === 'On Leave' ? 'Not Available' : 'View Profile & Book'}
        </Link>
      </div>
    </div>
  )
}

export default DoctorCard