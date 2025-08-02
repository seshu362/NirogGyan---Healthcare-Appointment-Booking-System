import React, { Component } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Header from './components/Header'
import DoctorCard from './components/DoctorCard'
import DoctorProfile from './components/DoctorProfile'


import { IoSearch } from 'react-icons/io5'
import { FaFilter } from 'react-icons/fa'

import './App.css'

class App extends Component {
  state = {
    doctorsData: [],
    searchInputValue: '',
    selectedSpecialization: 'All',
    isLoading: true,
    specializations: ['All']
  }

  componentDidMount() {
    this.getDoctorsData()
  }

  getDoctorsData = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/doctors')
      const doctorsData = await response.json()
      
      // Get unique specializations for filter
      const uniqueSpecializations = ['All', ...new Set(doctorsData.map(doctor => doctor.specialization))]
      
      this.setState({
        doctorsData,
        specializations: uniqueSpecializations,
        isLoading: false
      })
    } catch (error) {
      console.error('Error fetching doctors:', error)
      this.setState({ isLoading: false })
    }
  }

  onChangeSearchInput = event => {
    this.setState({ searchInputValue: event.target.value })
  }

  onChangeSpecializationFilter = event => {
    this.setState({ selectedSpecialization: event.target.value })
  }

  renderDoctorsList = () => {
    const { doctorsData, searchInputValue, selectedSpecialization } = this.state

    let filteredDoctors = doctorsData

    // Filter by search input
    if (searchInputValue) {
      filteredDoctors = filteredDoctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchInputValue.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchInputValue.toLowerCase())
      )
    }

    // Filter by specialization
    if (selectedSpecialization !== 'All') {
      filteredDoctors = filteredDoctors.filter(doctor =>
        doctor.specialization === selectedSpecialization
      )
    }

    if (filteredDoctors.length === 0) {
      return (
        <div className="no-doctors-container">
          <h3>No doctors found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )
    }

    return (
      <div className="doctors-grid">
        {filteredDoctors.map(doctor => (
          <DoctorCard key={doctor.id} doctorDetails={doctor} />
        ))}
      </div>
    )
  }

  renderLoadingView = () => (
    <div className="loading-container">
      <div className="loader"></div>
      <p>Loading doctors...</p>
    </div>
  )

  renderDashboard = () => {
    const { searchInputValue, selectedSpecialization, specializations, isLoading } = this.state

    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Find Your Doctor</h1>
            <p>Book appointments with the best healthcare professionals</p>
          </div>
          
          <div className="search-filter-container">
            <div className="search-container">
              <input
                type="search"
                className="search-input"
                placeholder="Search by doctor name or specialization..."
                value={searchInputValue}
                onChange={this.onChangeSearchInput}
              />
              <IoSearch size={20} className="search-icon" />
            </div>
            
            <div className="filter-container">
              <FaFilter className="filter-icon" />
              <select
                className="specialization-filter"
                value={selectedSpecialization}
                onChange={this.onChangeSpecializationFilter}
              >
                {specializations.map(specialization => (
                  <option key={specialization} value={specialization}>
                    {specialization}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="doctors-section">
          {isLoading ? this.renderLoadingView() : this.renderDoctorsList()}
        </div>
      </div>
    )
  }

  render() {
    return (
      <Router>
        <div className="app-container">
          <Header />
          <Routes>
            <Route path="/" element={this.renderDashboard()} />
            <Route path="/doctor/:id" element={<DoctorProfile />} />
          </Routes>
        </div>
      </Router>
    )
  }
}

export default App