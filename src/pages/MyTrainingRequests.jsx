import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Loading from "../components/Loading";

const API_BASE_URL = "https://www.farishtey.in/api/";

const MyTrainingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/sessions?email=${userEmail}`);
        const reversed = (res.data || []).reverse();
        setRequests(reversed);
      } catch (err) {
        console.error(err);
        setError("Unable to fetch your training requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyRequests();
  }, [userEmail]);

  // Utility to get user-friendly status + badge color
  const getStatus = (req) => {
    if (req.allotment_status === "approved")
      return { text: "Approved", color: "bg-green-100 text-green-700" };
    if (req.allotment_status === "rejected")
      return { text: "Rejected", color: "bg-red-100 text-red-700" };
    // Pending if null/undefined/other
    return { text: "Pending", color: "bg-yellow-100 text-yellow-700" };
  };

  return (
    <div className="min-h-screen bg-[#A7C7E7] p-6">
      <Header />

      <div className="max-w-5xl mx-auto mt-12">
        <h2 className="text-3xl font-black text-gray-800 mb-6 text-center">
          My Training Requests
        </h2>

        {loading ? (
          <Loading message="Loading your training requests..." />
        ) : error ? (
          <p className="text-center text-red-600 font-semibold">{error}</p>
        ) : requests.length === 0 ? (
          <p className="text-center text-gray-600 font-medium">
            No requests found.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((req) => {
              const { text, color } = getStatus(req);
              return (
                <div
                  key={req.session_id}
                  className="bg-white shadow-md rounded-xl p-5 border border-blue-100"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{req.venue}</h3>
                  <p><strong>Date:</strong> {req.requested_date}</p>
                  <p><strong>Time:</strong> {req.time}</p>
                  <p><strong>Participants:</strong> {req.no_of_participants}</p>
                  <p><strong>Chapter:</strong> {req.chapter}</p>
                  {/* Show Trainer/Institute if allotted */}
                  {req.training_institute && (
                    <p><strong>Institute:</strong> {req.training_institute}</p>
                  )}
                  {req.trainer && (
                    <p><strong>Trainer:</strong> {req.trainer}</p>
                  )}

                  <div className="mt-4">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${color}`}>
                      Status: {text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTrainingRequests;
