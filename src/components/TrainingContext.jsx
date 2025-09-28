import React, { createContext, useState } from "react";

export const TrainingContext = createContext();

export const TrainingProvider = ({ children }) => {
  const [institutions, setInstitutions] = useState([]);
  const [trainers, setTrainers] = useState([]);

  // Add Institution
  const addInstitution = (name) => {
    setInstitutions([...institutions, { name, status: "Pending" }]);
  };

  // Add Trainer
  const addTrainer = (name) => {
    setTrainers([...trainers, { name, status: "Pending" }]);
  };

  // Approve Institution
  const approveInstitution = (index) => {
    const updated = [...institutions];
    updated[index].status = "Approved";
    setInstitutions(updated);
  };

  // Reject Institution
  const rejectInstitution = (index) => {
    const updated = [...institutions];
    updated[index].status = "Rejected";
    setInstitutions(updated);
  };

  // Approve Trainer
  const approveTrainer = (index) => {
    const updated = [...trainers];
    updated[index].status = "Approved";
    setTrainers(updated);
  };

  // Reject Trainer
  const rejectTrainer = (index) => {
    const updated = [...trainers];
    updated[index].status = "Rejected";
    setTrainers(updated);
  };

  return (
    <TrainingContext.Provider
      value={{
        institutions,
        trainers,
        addInstitution,
        addTrainer,
        approveInstitution,
        rejectInstitution,
        approveTrainer,
        rejectTrainer,
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
};
