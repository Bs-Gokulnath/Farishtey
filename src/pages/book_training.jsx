import React, { useState, useContext } from "react";
import { TrainingContext } from "../components/TrainingContext";
import Header from "../components/Header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading, { ButtonLoading } from "../components/Loading";

const BookTraining = () => {
  const { addRequest } = useContext(TrainingContext);

  const API_BASE_URL = "https://www.farishtey.in/api/";

  const [formData, setFormData] = useState({
    name: "",
    number: "",
    email: "",
    venue: "",
    no_of_participants: "",
    chapter: "",
    requested_date: "",
    time: "",
  });

  const [timeValue, setTimeValue] = useState(""); // hh:mm (12hr format)
  const [period, setPeriod] = useState(""); // AM / PM
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "timeValue") {
      // ensure format like 01:30
      const formatted = value.replace(/[^0-9:]/g, "").slice(0, 5);
      setTimeValue(formatted);
      updateTime(formatted, period);
    } else if (name === "period") {
      setPeriod(value);
      updateTime(timeValue, value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // combine into formData.time
  const updateTime = (time, period) => {
    if (time && period) {
      const finalTime = `${time} ${period}`;
      setFormData((prev) => ({ ...prev, time: finalTime }));
    }
  };

  const isFormValid = Object.values(formData).every(
    (field) => field.trim() !== ""
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Please fill in all fields.", { position: "top-right" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/create-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        let result;
        try {
          result = await response.json();
          console.log("Response JSON:", result);
        } catch (err) {
          console.warn("Failed to parse JSON:", err);
          result = {};
        }

        try {
          addRequest(result);
        } catch (err) {
          console.error("addRequest failed:", err);
        }

        toast.success("Request Submitted Successfully!", {
          position: "top-right",
          autoClose: 2000,
        });

        setTimeout(() => {
          setIsLoading(false);
          window.location.reload();
        }, 2200);
      } else {
        const errorData = await response.json();
        console.error("Backend error response:", errorData);
        toast.error("Failed to submit request. Try again.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error submitting request. Please try again later.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-white" />
        <div className="absolute w-72 h-72 rounded-full blur-2xl right-[-80px] bottom-[-90px]" />
      </div>

      <Header />

      <main className="flex flex-col items-center px-4 py-4 mb-4 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-black text-gray-900 mb-4 drop-shadow md:hidden block">
          Book Training
        </h1>

        <form
          onSubmit={handleSubmit}
          className="relative flex-1 bg-white shadow-md rounded-lg p-6 border border-gray-300 grid grid-cols-1 md:grid-cols-2 gap-6"
          style={{
            maxWidth: "720px",
          }}
        >
          {/* LEFT */}
          <div className="space-y-4">
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <Input
              label="Mobile Number"
              name="number"
              value={formData.number}
              onChange={handleChange}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <Input
              label="Venue"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
            />
          </div>

          {/* RIGHT */}
          <div className="space-y-4">
            <Input
              label="No. of Participants"
              name="no_of_participants"
              type="number"
              value={formData.no_of_participants}
              onChange={handleChange}
              min="1"
              max="100"
            />
            <Input
              label="Chapter"
              name="chapter"
              value={formData.chapter}
              onChange={handleChange}
            />
            {/* Date input */}
            <Input
              label="Requested Date"
              name="requested_date"
              type="date"
              min={today}
              value={formData.requested_date}
              onChange={handleChange}
            />
            {/* Custom 12hr Time Picker */}
            <div>
              <label className="block text-gray-500 font-medium mb-2 text-sm">
                Time
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  name="timeValue"
                  value={timeValue}
                  onChange={handleChange}
                  placeholder="hh:mm"
                  pattern="^(0?[1-9]|1[0-2]):[0-5][0-9]$"
                  className="flex-1 border border-gray-300 bg-white rounded-md px-4 py-3 focus:border-blue-500 focus:outline-none text-gray-900"
                  required
                />
                <select
                  name="period"
                  value={period}
                  onChange={handleChange}
                  className="w-28 border border-gray-300 bg-white rounded-md px-3 py-3 focus:border-blue-500 focus:outline-none text-gray-900"
                  required
                >
                  <option value="">AM/PM</option>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 mt-1">
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full font-semibold py-3 rounded-md text-base ${
                isFormValid && !isLoading
                  ? "bg-gray-800 text-white hover:bg-gray-900"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
            >
              {isLoading ? <ButtonLoading /> : "Book Training"}
            </button>
          </div>
        </form>

        <ToastContainer />
      </main>
      
      {isLoading && (
        <Loading 
          message="Submitting your training request..." 
          fullScreen={true} 
          size="large" 
        />
      )}
    </div>
  );
};

// Custom Input Component
const Input = ({ label, name, value, onChange, type = "text", min, max }) => (
  <div>
    <label htmlFor={name} className="block text-gray-700 font-medium mb-2 text-sm">
      {label}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      value={value}
      min={min}
      max={max}
      onChange={onChange}
      placeholder={`Enter ${label.toLowerCase()}`}
      className="w-full border border-gray-300 bg-white rounded-md px-4 py-3 focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400"
      required
    />
  </div>
);

export default BookTraining;
