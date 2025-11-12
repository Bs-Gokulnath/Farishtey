import React, { useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Alert from "../components/Alert";
import useAlert from "../components/useAlert";
import Loading, { ButtonLoading, CardLoading } from "../components/Loading";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RegisterCertificate = () => {
  const { alert, showSuccess, showError, hideAlert } = useAlert();
  const [step, setStep] = useState(1); // 1: City Selection, 2: Session Selection, 3: Personal Details
  const [selectedCity, setSelectedCity] = useState("");
  const [availableSessions, setAvailableSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    chapter: "",
    session_id: "",
    date_of_birth: "",
    phone: "",
    email: ""
  });
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // List of major Indian cities
  const cities = [
  "Agra", "Ahmedabad", "Ajmer", "Amaravati", "Balasore", "Bengaluru", "Bhopal",
  "Bhavnagar", "Bhubaneswar", "Chandigarh", "Chennai", "Chhatrapati Sambhajinagar",
  "Coimbatore", "Dehradun", "Delhi", "Dindigul", "Durg", "Erode", "Goa", "Gurugram",
  "Guwahati", "Gwalior", "Hosur", "Hubballi", "Hyderabad", "Indore", "Jaipur",
  "Jabalpur", "Jamshedpur", "Kanpur", "Karur", "Kochi", "Kolkata", "Kota", "Kozhikode",
  "Lucknow", "Madurai", "Mangaluru", "Mumbai", "Mysuru", "Nagaland", "Nagpur", "Nashik",
  "Noida", "Puducherry", "Pune", "Raipur", "Rajkot", "Ranchi", "Salem", "Sikkim",
  "Siliguri", "Sivakasi", "Surat", "Thoothukudi", "Tirupur", "Tirupati", "Trichy",
  "Trivandrum", "Vadodara", "Varanasi", "Vellore", "Vizag"
  ].sort();

  // Fetch sessions for selected city
  const fetchSessionsForCity = async (city) => {
    setSessionsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}sessions`);
      const sessions = response.data || [];
      
      // Get chapter code from city name (first 3 characters, uppercase)
      const chapterCode = city.substring(0, 3).toUpperCase();
      
      // Filter sessions: approved but not completed, and match chapter code in booking_id
      const filteredSessions = sessions.filter(session => {
        const bookingId = session.booking_id || '';
        const sessionChapterCode = bookingId.substring(0, 3).toUpperCase();
        
        return session.allotment_status === "approved" && 
               sessionChapterCode === chapterCode;
      });
      
      setAvailableSessions(filteredSessions);
      
      if (filteredSessions.length === 0) {
        showError("No incomplete sessions found for the selected chapter.");
      }
    } catch {
      showError("Failed to load sessions. Please try again.");
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleCitySelect = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    if (city) {
      fetchSessionsForCity(city);
      setStep(2);
    }
  };

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    // Automatically set chapter and session_id in form data
    setFormData(prev => ({
      ...prev,
      chapter: selectedCity,
      session_id: session.session_id
    }));
    setStep(3);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePersonalDetails = () => {
    if (!formData.name.trim()) {
      showError("Name is required");
      return false;
    }
    
    // Optional validation for other fields - only validate if they are filled
    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      if (dob > today) {
        showError("Date of birth cannot be in the future");
        return false;
      }
    }
    
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      showError("Please enter a valid 10-digit phone number");
      return false;
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showError("Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePersonalDetails()) {
      return;
    }

    setLoading(true);
    setIsSubmitting(true);
    try {
      const participantData = {
        name: formData.name,
        chapter: formData.chapter, // City selected in step 1
        session_id: formData.session_id, // Session selected in step 2
        phone: formData.phone ? `+91-${formData.phone}` : "",
        email: formData.email || "",
        age: formData.date_of_birth ? new Date().getFullYear() - new Date(formData.date_of_birth).getFullYear() : null
      };
      
      // Remove empty fields to avoid backend validation issues
      Object.keys(participantData).forEach(key => {
        if (participantData[key] === "" || participantData[key] === null || participantData[key] === undefined) {
          delete participantData[key];
        }
      });
      
      await axios.post(`${API_BASE_URL}/add-participant`, participantData);
      
      showSuccess("🎉 Certificate registration successful!");
      
      // Reset form
      setStep(1);
      setSelectedCity("");
      setAvailableSessions([]);
      setSelectedSession(null);
      setFormData({
        name: "",
        chapter: "",
        session_id: "",
        date_of_birth: "",
        phone: "",
        email: ""
      });
    } catch {
      showError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const goBack = () => {
    if (step === 3) {
      setStep(2);
      setSelectedSession(null);
    } else if (step === 2) {
      setStep(1);
      setSelectedCity("");
      setAvailableSessions([]);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Alert
        isVisible={alert.isVisible}
        message={alert.message}
        type={alert.type}
        onClose={hideAlert}
        duration={alert.duration}
        position={alert.position}
      />

      <Header />
      
      <div className="max-w-4xl mx-auto py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-800 mb-4">
            Certificate Registration
          </h1>
          
          {/* Step Indicator */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>1</div>
                <span className="ml-2 font-medium">Select City</span>
              </div>
              <div className={`w-8 h-px ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>2</div>
                <span className="ml-2 font-medium">Select Session</span>
              </div>
              <div className={`w-8 h-px ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>3</div>
                <span className="ml-2 font-medium">Personal Details</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-12 border border-gray-100">
          {/* Step 1: City Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2"></h2>
                {/* <p className="text-gray-600">Choose the city where you attended the training session</p> */}
              </div>
              
              <div>
                {/* <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                  Select City
                </label> */}
                <select
                  id="city"
                  value={selectedCity}
                  onChange={handleCitySelect}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white text-gray-900"
                  required
                >
                  <option value="">-- Select Your City --</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Session Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Session</h2>
                  {/* <p className="text-gray-600">Choose the training session you attended in {selectedCity}</p> */}
                </div>
                <button
                  onClick={goBack}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
                >
                  ← Back to City Selection
                </button>
              </div>

              {sessionsLoading ? (
                <Loading message="Loading available sessions..." size="default" />
              ) : availableSessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Sessions Available</h3>
                  <p className="text-gray-600">No incomplete sessions found for {selectedCity} chapter. Please select a different city.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {availableSessions.map((session) => (
                    <div
                      key={session.session_id}
                      className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition duration-200 cursor-pointer"
                      onClick={() => handleSessionSelect(session)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Booking ID</label>
                              <p className="text-lg font-semibold text-gray-800">
                                {session.booking_id || `BK-${session.session_id?.slice(-6)}`}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Date</label>
                              <p className="text-lg font-semibold text-gray-800">
                                {formatDate(session.requested_date)}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Venue</label>
                              <p className="text-lg font-semibold text-gray-800">
                                {session.venue || 'Not specified'}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Training Institute</label>
                              <p className="text-lg font-semibold text-gray-800">
                                {session.training_institute || 'Not specified'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Personal Details */}
          {step === 3 && selectedSession && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Personal Details</h2>
                </div>
                <button
                  type="button"
                  onClick={goBack}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
                >
                  ← Back to Session Selection
                </button>
              </div>

              {/* Selected Session Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Selected Session Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Booking ID:</span>
                    <p className="font-medium">{selectedSession.booking_id || `BK-${selectedSession.session_id?.slice(-6)}`}</p>
                  </div>
                  <div>
                    <span className="text-blue-600">Date:</span>
                    <p className="font-medium">{formatDate(selectedSession.requested_date)}</p>
                  </div>
                  <div>
                    <span className="text-blue-600">Chapter:</span>
                    <p className="font-medium">{formData.chapter}</p>
                  </div>
                  <div>
                    <span className="text-blue-600">Session ID:</span>
                    <p className="font-medium text-xs">{formData.session_id?.slice(-8)}</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  required
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth <span className="text-gray-400 font-normal"></span>
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  placeholder="Select your date of birth"
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-gray-400 font-normal"></span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-gray-400 font-normal"></span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  
                />
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading || isSubmitting}
                  className={`w-full py-4 px-6 text-lg font-semibold rounded-lg transition duration-200 ${
                    loading || isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105"
                  } text-white shadow-lg`}
                >
                  {loading || isSubmitting ? (
                    <ButtonLoading />
                  ) : (
                    "Register for Certificate"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {isSubmitting && (
        <Loading 
          message="Registering for certificate..." 
          fullScreen={true} 
          size="large" 
        />
      )}
    </div>
  );
};

export default RegisterCertificate;
