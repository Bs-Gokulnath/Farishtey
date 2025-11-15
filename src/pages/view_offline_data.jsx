import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import useAlert from "../components/useAlert";
import Loading from "../components/Loading";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ViewOfflineData = () => {
  const navigate = useNavigate();
  const { alert, showSuccess, showError, hideAlert } = useAlert();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [showDataModal, setShowDataModal] = useState(false);

  const fetchUploadedFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/bulk-upload-view`);
      setUploads(response.data || []);
    } catch {
      showError("Failed to fetch uploaded files data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/signin");
      return;
    }

    fetchUploadedFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewData = (upload) => {
    setSelectedUpload(upload);
    setShowDataModal(true);
  };

  const handleDownloadCSV = (upload) => {
    if (!upload.file_path) {
      showError("File path not available");
      return;
    }
    
    // Construct download URL
    const downloadUrl = `${API_BASE_URL.replace('/api/', '')}/${upload.file_path}`;
    window.open(downloadUrl, '_blank');
    showSuccess("Download started!");
  };

  return (
    <div className="relative min-h-screen w-full bg-gray-50 font-sans">
      <Alert
        isVisible={alert.isVisible}
        message={alert.message}
        type={alert.type}
        onClose={hideAlert}
        duration={alert.duration}
        position={alert.position}
      />

      <Header />

      <div className="w-full py-6 sm:py-8 lg:py-10 px-3 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <button
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span className="text-xl">←</span>
              <span className="font-medium">Back</span>
            </button>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">
              📊 Uploaded Offline Training Data
            </h1>
            <p className="text-gray-600">View all CSV files uploaded for offline training sessions</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loading />
                <p className="text-gray-500 mt-4">Loading uploaded files...</p>
              </div>
            ) : uploads.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Uploads Yet</h3>
                <p className="text-gray-500">No CSV files have been uploaded yet.</p>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block lg:hidden space-y-4">
                  {uploads.map((upload, index) => (
                    <div
                      key={upload.id || index}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-sm mb-1">
                            📄 {upload.file_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(upload.uploaded_at)}
                          </p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                          {upload.total_rows} rows
                        </span>
                      </div>

                      <div className="pt-2 border-t border-blue-200">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewData(upload)}
                            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            👁️ View Data
                          </button>
                          <button
                            onClick={() => handleDownloadCSV(upload)}
                            className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            ⬇️ Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <tr>
                        <th className="p-3 text-sm font-semibold">#</th>
                        <th className="p-3 text-sm font-semibold">File Name</th>
                        <th className="p-3 text-sm font-semibold">Uploaded At</th>
                        <th className="p-3 text-sm font-semibold text-center">Total Rows</th>
                        <th className="p-3 text-sm font-semibold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploads.map((upload, index) => (
                        <tr
                          key={upload.id || index}
                          className={`border-b hover:bg-blue-50 transition ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          <td className="p-3 text-sm text-gray-700">{index + 1}</td>
                          <td className="p-3 text-sm text-gray-800 font-medium">
                            📄 {upload.file_name}
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {formatDate(upload.uploaded_at)}
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold">
                              {upload.total_rows} rows
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleViewData(upload)}
                                className="bg-blue-600 text-white py-1.5 px-4 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                              >
                                👁️ View
                              </button>
                              <button
                                onClick={() => handleDownloadCSV(upload)}
                                className="bg-green-600 text-white py-1.5 px-4 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                              >
                                ⬇️ Download
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Data View Modal */}
      {showDataModal && selectedUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-1">
                    📄 {selectedUpload.file_name}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Uploaded: {formatDate(selectedUpload.uploaded_at)}
                  </p>
                </div>
                <button
                  onClick={() => setShowDataModal(false)}
                  className="text-white hover:text-gray-200 text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              {selectedUpload.data && selectedUpload.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        {Object.keys(selectedUpload.data[0]).map((key) => (
                          <th
                            key={key}
                            className="p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-700 border whitespace-nowrap"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUpload.data.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className={`hover:bg-blue-50 ${
                            rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          {Object.values(row).map((value, colIndex) => (
                            <td
                              key={colIndex}
                              className="p-2 sm:p-3 text-xs sm:text-sm text-gray-700 border"
                            >
                              {value || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="text-gray-500">No data available in this file</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t p-4 sm:p-6 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Total Records: <strong>{selectedUpload.total_rows}</strong>
                </p>
                <button
                  onClick={() => setShowDataModal(false)}
                  className="bg-gray-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewOfflineData;
