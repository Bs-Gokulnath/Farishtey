import React, { useContext } from "react";
import { TrainingContext } from "../components/TrainingContext";
import Header from "../components/Header";

const AdminApprovalPage = () => {
  const {
    institutions,
    trainers,
    approveInstitution,
    rejectInstitution,
    approveTrainer,
    rejectTrainer,
  } = useContext(TrainingContext);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <Header />

      <main className="flex flex-col items-center py-10">
        <h1 className="text-3xl font-bold mb-8 text-gray-700">Admin Approval Panel</h1>

        {/* Institutions Section */}
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6 mb-10">
          <h2 className="text-xl font-semibold mb-4">Institutions</h2>
          {institutions.length === 0 ? (
            <p className="text-gray-500">No institutions added yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-3 text-left">Institution Name</th>
                  <th className="border p-3 text-left">Status</th>
                  <th className="border p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-3">{item.name}</td>
                    <td className="border p-3">{item.status}</td>
                    <td className="border p-3 text-center">
                      <button
                        onClick={() => approveInstitution(index)}
                        className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                        disabled={item.status !== "Pending"}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectInstitution(index)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        disabled={item.status !== "Pending"}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Trainers Section */}
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Trainers</h2>
          {trainers.length === 0 ? (
            <p className="text-gray-500">No trainers added yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-3 text-left">Trainer Name</th>
                  <th className="border p-3 text-left">Status</th>
                  <th className="border p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trainers.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-3">{item.name}</td>
                    <td className="border p-3">{item.status}</td>
                    <td className="border p-3 text-center">
                      <button
                        onClick={() => approveTrainer(index)}
                        className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                        disabled={item.status !== "Pending"}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectTrainer(index)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        disabled={item.status !== "Pending"}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminApprovalPage;
