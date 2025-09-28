import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import useAlert from "../components/useAlert";
import CompleteSessionPopup from "../components/Complete_Button";
import Loading, { ButtonLoading, TableRowLoading } from "../components/Loading";

const API_BASE_URL = "https://www.farishtey.in/api/";

const AdminApprovalDashboard = () => {
  const navigate = useNavigate();
  const { alert, showSuccess, showError, showWarning, hideAlert } = useAlert();
  const [activeTab, setActiveTab] = useState("approval");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedValues, setSelectedValues] = useState({});
  const [trainersList, setTrainersList] = useState([]);
  const [institutesList, setInstitutesList] = useState([]);
  const [pendingTrainers, setPendingTrainers] = useState([]);
  const [pendingInstitutes, setPendingInstitutes] = useState([]);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [showCompletePopup, setShowCompletePopup] = useState(false);
  const [selectedSessionForComplete, setSelectedSessionForComplete] = useState(null);
  const [submitLoading, setSubmitLoading] = useState({});
  const [trainersLoading, setTrainersLoading] = useState(false);
  const [institutesLoading, setInstitutesLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserRole(userData.role || "");
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/sessions`);
      const sortedRequests = sortSessions(response.data || []);
      setRequests(sortedRequests);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
      setError("Failed to fetch sessions.");
    } finally {
      setLoading(false);
    }
  };

  const sortSessions = (sessions) => {
    // Keep original order for the approved/completed tab - let component handle its own sorting
    // Only sort for the approval tab (pending requests)
    const pending = sessions.filter((s) => 
      s.allotment_status !== "approved" && 
      s.allotment_status !== "completed"
    );
    const approved = sessions.filter((s) => s.allotment_status === "approved");
    const completed = sessions.filter((s) => s.allotment_status === "completed");
    
    // Return in order: pending (for approval tab), then approved, then completed
    return [...pending, ...approved, ...completed];
  };

  const fetchTrainers = async () => {
    setTrainersLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/trainers`);
      const approvedTrainers = res.data
        .filter((t) => t.status === "approved" || t.status === "active")
        .map((t) => t.name);
      setTrainersList(approvedTrainers);
    } catch (error) {
      console.error("Failed to fetch trainers", error);
    } finally {
      setTrainersLoading(false);
    }
  };

  const fetchInstitutes = async () => {
    setInstitutesLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/institutes`);
      const approvedInstitutes = res.data
        .filter((i) => i.status === "approved" || i.status === "active")
        .map((i) => i.name);
      setInstitutesList(approvedInstitutes);
    } catch (error) {
      console.error("Failed to fetch institutes", error);
    } finally {
      setInstitutesLoading(false);
    }
  };

  const fetchPendingData = async () => {
    try {
      setApprovalLoading(true);
      const [trainerRes, instituteRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/trainers/pending`),
        axios.get(`${API_BASE_URL}/institutes/pending`),
      ]);
      setPendingTrainers(trainerRes.data || []);
      setPendingInstitutes(instituteRes.data || []);
    } catch (err) {
      console.error("Failed to fetch pending data", err);
    } finally {
      setApprovalLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
    fetchInstitutes();
    fetchSessions();

    if (userRole === "admin") {
      fetchPendingData();
    }
  }, [userRole]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateSession = async (session_id, field, value) => {
    if (!session_id) return;
    try {
      await axios.put(`${API_BASE_URL}/session/${session_id}`, {
        [field]: value,
      });
      setRequests((prev) => {
        const updated = prev.map((req) =>
          req.session_id === session_id ? { ...req, [field]: value } : req
        );
        return sortSessions(updated);
      });
    } catch (err) {
      console.error("Error updating session:", err);
    }
  };

  const approveSession = async (session_id, training_institute, trainer) => {
    if (!session_id || !training_institute || !trainer) {
      showError("Please select both a training institute and a trainer.");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/approve-session`, {
        session_id,
        training_institute,
        trainer,
        allotment_status: "approved",
      });
      showSuccess("✅ Session approved successfully!");
      await fetchSessions();
    } catch (err) {
      console.error("Approval failed:", err);
    }
  };

  const openCompletePopup = (session) => {
    setSelectedSessionForComplete(session);
    setShowCompletePopup(true);
  };

  const closeCompletePopup = () => {
    setShowCompletePopup(false);
    setSelectedSessionForComplete(null);
  };

  const handleSessionComplete = async (session_id) => {
    // Update local state immediately to move session from approved to completed
    setRequests((prev) => {
      const updated = prev.map((req) =>
        req.session_id === session_id 
          ? { ...req, allotment_status: "completed" } 
          : req
      );
      return sortSessions(updated);
    });
    
    showSuccess("Session completed successfully with media files!");
    
    // Refresh data from backend to ensure consistency
    await fetchSessions();
  };

  const completeSession = async (session_id) => {
    if (!session_id) return;
    const session = requests.find(req => req.session_id === session_id);
    if (session) {
      openCompletePopup(session);
    }
  };

  const reviseSession = async (session_id) => {
    if (!session_id) return;
    try {
      await updateSession(session_id, "allotment_status", "revision_needed");
      showWarning("⚠️ Session sent for revision!");
    } catch (err) {
      console.error("Revise failed:", err);
    }
  };

  const rejectSession = async (session_id, rejection_reason = "Session rejected by admin") => {
    if (!session_id) return;
    try {
      // Call the specific reject-session endpoint
      await axios.post(`${API_BASE_URL}/reject-session`, {
        session_id: session_id,
        rejection_reason: rejection_reason
      });
      
      // Remove the session from local state immediately (don't show anymore)
      setRequests((prev) => {
        const filtered = prev.filter(req => req.session_id !== session_id);
        return sortSessions(filtered);
      });
      
      showError("❌ Session rejected and removed!");
      
      // Refresh data from backend to ensure consistency
      await fetchSessions();
    } catch (err) {
      console.error("Reject session failed:", err);
      showError("Failed to reject session. Please try again.");
    }
  };

  const handleApproveTrainer = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/approve-trainer`, { trainer_id: id });
      showSuccess("✅ Trainer approved successfully");
      fetchPendingData();
      fetchTrainers();
    } catch (err) {
      console.error("Approve trainer failed", err);
    }
  };

  const handleRejectTrainer = async (id, rejection_reason = "Trainer rejected by admin") => {
    try {
      // Call the specific reject-trainer endpoint
      await axios.post(`${API_BASE_URL}/reject-trainer`, {
        trainer_id: id,
        rejection_reason: rejection_reason
      });
      
      // Remove the trainer from local state immediately (don't show anymore)
      setPendingTrainers((prev) => 
        prev.filter(trainer => trainer.trainer_id !== id)
      );
      
      showError("❌ Trainer rejected and removed!");
      
      // Refresh data from backend to ensure consistency
      await fetchPendingData();
    } catch (err) {
      console.error("Reject trainer failed", err);
      showError("Failed to reject trainer. Please try again.");
    }
  };

  const handleApproveInstitute = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/approve-institute`, {
        institute_id: id,
      });
      showSuccess("✅ Institute approved successfully");
      fetchPendingData();
      fetchInstitutes();
    } catch (err) {
      console.error("Approve institute failed", err);
    }
  };

  const handleRejectInstitute = async (id, rejection_reason = "Institute rejected by admin") => {
    try {
      // Call the specific reject-institute endpoint
      await axios.post(`${API_BASE_URL}/reject-institute`, {
        institute_id: id,
        rejection_reason: rejection_reason
      });
      
      // Remove the institute from local state immediately (don't show anymore)
      setPendingInstitutes((prev) => 
        prev.filter(institute => institute.institute_id !== id)
      );
      
      showError("❌ Institute rejected and removed!");
      
      // Refresh data from backend to ensure consistency
      await fetchPendingData();
    } catch (err) {
      console.error("Reject institute failed", err);
      showError("Failed to reject institute. Please try again.");
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

  const handleTabClick = (tabName) => {
    if (userRole === "admin" || tabName === "approval") {
      setActiveTab(tabName);
    } else {
      showError("You don't have permission to access this tab");
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#A7C7E7] font-sans">
      <Alert
        isVisible={alert.isVisible}
        message={alert.message}
        type={alert.type}
        onClose={hideAlert}
        duration={alert.duration}
        position={alert.position}
      />

      <Header />
      <div className="w-full py-4 sm:py-6 lg:py-10 px-2 sm:px-3 lg:px-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 mb-4 sm:mb-6 lg:mb-8 text-center">
          Admin Dashboard
        </h1>

        <div className="bg-blue rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-3 sm:p-6 lg:p-8 ">
          {/* Tabs inside the white card */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4 sm:mb-6">
            <button
              onClick={() => handleTabClick("approval")}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                activeTab === "approval"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <span className="hidden sm:inline">📝 Session Approval</span>
              <span className="sm:hidden">📝 Sessions</span>
            </button>
            <button
              onClick={() => handleTabClick("approved")}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                activeTab === "approved"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <span className="hidden sm:inline">✅ Approved Session</span>
              <span className="sm:hidden">✅ Approved</span>
            </button>
            <button
              onClick={() => handleTabClick("trainer")}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                activeTab === "trainer"
                  ? "bg-sky-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <span className="hidden sm:inline">👨‍🏫 Trainer Approval</span>
              <span className="sm:hidden">👨‍🏫 Trainers</span>
            </button>
            <button
              onClick={() => handleTabClick("institute")}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                activeTab === "institute"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <span className="hidden sm:inline">🏫 Institute Approval</span>
              <span className="sm:hidden">🏫 Institutes</span>
            </button>
          </div>

          {/* Session Approval */}
          {activeTab === "approval" && (
            <>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-4 sm:mb-6">
                Training Session Requests
              </h2>
              {loading ? (
                <p className="text-center text-gray-500 py-8 sm:py-14">
                  ⏳ Loading sessions...
                </p>
              ) : error ? (
                <p className="text-center text-red-500 py-8 sm:py-14">{error}</p>
              ) : requests.filter((req) => req.allotment_status !== "approved" && req.allotment_status !== "completed")
                  .length === 0 ? (
                <div className="text-center py-10 sm:py-20">
                  <p className="text-lg sm:text-xl text-gray-500">
                    📭 No training requests yet!
                  </p>
                </div>
              ) : (
                <div className="mb-6 sm:mb-12">
                  {/* Mobile Card View */}
                  <div className="block sm:hidden space-y-4">
                    {requests
                      .filter((req) => req.allotment_status !== "approved" && req.allotment_status !== "completed")
                      .map((req) => (
                        <div
                          key={req.session_id}
                          className={`bg-gray-50 border rounded-lg p-4 space-y-3 ${
                            req.allotment_status === "rejected" ? "opacity-60 blur-[0.5px]" : ""
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {req.booking_id || `BK-${req.session_id?.slice(-6)}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatDate(req.requested_date)}
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${
                              req.allotment_status === "rejected" 
                                ? "bg-red-100 text-red-800" 
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {req.allotment_status === "rejected" ? "Rejected" : "Pending"}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Name:</span>
                              <p className="font-medium">{req.name || "-"}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Phone:</span>
                              <p className="font-medium">{req.number || "-"}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Participants:</span>
                              <p className="font-medium">{req.no_of_participants || "-"}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Venue:</span>
                              <p className="font-medium">{req.venue || "-"}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Institute:</label>
                              <select
                                value={
                                  selectedValues[req.session_id]?.training_institute ||
                                  req.training_institute ||
                                  ""
                                }
                                onChange={(e) => {
                                  if (e.target.value === "__add_institute__") {
                                    navigate("/add-inst");
                                    return;
                                  }
                                  setSelectedValues((prev) => ({
                                    ...prev,
                                    [req.session_id]: {
                                      ...prev[req.session_id],
                                      training_institute: e.target.value,
                                    },
                                  }));
                                }}
                                className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                              >
                                <option value="">Select</option>
                                {institutesList.map((inst, idx) => (
                                  <option key={idx} value={inst}>
                                    {inst}
                                  </option>
                                ))}
                                <option value="__add_institute__">➕ Add New...</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Trainer:</label>
                              <select
                                value={
                                  selectedValues[req.session_id]?.trainer ||
                                  req.trainer ||
                                  ""
                                }
                                onChange={(e) => {
                                  if (e.target.value === "__add_trainer__") {
                                    navigate("/add-train");
                                    return;
                                  }
                                  setSelectedValues((prev) => ({
                                    ...prev,
                                    [req.session_id]: {
                                      ...prev[req.session_id],
                                      trainer: e.target.value,
                                    },
                                  }));
                                }}
                                className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                              >
                                <option value="">Select</option>
                                {trainersList.map((trainer, idx) => (
                                  <option key={idx} value={trainer}>
                                    {trainer}
                                  </option>
                                ))}
                                <option value="__add_trainer__">➕ Add New...</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            {req.allotment_status === "completed" ? (
                              <div className="flex-1 px-3 py-2 bg-blue-100 text-blue-800 text-sm text-center rounded-md font-medium">
                                ✅ Completed
                              </div>
                            ) : req.allotment_status === "rejected" ? (
                              <div className="flex-1 px-3 py-2 bg-red-100 text-red-800 text-sm text-center rounded-md font-medium">
                                ❌ Rejected
                              </div>
                            ) : (
                              <>
                                <button
                                  disabled={
                                    !selectedValues[req.session_id]?.training_institute &&
                                    !req.training_institute
                                  }
                                  onClick={() =>
                                    approveSession(
                                      req.session_id,
                                      selectedValues[req.session_id]?.training_institute ||
                                        req.training_institute,
                                      selectedValues[req.session_id]?.trainer || req.trainer
                                    )
                                  }
                                  className="flex-1 px-3 py-2 bg-green-600 text-sm text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => rejectSession(req.session_id)}
                                  className="flex-1 px-3 py-2 bg-red-600 text-sm text-white rounded-md hover:bg-red-700"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto border rounded-lg shadow-sm">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <tr>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Booking ID</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Training Date</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Name</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Phone</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold text-center">Participants</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Venue</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Institute</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Trainer</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests
                          .filter((req) => req.allotment_status !== "approved" && req.allotment_status !== "completed")
                          .map((req, index) => (
                            <tr
                              key={req.session_id}
                              className={`border-b hover:bg-gray-50 transition ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              } ${
                                req.allotment_status === "rejected" ? "opacity-60 blur-[0.5px]" : ""
                              }`}
                            >
                              <td className="p-2 lg:p-3 font-semibold text-gray-700 text-xs lg:text-sm">
                                {req.booking_id ||
                                  `BK-${req.session_id?.slice(-6)}`}
                              </td>
                              <td className="p-2 lg:p-3 text-gray-600 text-xs lg:text-sm">
                                {formatDate(req.requested_date)}
                              </td>
                              <td className="p-2 lg:p-3 text-gray-600 text-xs lg:text-sm">{req.name || "-"}</td>
                              <td className="p-2 lg:p-3 text-gray-600 text-xs lg:text-sm">{req.number || "-"}</td>
                              <td className="p-2 lg:p-3 text-center text-gray-600 text-xs lg:text-sm">
                                {req.no_of_participants || "-"}
                              </td>
                              <td className="p-2 lg:p-3 text-gray-600 text-xs lg:text-sm">{req.venue || "-"}</td>
                              <td className="p-2 lg:p-3">
                                <select
                                  value={
                                    selectedValues[req.session_id]
                                      ?.training_institute ||
                                    req.training_institute ||
                                    ""
                                  }
                                  onChange={(e) => {
                                    if (e.target.value === "__add_institute__") {
                                      navigate("/add-inst");
                                      return;
                                    }
                                    setSelectedValues((prev) => ({
                                      ...prev,
                                      [req.session_id]: {
                                        ...prev[req.session_id],
                                        training_institute: e.target.value,
                                      },
                                    }));
                                  }}
                                  className="w-full border-gray-300 rounded-md shadow-sm p-1 lg:p-2 text-xs lg:text-sm"
                                >
                                  <option value="">Select</option>
                                  {institutesList.map((inst, idx) => (
                                    <option key={idx} value={inst}>
                                      {inst}
                                    </option>
                                  ))}
                                  <option value="__add_institute__">
                                    ➕ Add New...
                                  </option>
                                </select>
                              </td>
                              <td className="p-2 lg:p-3">
                                <select
                                  value={
                                    selectedValues[req.session_id]?.trainer ||
                                    req.trainer ||
                                    ""
                                  }
                                  onChange={(e) => {
                                    if (e.target.value === "__add_trainer__") {
                                      navigate("/add-train");
                                      return;
                                    }
                                    setSelectedValues((prev) => ({
                                      ...prev,
                                      [req.session_id]: {
                                        ...prev[req.session_id],
                                        trainer: e.target.value,
                                      },
                                    }));
                                  }}
                                  className="w-full border-gray-300 rounded-md shadow-sm p-1 lg:p-2 text-xs lg:text-sm"
                                >
                                  <option value="">Select</option>
                                  {trainersList.map((trainer, idx) => (
                                    <option key={idx} value={trainer}>
                                      {trainer}
                                    </option>
                                  ))}
                                  <option value="__add_trainer__">
                                    ➕ Add New...
                                  </option>
                                </select>
                              </td>
                              <td className="p-2 lg:p-3 text-center">
                                <div className="flex justify-center gap-1 lg:gap-2">
                                  {req.allotment_status === "completed" ? (
                                    <span className="px-2 lg:px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-md font-medium">
                                      ✅ Completed
                                    </span>
                                  ) : req.allotment_status === "rejected" ? (
                                    <span className="px-2 lg:px-3 py-1 bg-red-100 text-red-800 text-xs rounded-md font-medium">
                                      ❌ Rejected
                                    </span>
                                  ) : (
                                    <>
                                      <button
                                        disabled={
                                          !selectedValues[req.session_id]
                                            ?.training_institute &&
                                          !req.training_institute
                                        }
                                        onClick={() =>
                                          approveSession(
                                            req.session_id,
                                            selectedValues[req.session_id]
                                              ?.training_institute ||
                                              req.training_institute,
                                            selectedValues[req.session_id]?.trainer ||
                                              req.trainer
                                          )
                                        }
                                        className="px-2 lg:px-3 py-1 bg-green-600 text-xs text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => rejectSession(req.session_id)}
                                        className="px-2 lg:px-3 py-1 bg-red-600 text-xs text-white rounded-md hover:bg-red-700"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Approved Sessions */}
          {activeTab === "approved" && (
            <>
              <h2 className="text-xl sm:text-2xl font-bold text-green-700 mb-4 sm:mb-6">
                Approved & Completed Sessions
              </h2>
              {loading ? (
                <p className="text-center text-gray-500 py-8 sm:py-14">
                  ⏳ Loading sessions...
                </p>
              ) : error ? (
                <p className="text-center text-red-500 py-8 sm:py-14">{error}</p>
              ) : requests.filter((req) => req.allotment_status === "approved" || req.allotment_status === "completed")
                  .length === 0 ? (
                <div className="text-center py-10 sm:py-20">
                  <p className="text-lg sm:text-xl text-gray-500">
                    📭 No approved sessions yet!
                  </p>
                </div>
              ) : (
                <div>
                  {/* Section Status Summary */}
                  <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {requests.filter((req) => req.allotment_status === "completed").length > 0 && (
                      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                           Completed Sessions
                          <span className="ml-2 bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {requests.filter((req) => req.allotment_status === "completed").length}
                          </span>
                        </h3>
                        <p className="text-sm text-blue-600">Successfully completed training sessions</p>
                      </div>
                    )}
                    {requests.filter((req) => req.allotment_status === "approved").length > 0 && (
                      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
                          ✅ Ready for Completion
                          <span className="ml-2 bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
                            {requests.filter((req) => req.allotment_status === "approved").length}
                          </span>
                        </h3>
                        <p className="text-sm text-green-600">Approved sessions awaiting completion</p>
                      </div>
                    )}
                  </div>

                  {/* Mobile Card View */}
                  <div className="block sm:hidden space-y-4">
                    {requests
                      .filter((req) => req.allotment_status === "approved" || req.allotment_status === "completed")
                      .sort((a, b) => {
                        // Approved sessions first (at the very top), then completed sessions
                        if (a.allotment_status === "approved" && b.allotment_status === "completed") return -1;
                        if (a.allotment_status === "completed" && b.allotment_status === "approved") return 1;
                        // Within same status, sort by date (newest first)
                        if (a.allotment_status === b.allotment_status) {
                          return new Date(b.requested_date) - new Date(a.requested_date);
                        }
                        return 0;
                      })
                      .map((req) => (
                        <div
                          key={req.session_id}
                          className={`rounded-lg p-4 space-y-3 ${
                            req.allotment_status === "approved" 
                              ? "bg-green-50 border-2 border-green-400 shadow-lg" 
                              : "bg-blue-50 border-2 border-blue-300 shadow-md"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {req.booking_id || `BK-${req.session_id?.slice(-6)}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatDate(req.requested_date)}
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded font-semibold ${
                              req.allotment_status === "completed" 
                                ? "bg-blue-100 text-blue-800 border border-blue-300" 
                                : "bg-green-100 text-green-800 border border-green-300"
                            }`}>
                              {req.allotment_status === "completed" ? "Completed" : "" + req.allotment_status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Name:</span>
                              <p className="font-medium">{req.name || "-"}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Phone:</span>
                              <p className="font-medium">{req.number || "-"}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Participants:</span>
                              <p className="font-medium">{req.no_of_participants || "-"}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Venue:</span>
                              <p className="font-medium">{req.venue || "-"}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Institute:</span>
                              <p className="font-medium">{req.training_institute}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Trainer:</span>
                              <p className="font-medium">{req.trainer}</p>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            {req.allotment_status === "completed" ? (
                              <div className="flex-1 px-3 py-2 bg-blue-100 text-blue-800 text-sm text-center rounded-md font-medium">
                                ✅ Completed
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => completeSession(req.session_id)}
                                  className="flex-1 px-3 py-2 bg-blue-600 text-sm text-white rounded-md hover:bg-blue-700"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => reviseSession(req.session_id)}
                                  className="flex-1 px-3 py-2 bg-yellow-500 text-sm text-white rounded-md hover:bg-yellow-600"
                                >
                                  Revise
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto border rounded-lg shadow-sm">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                      <thead className="bg-gradient-to-r from-green-600 to-green-400 text-white">
                        <tr>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Booking ID</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Training Date</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Name</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Phone</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold text-center">
                            Participants
                          </th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Venue</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Institute</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Trainer</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold text-center">Status</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests
                          .filter((req) => req.allotment_status === "approved" || req.allotment_status === "completed")
                          .sort((a, b) => {
                            // Approved sessions first (at the very top), then completed sessions
                            if (a.allotment_status === "approved" && b.allotment_status === "completed") return -1;
                            if (a.allotment_status === "completed" && b.allotment_status === "approved") return 1;
                            // Within same status, sort by date (newest first)
                            if (a.allotment_status === b.allotment_status) {
                              return new Date(b.requested_date) - new Date(a.requested_date);
                            }
                            return 0;
                          })
                          .map((req, index) => (
                            <tr
                              key={req.session_id}
                              className={`border-b hover:bg-gray-50 transition ${
                                req.allotment_status === "approved" 
                                  ? "bg-green-50 border-l-4 border-l-green-500 shadow-sm" 
                                  : req.allotment_status === "completed"
                                  ? "bg-blue-50 border-l-4 border-l-blue-500"
                                  : index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }`}
                            >
                              <td className="p-2 lg:p-3 font-semibold text-gray-700 text-xs lg:text-sm">
                                {req.booking_id ||
                                  `BK-${req.session_id?.slice(-6)}`}
                              </td>
                              <td className="p-2 lg:p-3 text-gray-600 text-xs lg:text-sm">
                                {formatDate(req.requested_date)}
                              </td>
                              <td className="p-2 lg:p-3 text-gray-600 text-xs lg:text-sm">{req.name || "-"}</td>
                              <td className="p-2 lg:p-3 text-gray-600 text-xs lg:text-sm">{req.number || "-"}</td>
                              <td className="p-2 lg:p-3 text-center text-gray-600 text-xs lg:text-sm">
                                {req.no_of_participants || "-"}
                              </td>
                              <td className="p-2 lg:p-3 text-gray-600 text-xs lg:text-sm">{req.venue || "-"}</td>
                              <td className="p-2 lg:p-3 text-gray-600 text-xs lg:text-sm">{req.training_institute}</td>
                              <td className="p-2 lg:p-3 text-gray-600 text-xs lg:text-sm">{req.trainer}</td>
                              <td className="p-2 lg:p-3 text-center">
                                <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                  req.allotment_status === "completed" 
                                    ? "bg-blue-100 text-blue-700 border border-blue-300" 
                                    : "bg-green-100 text-green-700 border border-green-300"
                                }`}>
                                  {req.allotment_status === "completed" ? "Completed" : "" + req.allotment_status}
                                </span>
                              </td>
                              <td className="p-2 lg:p-3 text-center">
                                <div className="flex justify-center gap-1 lg:gap-2">
                                  {req.allotment_status === "completed" ? (
                                    <span className="px-2 lg:px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-md font-medium">
                                      ✅ Completed
                                    </span>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => completeSession(req.session_id)}
                                        className="px-2 lg:px-3 py-1 bg-blue-600 text-xs text-white rounded-md hover:bg-blue-700"
                                      >
                                        Complete
                                      </button>
                                      <button
                                        onClick={() => reviseSession(req.session_id)}
                                        className="px-2 lg:px-3 py-1 bg-yellow-500 text-xs text-white rounded-md hover:bg-yellow-600"
                                      >
                                        Revise
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Trainer Approval */}
          {activeTab === "trainer" && (
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-4 sm:mb-6">
                Pending Trainers
              </h2>
              {approvalLoading ? (
                <p className="text-center text-gray-500 py-8 sm:py-14">
                  ⏳ Loading pending trainers...
                </p>
              ) : pendingTrainers.length === 0 ? (
                <div className="text-center py-6 sm:py-10 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No pending trainers to approve.</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="block sm:hidden space-y-4">
                    {pendingTrainers.map((trainer) => (
                      <div
                        key={trainer.trainer_id}
                        className={`bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 ${
                          trainer.status === "rejected" ? "opacity-60 blur-[0.5px]" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">{trainer.name}</p>
                            <p className="text-sm text-gray-600">{trainer.email}</p>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                            Pending
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Phone:</span>
                            <p className="font-medium">{trainer.phone || "-"}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Designation:</span>
                            <p className="font-medium">{trainer.designation || "-"}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Institute:</span>
                            <p className="font-medium">{trainer.training_institute}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          {trainer.status === "rejected" ? (
                            <div className="flex-1 px-3 py-2 bg-red-100 text-red-800 text-sm text-center rounded-md font-medium">
                              ❌ Rejected
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => handleApproveTrainer(trainer.trainer_id)}
                                className="flex-1 px-3 py-2 bg-green-600 text-sm text-white rounded-md hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectTrainer(trainer.trainer_id)}
                                className="flex-1 px-3 py-2 bg-red-600 text-sm text-white rounded-md hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto border rounded-lg shadow-sm">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <tr>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Name</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Email</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Phone</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Institute</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Designation</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingTrainers.map((trainer, index) => (
                          <tr
                            key={trainer.trainer_id}
                            className={`border-b hover:bg-gray-50 transition ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } ${
                              trainer.status === "rejected" ? "opacity-60 blur-[0.5px]" : ""
                            }`}
                          >
                            <td className="p-2 lg:p-3 font-medium text-gray-700 text-xs lg:text-sm">{trainer.name}</td>
                            <td className="p-2 lg:p-3 text-gray-600 text-xs lg:text-sm">{trainer.email}</td>
                            <td className="p-2 lg:p-3 text-gray-600 text-xs lg:text-sm">{trainer.phone || "-"}</td>
                            <td className="p-2 lg:p-3 text-gray-600 text-xs lg:text-sm">{trainer.training_institute}</td>
                            <td className="p-2 lg:p-3 text-gray-600 text-xs lg:text-sm">{trainer.designation || "-"}</td>
                            <td className="p-2 lg:p-3 text-center">
                              <div className="flex justify-center gap-1 lg:gap-2">
                                {trainer.status === "rejected" ? (
                                  <span className="px-2 lg:px-3 py-1 bg-red-100 text-red-800 text-xs rounded-md font-medium">
                                    ❌ Rejected
                                  </span>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleApproveTrainer(trainer.trainer_id)}
                                      className="px-2 lg:px-3 py-1 bg-green-600 text-xs text-white rounded-md hover:bg-green-700"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleRejectTrainer(trainer.trainer_id)}
                                      className="px-2 lg:px-3 py-1 bg-red-600 text-xs text-white rounded-md hover:bg-red-700"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
          )}

          {/* Institute Approval */}
          {activeTab === "institute" && (
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-4 sm:mb-6">
                Pending Institutes
              </h2>
              {approvalLoading ? (
                <p className="text-center text-gray-500 py-8 sm:py-14">
                  ⏳ Loading pending institutes...
                </p>
              ) : pendingInstitutes.length === 0 ? (
                <div className="text-center py-6 sm:py-10 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No pending institutes to approve.</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="block sm:hidden space-y-4">
                    {pendingInstitutes.map((institute) => (
                      <div
                        key={institute.institute_id}
                        className={`bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-3 ${
                          institute.status === "rejected" ? "opacity-60 blur-[0.5px]" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">{institute.name}</p>
                            <p className="text-sm text-gray-600">{institute.email}</p>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                            Pending
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Phone:</span>
                            <p className="font-medium">{institute.phone || "-"}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">City:</span>
                            <p className="font-medium">{institute.city || "-"}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">State:</span>
                            <p className="font-medium">{institute.state || "-"}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Address:</span>
                            <p className="font-medium">{institute.address || "-"}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          {institute.status === "rejected" ? (
                            <div className="flex-1 px-3 py-2 bg-red-100 text-red-800 text-sm text-center rounded-md font-medium">
                              ❌ Rejected
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => handleApproveInstitute(institute.institute_id)}
                                className="flex-1 px-3 py-2 bg-green-600 text-sm text-white rounded-md hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectInstitute(institute.institute_id)}
                                className="flex-1 px-3 py-2 bg-red-600 text-sm text-white rounded-md hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto border rounded-lg shadow-sm">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                        <tr>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Name</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Email</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Phone</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">Address</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">City</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold">State</th>
                          <th className="p-2 lg:p-3 text-xs lg:text-sm font-semibold text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingInstitutes.map((institute, index) => (
                          <tr
                            key={institute.institute_id}
                            className={`border-b hover:bg-gray-50 transition ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
            } ${
                              institute.status === "rejected" ? "opacity-60 blur-[0.5px]" : ""
                            }`}
                          >
                            <td className="p-2 lg:p-3 font-medium text-gray-700 text-xs lg:text-sm">{institute.name}</td>
                            <td className="p-2 lg:p-3 text-gray-600 text-xs lg:text-sm">{institute.email}</td>
                            <td className="p-2 lg:p-3 text-gray-600 text-xs lg:text-sm">{institute.phone || "-"}</td>
                            <td className="p-2 lg:p-3 text-gray-600 text-xs lg:text-sm max-w-[120px] truncate">{institute.address || "-"}</td>
                            <td className="p-2 lg:p-3 text-gray-600 text-xs lg:text-sm">{institute.city || "-"}</td>
                            <td className="p-2 lg:p-3 text-gray-600 text-xs lg:text-sm">{institute.state || "-"}</td>
                            <td className="p-2 lg:p-3 text-center">
                              <div className="flex justify-center gap-1 lg:gap-2">
                                {institute.status === "rejected" ? (
                                  <span className="px-2 lg:px-3 py-1 bg-red-100 text-red-800 text-xs rounded-md font-medium">
                                    ❌ Rejected
                                  </span>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleApproveInstitute(institute.institute_id)}
                                      className="px-2 lg:px-3 py-1 bg-green-600 text-xs text-white rounded-md hover:bg-green-700"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleRejectInstitute(institute.institute_id)}
                                      className="px-2 lg:px-3 py-1 bg-red-600 text-xs text-white rounded-md hover:bg-red-700"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Complete Session Popup */}
      <CompleteSessionPopup
        isOpen={showCompletePopup}
        onClose={closeCompletePopup}
        session={selectedSessionForComplete}
        onComplete={handleSessionComplete}
      />
    </div>
  );
};

export default AdminApprovalDashboard;