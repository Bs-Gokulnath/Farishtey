import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { ButtonLoading } from "../components/Loading";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", ""]); // 3 digits
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [step, setStep] = useState("email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);
  const navigate = useNavigate();

  const API_BASE_URL = "https://www.farishtey.in/api";

  const handleOtpChange = (e, index) => {
    const { value } = e.target;
    if (!/^[0-9]?$/.test(value)) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    if (value && index < otp.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // Send OTP API
  const sendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setError("");
    setLoading(true);

    // Generate a 3-digit OTP
    const newOtp = Math.floor(100 + Math.random() * 900).toString();
    setGeneratedOtp(newOtp);

    try {
      console.log("Sending OTP:", { email, otp: newOtp });
      const response = await axios.post(`${API_BASE_URL}/send-otp`, {
        email,
        otp: newOtp,
      });
      console.log("OTP response:", response.data);
      setStep("otp");
      alert("OTP sent to your email.");
    } catch (err) {
      console.error("Send OTP error:", err);
      let errorMessage = "Failed to send OTP";
      if (err.response?.data?.detail) {
        errorMessage = Array.isArray(err.response.data.detail)
          ? err.response.data.detail[0]?.msg || err.response.data.detail[0]
          : err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and Signin API
  const verifyOtpAndSignin = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 3) {
      setError("Enter the complete 3-digit OTP");
      return;
    }
    if (enteredOtp !== generatedOtp) {
      setError("Incorrect OTP. Please try again.");
      return;
    }

    setLoading(true);
    try {
      console.log("Signing in user:", { email });
      const response = await axios.post(`${API_BASE_URL}/signin`, { email });
      console.log("Signin response:", response.data);

      if (response.status === 200) {
        alert("Signin successful!");
        // Save user info
        localStorage.setItem("user", JSON.stringify(response.data));
        localStorage.setItem("role", response.data.role || "user");
        
        // Redirect based on role
        const userRole = response.data.role || "user";
        if (userRole === "ROLE_DEFAULT") {
          navigate("/approval");
        } else {
          navigate("/approval");
        }
      }
    } catch (err) {
      console.error("Signin error:", err);
      let errorMessage = "Signin failed";
      if (err.response?.data?.detail) {
        errorMessage = Array.isArray(err.response.data.detail)
          ? err.response.data.detail[0]?.msg || err.response.data.detail[0]
          : err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-white" />
        {/* Decorative background shapes */}
        <div className="absolute w-72 h-72 bg-indigo-300/20 rounded-full blur-2xl right-[-80px] bottom-[-90px]" />
      </div>

      <Header />

      <div className="flex items-center justify-center px-4 py-10 mt-[48px] min-h-[70vh]">
        <form
          onSubmit={step === "email" ? sendOtp : verifyOtpAndSignin}
          className="bg-white/90 backdrop-blur-md shadow-xl p-8 rounded-2xl w-full max-w-md space-y-8"
        >
          <h2 className="text-3xl font-black text-center text-gray-900">
            Sign In
          </h2>

          {error && (
            <div className="text-red-600 text-center bg-red-100 p-3 rounded-lg border border-red-300 text-sm font-medium">
              {error}
            </div>
          )}

          {step === "email" && (
            <div>
              <label className="block text-gray-700 mb-1 font-semibold">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
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
                  className="w-full border p-3 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {step === "otp" && (
            <div>
              <label className="block text-gray-700 mb-2 font-semibold">
                Enter 3-Digit OTP
              </label>
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                    ref={(el) => (inputsRef.current[index] = el)}
                    className="w-12 h-12 text-center border rounded-lg text-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    disabled={loading}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 text-white font-semibold rounded-lg hover:from-purple-700 hover:via-purple-800 hover:to-purple-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <ButtonLoading />
            ) : step === "email" ? (
              "Send OTP"
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signin;