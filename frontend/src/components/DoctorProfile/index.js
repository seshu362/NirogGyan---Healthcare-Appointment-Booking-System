import React, { Component } from 'react'
import { useParams, Link } from 'react-router-dom'
import BookingForm from '../BookingForm'
import { FaStar, FaRupeeSign, FaClock, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa'
import { MdVerified, MdLocationOn } from 'react-icons/md'
import './index.css'


const DoctorProfileWithParams = () => {
  const { id } = useParams()
  return <DoctorProfile doctorId={id} />
}

class DoctorProfile extends Component {
  state = {
    doctorData: null,
    isLoading: true,
    showBookingForm: false,
    appointments: []
  }

  componentDidMount() {
    this.getDoctorDetails()
    this.getDoctorAppointments()
  }

  getDoctorDetails = async () => {
    const { doctorId } = this.props
    try {
      const response = await fetch(`http://localhost:3000/api/doctors/${doctorId}`)
      if (response.ok) {
        const doctorData = await response.json()
        this.setState({ doctorData, isLoading: false })
      } else {
        console.error('Doctor not found')
        this.setState({ isLoading: false })
      }
    } catch (error) {
      console.error('Error fetching doctor details:', error)
      this.setState({ isLoading: false })
    }
  }

  getDoctorAppointments = async () => {
    const { doctorId } = this.props
    try {
      const response = await fetch(`http://localhost:3000/api/appointments/${doctorId}`)
      if (response.ok) {
        const appointments = await response.json()
        this.setState({ appointments })
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

  onClickBookAppointment = () => {
    this.setState({ showBookingForm: true })
  }

  onCloseBookingForm = () => {
    this.setState({ showBookingForm: false })
  }

  onBookingSuccess = () => {
    this.setState({ showBookingForm: false })
    this.getDoctorAppointments() // Refresh appointments
  }

  getAvailableTimeSlots = () => {
    const { doctorData } = this.state
    if (!doctorData || !doctorData.schedules) return []

    // Group schedules by day
    const schedulesByDay = {}
    doctorData.schedules.forEach(schedule => {
      if (!schedulesByDay[schedule.dayOfWeek]) {
        schedulesByDay[schedule.dayOfWeek] = []
      }
      schedulesByDay[schedule.dayOfWeek].push({
        startTime: schedule.startTime,
        endTime: schedule.endTime
      })
    })

    return schedulesByDay
  }

  renderLoadingView = () => (
    <div className="loading-container">
      <div className="loader"></div>
      <p>Loading doctor details...</p>
    </div>
  )

  renderDoctorNotFound = () => (
    <div className="not-found-container">
      <h3>Doctor not found</h3>
      <Link to="/" className="back-link">
        <FaArrowLeft /> Back to doctors list
      </Link>
    </div>
  )

  renderScheduleSection = () => {
    const schedulesByDay = this.getAvailableTimeSlots()
    const days = Object.keys(schedulesByDay)

    if (days.length === 0) {
      return (
        <div className="schedule-section">
          <h4>Schedule not available</h4>
        </div>
      )
    }

    return (
      <div className="schedule-section">
        <h4><FaCalendarAlt /> Available Schedule</h4>
        <div className="schedule-grid">
          {days.map(day => (
            <div key={day} className="schedule-day">
              <h5>{day}</h5>
              <div className="time-slots">
                {schedulesByDay[day].map((slot, index) => (
                  <span key={index} className="time-slot">
                    {slot.startTime} - {slot.endTime}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  render() {
    const { doctorData, isLoading, showBookingForm } = this.state

    if (isLoading) {
      return this.renderLoadingView()
    }

    if (!doctorData) {
      return this.renderDoctorNotFound()
    }

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
    } = doctorData

    const isAvailable = availabilityStatus === 'Available Today'

    return (
      <div className="doctor-profile-container">
        <div className="profile-header">
          <Link to="/" className="back-link">
            <FaArrowLeft /> Back to doctors
          </Link>
        </div>

        <div className="profile-content">
          <div className="doctor-profile-card">
            <div className="profile-image-section">
              <img 
                src={profileImage} 
                alt={name}
                className="profile-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x400/667eea/ffffff?text=Doctor'
                }}
              />
              <div className={`availability-status ${availabilityStatus === 'Available Today' ? 'available' : availabilityStatus === 'Fully Booked' ? 'booked' : 'leave'}`}>
                {availabilityStatus}
              </div>
            </div>

            <div className="profile-details">
              <div className="doctor-header">
                <h1 className="doctor-name">{name}</h1>
                <MdVerified className="verified-icon" />
              </div>

              <p className="doctor-specialization">{specialization}</p>
              <p className="doctor-qualification">{qualification}</p>

              <div className="doctor-metrics">
                <div className="metric-item">
                  <FaStar className="metric-icon star" />
                  <span className="metric-value">{rating}</span>
                  <span className="metric-label">Rating</span>
                </div>
                <div className="metric-item">
                  <FaClock className="metric-icon" />
                  <span className="metric-value">{experience}</span>
                  <span className="metric-label">Experience</span>
                </div>
                <div className="metric-item">
                  <FaRupeeSign className="metric-icon fee" />
                  <span className="metric-value">{consultationFee}</span>
                  <span className="metric-label">Consultation Fee</span>
                </div>
              </div>

              <div className="about-section">
                <h4>About Dr. {name.split(' ')[1]}</h4>
                <p>
                  Dr. {name.split(' ')[1]} is a highly experienced {specialization.toLowerCase()} with {experience} of practice. 
                  Specialized in providing comprehensive healthcare services with a focus on patient care and modern treatment approaches.
                </p>
              </div>

              {this.renderScheduleSection()}

              <button
                className={`book-appointment-btn ${!isAvailable ? 'disabled' : ''}`}
                onClick={this.onClickBookAppointment}
                disabled={!isAvailable}
              >
                {isAvailable ? 'Book Appointment' : 'Not Available'}
              </button>
            </div>
          </div>
        </div>

        {showBookingForm && (
          <BookingForm
            doctorData={doctorData}
            onClose={this.onCloseBookingForm}
            onSuccess={this.onBookingSuccess}
          />
        )}
      </div>
    )
  }
}

export default DoctorProfileWithParams