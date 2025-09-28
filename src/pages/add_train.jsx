import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import useAlert from "../components/useAlert";

const API_BASE_URL = "https://www.farishtey.in/api/";

const AddNewTrainer = () => {
  const navigate = useNavigate();
  const { alert, showSuccess, showError, hideAlert } = useAlert();
  const [trainerData, setTrainerData] = useState({
    name: "",
    email: "",
    phone: "",
    training_institute: "",
    designation: "",
  });

  const [loading, setLoading] = useState(false);
  const [institutesList, setInstitutesList] = useState([]);

  // Fetch institutes list
  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/institutes`);
        console.log("Institutes response:", res.data); // Debug log
        if (res.data && Array.isArray(res.data)) {
          const approvedInstitutes = res.data
            .filter((i) => i.status === "approved" || i.status === "active")
            .map((i) => i.name);
          setInstitutesList(approvedInstitutes);
        } else {
          console.error("Invalid institutes data format:", res.data);
          setInstitutesList([]);
        }
      } catch (error) {
        console.error("Failed to fetch institutes", error);
        setInstitutesList([]);
      }
    };
    fetchInstitutes();
  }, []);

  const handleInputChange = (e) => {
    setTrainerData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!trainerData.name.trim() || !trainerData.email.trim() || !trainerData.training_institute) {
      showError("Please fill in name, email, and select a training institute");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trainerData.email)) {
      showError("Please enter a valid email address");
      return;
    }

    // Phone validation (optional but if provided, should be valid)
    if (trainerData.phone && !/^\d{10}$/.test(trainerData.phone.replace(/[^0-9]/g, ''))) {
      showError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/add-trainer`, trainerData);
      showSuccess("Trainer added successfully");
      
      // Reset form
      setTrainerData({
        name: "",
        email: "",
        phone: "",
        training_institute: "",
        designation: "",
      });
      
      // Navigate back to approval dashboard
      navigate("/approval");
    } catch (err) {
      console.error("Failed to add trainer", err);
      if (err.response) {
        // Server responded with error status
        console.error("Error response:", err.response.data);
        // Handle specific error cases
        if (err.response.data.detail === 'Trainer with this email already exists') {
          showError("A trainer with this email already exists. Please use a different email address.");
          // Clear the email field to help user fix the issue
          setTrainerData(prev => ({ ...prev, email: "" }));
        } else if (err.response.data.message) {
          showError(`Failed to add trainer: ${err.response.data.message}`);
        } else if (err.response.data.detail) {
          showError(`Failed to add trainer: ${err.response.data.detail}`);
        } else {
          showError(`Failed to add trainer: ${err.response.statusText}`);
        }
      } else if (err.request) {
        // Request was made but no response received
        showError("Network error. Please check your connection and try again.");
      } else {
        // Something else happened
        showError("Failed to add trainer. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/approval");
  };

  return (
    <div className="relative min-h-screen w-full bg-[#A7C7E7]">
      <Header />
      
      {/* Alert Component */}
      <Alert
        isVisible={alert.isVisible}
        message={alert.message}
        type={alert.type}
        onClose={hideAlert}
        duration={alert.duration}
        position={alert.position}
      />
      
      <div className="max-w-2xl mx-auto pt-6 px-4 md:px-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Add New Trainer</h1>
          
          {/* Name Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              placeholder="Enter trainer name"
              value={trainerData.name}
              onChange={handleInputChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              placeholder="trainer@example.com"
              value={trainerData.email}
              onChange={handleInputChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          {/* Phone Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              name="phone"
              placeholder="10-digit phone number"
              value={trainerData.phone}
              onChange={handleInputChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Training Institute Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Training Institute <span className="text-red-500">*</span>
            </label>
            <select
              name="training_institute"
              value={trainerData.training_institute}
              onChange={handleInputChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Training Institute</option>
              {institutesList.map((institute, idx) => (
                <option key={idx} value={institute}>{institute}</option>
              ))}
            </select>
            {institutesList.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">No institutes available. Please add an institute first.</p>
            )}
          </div>
          
          {/* Designation Field */}
          {/* <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Designation
            </label>
            <input
              name="designation"
              placeholder="e.g., Senior Trainer, Assistant Trainer"
              value={trainerData.designation}
              onChange={handleInputChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div> */}
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button 
              onClick={handleCancel} 
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 rounded transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:bg-blue-400"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Trainer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewTrainer;