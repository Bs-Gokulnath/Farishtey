import React, { useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Alert from "../components/Alert";
import useAlert from "../components/useAlert";
import { ButtonLoading } from "../components/Loading";

const CHAPTERS = [
  "Agra", "Ahmedabad", "Ajmer", "Amaravati", "Balasore", "Bengaluru", "Bhopal",
  "Bhavnagar", "Bhubaneswar", "Chandigarh", "Chennai", "Chhatrapati Sambhajinagar",
  "Coimbatore", "Dehradun", "Delhi", "Dindigul", "Durg", "Erode", "Goa", "Gurugram",
  "Guwahati", "Gwalior", "Hosur", "Hubballi", "Hyderabad", "Indore", "Jaipur",
  "Jabalpur", "Jamshedpur", "Kanpur", "Karur", "Kochi", "Kolkata", "Kota", "Kozhikode",
  "Lucknow", "Madurai", "Mangaluru", "Mumbai", "Mysuru", "Nagaland", "Nagpur", "Nashik",
  "Noida", "Puducherry", "Pune", "Raipur", "Rajkot", "Ranchi", "Salem", "Sikkim",
  "Siliguri", "Sivakasi", "Surat", "Thoothukudi", "Tirupur", "Tirupati", "Trichy",
  "Trivandrum", "Vadodara", "Varanasi", "Vellore", "Vizag"
];

const Signup = () => {
  const { alert, showSuccess, hideAlert } = useAlert();
  const [email, setEmail] = useState("");
  const [chapter, setChapter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!email || !chapter) {
      setError("Please fill all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, {
        email,
        chapter_name: chapter,
      });

      if (response.status === 200 || response.status === 201) {
        showSuccess(`Signup successful! Your Chapter: ${response.data.chapter}`);
        setEmail("");
        setChapter("");
      }
    } catch (err) {
      let errorMessage = "Signup failed. Please try again.";

      if (err.response) {
        if (err.response.status === 400) {
          if (err.response.data.detail === "Email already registered") {
            errorMessage = "This email is already registered. Please sign in.";
          } else if (err.response.data.detail === "Chapter already registered") {
            errorMessage = "This chapter is already registered by another user.";
          } else {
            errorMessage = err.response.data.detail || "Signup failed.";
          }
        } else if (err.response.status === 422) {
          errorMessage = "Invalid input data.";
        }
      } else if (err.request) {
        errorMessage = "Unable to connect to server. Please check your internet.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Alert Component */}
      <Alert
        isVisible={alert.isVisible}
        message={alert.message}
        type={alert.type}
        onClose={hideAlert}
        duration={alert.duration}
        position={alert.position}
      />
      
      {/* Background fills full viewport */}
      <div
        className="fixed inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-white" />
        {/* Decorative background shapes */}
        <div className="absolute w-72 h-72 rounded-full blur-2xl right-[-80px] bottom-[-90px]" />
      </div>

      <Header />

      <div className="flex items-center justify-center px-4 py-10 mt-[20px] min-h-[70vh]">
        <form
          onSubmit={handleSignup}
          className="bg-white/90 shadow-xl p-8 rounded-2xl w-full max-w-md space-y-6"
        >
          <h2 className="text-3xl font-black text-center text-gray-900 mb-2">
            Sign Up
          </h2>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              {/* Proper envelope icon, always centered */}
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="19"
                  height="19"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </span>
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full border p-3 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Chapter Name</label>
            <div className="relative">
              <select
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                required
                disabled={loading}
                className="w-full border p-3 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 appearance-none"
              >
                <option value="">Select Chapter</option>
                {CHAPTERS.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
              {/* Custom dropdown arrow, only one now */}
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
                  stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-purple-700 text-white font-semibold rounded-lg hover:bg-purple-800 shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <ButtonLoading /> : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
