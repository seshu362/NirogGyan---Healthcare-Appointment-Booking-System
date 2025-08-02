import React, { Component } from 'react'
import { FaTimes, FaCalendarAlt, FaClock, FaUser, FaEnvelope } from 'react-icons/fa'
import './index.css'

class BookingForm extends Component {
  state = {
    patientName: '',
    email: '',
    appointmentDate: '',
    appointmentTime: '',
    isSubmitting: false,
    showSuccess: false,
    errors: {},
    minDate: ''
  }

  componentDidMount() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0]
    this.setState({ minDate: today })
  }

  validateForm = () => {
    const { patientName, email, appointmentDate, appointmentTime } = this.state
    const errors = {}

    if (!patientName.trim()) {
      errors.patientName = 'Patient name is required'
    } else if (patientName.trim().length < 2) {
      errors.patientName = 'Name must be at least 2 characters'
    }

    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!appointmentDate) {
      errors.appointmentDate = 'Appointment date is required'
    } else {
      const selectedDate = new Date(appointmentDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        errors.appointmentDate = 'Please select a future date'
      }
    }

    if (!appointmentTime) {
      errors.appointmentTime = 'Appointment time is required'
    }

    this.setState({ errors })
    return Object.keys(errors).length === 0
  }

  onChangeInput = event => {
    const { name, value } = event.target
    this.setState({ 
      [name]: value,
      errors: { ...this.state.errors, [name]: '' } // Clear error when user starts typing
    })
  }

  onSubmitForm = async event => {
    event.preventDefault()
    
    if (!this.validateForm()) {
      return
    }

    const { doctorData, onSuccess } = this.props
    const { patientName, email, appointmentDate, appointmentTime } = this.state

    this.setState({ isSubmitting: true })

    try {
      const response = await fetch('http://localhost:3000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctorId: doctorData.id,
          patientName: patientName.trim(),
          email: email.trim(),
          appointmentDate,
          appointmentTime
        })
      })

      if (response.ok) {
        this.setState({ showSuccess: true, isSubmitting: false })
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        const errorData = await response.json()
        this.setState({ 
          isSubmitting: false,
          errors: { submit: errorData.error || 'Failed to book appointment' }
        })
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      this.setState({ 
        isSubmitting: false,
        errors: { submit: 'Network error. Please try again.' }
      })
    }
  }

  getAvailableTimeSlots = () => {
    return [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      '18:00', '18:30', '19:00', '19:30'
    ]
  }

  renderSuccessMessage = () => (
    <div className="success-container">
      <div className="success-icon">✓</div>
      <h3>Appointment Booked Successfully!</h3>
      <p>Your appointment has been confirmed.</p>
      <p>You will receive a confirmation email shortly.</p>
    </div>
  )

  renderBookingForm = () => {
    const { doctorData, onClose } = this.props
    const { 
      patientName, 
      email, 
      appointmentDate, 
      appointmentTime, 
      isSubmitting, 
      errors,
      minDate 
    } = this.state

    const timeSlots = this.getAvailableTimeSlots()

    return (
      <div className="booking-form-content">
        <div className="form-header">
          <h3>Book Appointment with Dr. {doctorData.name}</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="doctor-summary">
          <img 
            src={doctorData.profileImage} 
            alt={doctorData.name}
            className="doctor-thumb"
          />
          <div className="doctor-info">
            <h4>{doctorData.name}</h4>
            <p>{doctorData.specialization}</p>
            <p className="consultation-fee">₹{doctorData.consultationFee} consultation fee</p>
          </div>
        </div>

        <form onSubmit={this.onSubmitForm} className="booking-form">
          <div className="form-group">
            <label htmlFor="patientName">
              <FaUser className="input-icon" />
              Patient Name *
            </label>
            <input
              type="text"
              id="patientName"
              name="patientName"
              value={patientName}
              onChange={this.onChangeInput}
              placeholder="Enter patient's full name"
              className={errors.patientName ? 'error' : ''}
            />
            {errors.patientName && <span className="error-text">{errors.patientName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="input-icon" />
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={this.onChangeInput}
              placeholder="Enter email address"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="appointmentDate">
                <FaCalendarAlt className="input-icon" />
                Appointment Date *
              </label>
              <input
                type="date"
                id="appointmentDate"
                name="appointmentDate"
                value={appointmentDate}
                onChange={this.onChangeInput}
                min={minDate}
                className={errors.appointmentDate ? 'error' : ''}
              />
              {errors.appointmentDate && <span className="error-text">{errors.appointmentDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="appointmentTime">
                <FaClock className="input-icon" />
                Appointment Time *
              </label>
              <select
                id="appointmentTime"
                name="appointmentTime"
                value={appointmentTime}
                onChange={this.onChangeInput}
                className={errors.appointmentTime ? 'error' : ''}
              >
                <option value="">Select time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.appointmentTime && <span className="error-text">{errors.appointmentTime}</span>}
            </div>
          </div>

          {errors.submit && <div className="submit-error">{errors.submit}</div>}

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  render() {
    const { showSuccess } = this.state

    return (
      <div className="booking-form-overlay">
        <div className="booking-form-modal">
          {showSuccess ? this.renderSuccessMessage() : this.renderBookingForm()}
        </div>
      </div>
    )
  }
}

export default BookingForm