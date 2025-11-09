import React, { useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import useAlert from "../components/useAlert";

const API_BASE_URL = "https://www.farishtey.in/api/";

const AddNewInstitute = () => {
  const navigate = useNavigate();
  const { alert, showSuccess, showError, hideAlert } = useAlert();
  const [instituteData, setInstituteData] = useState({
    name: "",
    email: "",
    phone: "",
    authorized_person_name: "",
    authorized_person_designation: "",
    authorized_person_signature: null,
    institute_logo: null,
    address: "",
    city: "",
    state: "",
  });

  const [loading, setLoading] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "authorized_person_signature" || name === "institute_logo") {
      const file = files[0];
      if (file) {
        if (name === "authorized_person_signature" && file.size > 3 * 1024 * 1024) {
          showError("Signature must be less than 3MB");
          e.target.value = null;
          return;
        }
        if (name === "institute_logo" && file.size > 5 * 1024 * 1024) {
          showError("Logo must be less than 5MB");
          e.target.value = null;
          return;
        }

        const previewUrl = URL.createObjectURL(file);
        if (name === "authorized_person_signature") setSignaturePreview(previewUrl);
        if (name === "institute_logo") setLogoPreview(previewUrl);

        setInstituteData((prev) => ({ ...prev, [name]: file }));
      }
    } else {
      setInstituteData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!instituteData.name.trim()) {
      showError("Institute name is required");
      return false;
    }
    if (!instituteData.email.trim()) {
      showError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(instituteData.email)) {
      showError("Please enter a valid email address");
      return false;
    }
    if (!instituteData.institute_logo) {
      showError("Institute logo is required");
      return false;
    }
    if (!instituteData.authorized_person_name.trim()) {
      showError("Authorized person name is required");
      return false;
    }
    if (!instituteData.authorized_person_designation.trim()) {
      showError("Authorized person designation is required");
      return false;
    }
    if (!instituteData.authorized_person_signature) {
      showError("Authorized person signature is required");
      return false;
    }
    if (!instituteData.address.trim()) {
      showError("Address is required");
      return false;
    }
    if (!instituteData.city.trim()) {
      showError("City is required");
      return false;
    }
    if (!instituteData.state.trim()) {
      showError("State is required");
      return false;
    }
    if (
      instituteData.phone &&
      !/^\d{10}$/.test(instituteData.phone.replace(/[^0-9]/g, ""))
    ) {
      showError("Please enter a valid 10-digit phone number");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add form fields
      formData.append("name", instituteData.name);
      formData.append("email", instituteData.email);
      formData.append("phone", instituteData.phone);
      formData.append("authorized_person_name", instituteData.authorized_person_name);
      formData.append("authorized_person_designation", instituteData.authorized_person_designation);
      formData.append("address", instituteData.address);
      formData.append("city", instituteData.city);
      formData.append("state", instituteData.state);
      
      // Add files if they exist
      if (instituteData.authorized_person_signature) {
        formData.append("authorized_person_signature", instituteData.authorized_person_signature);
      }
      if (instituteData.institute_logo) {
        formData.append("institute_logo", instituteData.institute_logo);
      }

      await axios.post(`${API_BASE_URL}/add-institute`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSuccess("Institute added successfully");
      navigate("/approval");
    } catch (err) {
      console.error("Failed to add institute", err);
      showError("Failed to add institute. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (signaturePreview) URL.revokeObjectURL(signaturePreview);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    navigate("/approval");
  };

  return (
    <div className="min-h-screen bg-white font-sans">
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
      
      <div className="max-w-4xl mx-auto pt-10 px-4 md:px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <h1 className="text-3xl font-extrabold mb-8 text-center text-indigo-700">
            🏫 Add New Institute
          </h1>

          {/* Form Sections */}
          <div className="space-y-8">
            {/* Basic Information */}
            <section>
              <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                📌 Basic Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institute Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={instituteData.name}
                    onChange={handleInputChange}
                    placeholder="Enter institute name"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={instituteData.email}
                    onChange={handleInputChange}
                    placeholder="institute@example.com"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    value={instituteData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit phone number"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institute Logo <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="institute_logo"
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                  {logoPreview && (
                    <div className="mt-3">
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="h-20 border rounded shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Address Information */}
            <section>
              <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                📍 Address Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={instituteData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address"
                    className="w-full border rounded-lg px-3 py-2 min-h-[120px] focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="md:col-span-1 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="state"
                      value={instituteData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="city"
                      value={instituteData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Authorized Person */}
            <section>
              <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                👨‍💼 Authorized Person Details
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="authorized_person_name"
                    value={instituteData.authorized_person_name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="authorized_person_designation"
                    value={instituteData.authorized_person_designation}
                    onChange={handleInputChange}
                    placeholder="e.g., Director, Principal"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Signature <span className="text-red-500">*</span>
                </label>
                <input
                  name="authorized_person_signature"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
                {signaturePreview && (
                  <div className="mt-3">
                    <img
                      src={signaturePreview}
                      alt="Signature Preview"
                      className="h-20 border rounded shadow-sm"
                    />
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-10">
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg text-gray-800 font-medium transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:bg-indigo-400"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewInstitute;