import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import useAlert from "../components/useAlert";
import Loading, { ButtonLoading } from "../components/Loading";

const API_BASE_URL = "https://www.farishtey.in/api/";

const SuperAdminApprovalDashboard = () => {
  const navigate = useNavigate();
  const { alert, showSuccess, showError, hideAlert } = useAlert();
  const [trainers, setTrainers] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const [activeTab, setActiveTab] = useState("trainer"); // default tab

  // Role check — currently allows "admin"
  useEffect(() => {
    const sessionRole = localStorage.getItem("role");
    setRole(sessionRole);

    if (sessionRole !== "admin") {
      navigate("/unauthorized");
    }
  }, [navigate]);

  // Fetch pending trainers/institutes
  const fetchData = async () => {
    try {
      setLoading(true);
      const [trainerRes, instituteRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/trainers/pending`),
        axios.get(`${API_BASE_URL}/institutes/pending`),
      ]);
      setTrainers(trainerRes.data || []);
      setInstitutes(instituteRes.data || []);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTrainer = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/approve-trainer`, { trainer_id: id });
      showSuccess("Trainer approved successfully");
      fetchData();
    } catch (err) {
      console.error("Approve trainer failed", err);
    }
  };

  const handleRejectTrainer = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/trainer/${id}`, { status: "rejected" });
      showError("Trainer rejected");
      fetchData();
    } catch (err) {
      console.error("Reject trainer failed", err);
    }
  };

  const handleApproveInstitute = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/approve-institute`, {
        institute_id: id,
      });
      showSuccess("Institute approved successfully");
      fetchData();
    } catch (err) {
      console.error("Approve institute failed", err);
    }
  };

  const handleRejectInstitute = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/institute/${id}`, { status: "rejected" });
      showError("Institute rejected");
      fetchData();
    } catch (err) {
      console.error("Reject institute failed", err);
    }
  };

  useEffect(() => {
    if (role === "admin") {
      fetchData();
    }
  }, [role]);

  if (role !== "admin") {
    return null; // or Unauthorized placeholder
  }

  return (
    <div className="min-h-screen bg-[#A7C7E7]">
      {/* Alert Component */}
      <Alert
        isVisible={alert.isVisible}
        message={alert.message}
        type={alert.type}
        onClose={hideAlert}
        duration={alert.duration}
        position={alert.position}
      />

      <Header />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
          Super Admin Dashboard
        </h1>

        <div className="bg-white shadow rounded-lg p-6">
          {/* Tabs inside the white card */}
          <div className="flex mb-6">
            <button
              onClick={() => setActiveTab("trainer")}
              className={`px-4 py-2 rounded-lg font-medium mr-2 ${
                activeTab === "trainer"
                  ? "bg-sky-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              👨‍🏫 Trainer Approval
            </button>
            <button
              onClick={() => setActiveTab("institute")}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === "institute"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              🏫 Institute Approval
            </button>
          </div>

          {loading ? (
            <Loading message="Loading pending approvals..." />
          ) : (
            <>
              {/* Trainer Tab */}
              {activeTab === "trainer" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-3 text-sky-700">
                    Pending Trainers
                  </h2>
                  {trainers.length === 0 ? (
                    <p className="text-gray-500">No pending trainers.</p>
                  ) : (
                    <div className="overflow-x-auto border rounded-lg shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-sky-600 text-white">
                          <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Phone</th>
                            <th className="p-3">Institute</th>
                            <th className="p-3">Designation</th>
                            <th className="p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trainers.map((t) => (
                            <tr
                              key={t.trainer_id}
                              className="border-b hover:bg-sky-50"
                            >
                              <td className="p-3">{t.name}</td>
                              <td className="p-3">{t.email}</td>
                              <td className="p-3">{t.phone}</td>
                              <td className="p-3">{t.training_institute}</td>
                              <td className="p-3">{t.designation}</td>
                              <td className="p-3 flex gap-2">
                                <button
                                  onClick={() =>
                                    handleApproveTrainer(t.trainer_id)
                                  }
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleRejectTrainer(t.trainer_id)
                                  }
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                >
                                  Reject
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {/* Institute Tab */}
              {activeTab === "institute" && (
                <section>
                  <h2 className="text-2xl font-semibold mb-3 text-indigo-700">
                    Pending Institutes
                  </h2>
                  {institutes.length === 0 ? (
                    <p className="text-gray-500">No pending institutes.</p>
                  ) : (
                    <div className="overflow-x-auto border rounded-lg shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-indigo-600 text-white">
                          <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Phone</th>
                            <th className="p-3">Address</th>
                            <th className="p-3">City</th>
                            <th className="p-3">State</th>
                            <th className="p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {institutes.map((i) => (
                            <tr
                              key={i.institute_id}
                              className="border-b hover:bg-indigo-50"
                            >
                              <td className="p-3">{i.name}</td>
                              <td className="p-3">{i.email}</td>
                              <td className="p-3">{i.phone}</td>
                              <td className="p-3">{i.address}</td>
                              <td className="p-3">{i.city}</td>
                              <td className="p-3">{i.state}</td>
                              <td className="p-3 flex gap-2">
                                <button
                                  onClick={() =>
                                    handleApproveInstitute(i.institute_id)
                                  }
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleRejectInstitute(i.institute_id)
                                  }
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                >
                                  Reject
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminApprovalDashboard;
