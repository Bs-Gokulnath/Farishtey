import React, { useState, useEffect } from "react";
import Loading, { ButtonLoading } from "./Loading";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CompleteSessionPopup = ({ isOpen, onClose, session, onComplete }) => {
  const [mediaFiles, setMediaFiles] = useState([null, null, null, null]); // 4 slots: 1 mandatory + 3 optional
  // All 4 media slots are always visible
  const [registeredParticipants, setRegisteredParticipants] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]); // Track selected participant IDs
  const [participantSelectionConfirmed, setParticipantSelectionConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [isEditingParticipants, setIsEditingParticipants] = useState(false);
  const [editableParticipantsCount, setEditableParticipantsCount] = useState(0);

  // Fetch registered participants for this session
  useEffect(() => {
    if (isOpen && session) {
      fetchRegisteredParticipants();
      // Initialize editable participants count
      const initialCount = session?.total_participants || 
                          session?.participants || 
                          session?.participant_count || 
                          session?.no_of_participants || 
                          session?.expected_participants || 
                          0;
      setEditableParticipantsCount(Number(initialCount));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, session]);

  const fetchRegisteredParticipants = async () => {
    setParticipantsLoading(true);
    try {
      // Use the actual API endpoint for fetching participants by session_id
      const response = await fetch(`${API_BASE_URL}/participants/${session.session_id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch participants');
      }
      
      const participants = await response.json();
      // Ensure each participant has a unique ID
      const participantsWithIds = (participants || []).map((participant, index) => ({
        ...participant,
        id: participant.id || `participant_${index + 1}`
      }));
      setRegisteredParticipants(participantsWithIds);
    } catch {
      // Fallback to mock data if API fails (for development)
      const mockParticipants = [
        { 
          id: "participant_1", 
          name: "John Doe", 
          email: "john@example.com", 
          phone: "+91-9876543210", 
          age: 25,
          chapter: "Mumbai"
        },
        { 
          id: "participant_2", 
          name: "Jane Smith", 
          email: "jane@example.com", 
          phone: "+91-9876543211", 
          age: 30,
          chapter: "Mumbai"
        },
        { 
          id: "participant_3", 
          name: "Mike Johnson", 
          email: "mike@example.com", 
          phone: "+91-9876543212", 
          age: 28,
          chapter: "Mumbai"
        }
      ];
      
      setRegisteredParticipants(mockParticipants);
    } finally {
      setParticipantsLoading(false);
    }
  };

  const handleFileChange = (index, file) => {
    const newMediaFiles = [...mediaFiles];
    newMediaFiles[index] = file;
    setMediaFiles(newMediaFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate mandatory file
    if (!mediaFiles[0]) {
      alert("Please upload at least one media file (mandatory)");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('session_id', session.session_id);
      
      // Add media files
      mediaFiles.forEach((file, index) => {
        if (file) {
          formData.append(`media_${index + 1}`, file);
        }
      });

      // Add only selected participant data
      const selectedParticipantData = registeredParticipants.filter(p => selectedParticipants.includes(p.id));
      formData.append('participants', JSON.stringify(selectedParticipantData));
      formData.append('total_participants', editableParticipantsCount);
      formData.append('allotment_status', 'completed');

      // Call the actual API endpoint to complete the session
      const response = await fetch(`${API_BASE_URL}/complete-session`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to complete session');
      }

      await response.json();

      onComplete();
      onClose();
      
      // Reset form
      setMediaFiles([null, null, null, null]);
      setRegisteredParticipants([]);
      setSelectedParticipants([]);
      setParticipantSelectionConfirmed(false);
    } catch {
      alert("Failed to complete session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index) => {
    const newMediaFiles = [...mediaFiles];
    newMediaFiles[index] = null;
    setMediaFiles(newMediaFiles);
  };

  // No longer need addNewSlot since all 4 boxes are shown by default

  // Participant selection functions
  const handleParticipantSelect = (participantId, isSelected) => {
    if (isSelected) {
      setSelectedParticipants(prev => [...prev, participantId]);
    } else {
      setSelectedParticipants(prev => prev.filter(id => id !== participantId));
    }
    // Reset confirmation when selection changes
    setParticipantSelectionConfirmed(false);
  };

  const handleConfirmParticipants = () => {
    if (selectedParticipants.length === 0) {
      alert("Please select at least one participant who attended the session.");
      return;
    }
    setParticipantSelectionConfirmed(true);
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedParticipants(registeredParticipants.map(p => p.id));
    } else {
      setSelectedParticipants([]);
    }
    // Reset confirmation when selection changes
    setParticipantSelectionConfirmed(false);
  };

  const isAllSelected = registeredParticipants.length > 0 && selectedParticipants.length === registeredParticipants.length;
  const isPartiallySelected = selectedParticipants.length > 0 && selectedParticipants.length < registeredParticipants.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Complete Training Session</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Session Details */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-3">Session Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Booking ID:</span>
                <p className="font-medium">{session?.booking_id || `BK-${session?.session_id?.slice(-6)}`}</p>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Date:</span>
                <p className="font-medium">{new Date(session?.requested_date).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Venue:</span>
                <p className="font-medium">{session?.venue}</p>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Institute:</span>
                <p className="font-medium">{session?.training_institute}</p>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Trainer:</span>
                <p className="font-medium">{session?.trainer}</p>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Participants:</span>
                <div className="flex items-center space-x-2">
                  {isEditingParticipants ? (
                    <input
                      type="number"
                      min="1"
                      value={editableParticipantsCount}
                      onChange={(e) => setEditableParticipantsCount(Number(e.target.value))}
                      className="w-20 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          setIsEditingParticipants(false);
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <p className="font-medium">{editableParticipantsCount || 'N/A'}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsEditingParticipants(!isEditingParticipants)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Edit participants count"
                  >
                    {isEditingParticipants ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Registered:</span>
                <p className="font-medium text-blue-800">
                  {participantsLoading ? (
                    <span className="text-gray-500">Loading...</span>
                  ) : (
                    <span className="bg-blue-100 px-2 py-1 rounded-full text-xs font-semibold">
                      {registeredParticipants.length}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Media Upload Section */}
          <div className={editableParticipantsCount !== registeredParticipants.length ? 'opacity-50 pointer-events-none' : ''}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Upload Media Files <span className="text-red-500">*</span>
              {editableParticipantsCount !== registeredParticipants.length && (
                <span className="text-sm text-gray-500 font-normal ml-2">(Fix participants count first)</span>
              )}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload training session photos/videos (1 mandatory + 3 optional)
            </p>
            
            <div className="grid grid-cols-4 gap-3">
              {mediaFiles.map((file, index) => (
                <div key={index} className={`border-2 border-dashed rounded-lg p-3 hover:border-blue-400 transition-colors aspect-square ${index === 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
                  <div className="text-center h-full flex flex-col justify-center">
                    <div className="mb-2">
                      <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    
                    {file ? (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-green-600 truncate" title={file.name}>{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)}MB</p>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label htmlFor={`file-${index}`} className="cursor-pointer">
                          <span className={`text-xs font-medium hover:text-blue-500 ${index === 0 ? 'text-red-600' : 'text-blue-600'}`}>
                            {index === 0 ? "Required" : "Optional"}
                          </span>
                          <input
                            id={`file-${index}`}
                            type="file"
                            className="hidden"
                            accept="image/*,video/*"
                            onChange={(e) => handleFileChange(index, e.target.files[0])}
                          />
                        </label>
                        <p className="text-xs text-gray-500">PNG, JPG, MP4</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Registered Participants Section */}
          <div className={!mediaFiles[0] || editableParticipantsCount !== registeredParticipants.length ? 'opacity-50 pointer-events-none' : ''}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Registered Participants
                {(!mediaFiles[0] || editableParticipantsCount !== registeredParticipants.length) && (
                  <span className="text-sm text-gray-500 font-normal ml-2">
                    ({!mediaFiles[0] ? 'Upload media first' : 'Fix participants count first'})
                  </span>
                )}
              </h3>
              {registeredParticipants.length > 0 && (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={input => {
                      if (input) input.indeterminate = isPartiallySelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All ({selectedParticipants.length}/{registeredParticipants.length})
                  </span>
                </label>
              )}
            </div>
            
            {participantsLoading ? (
              <Loading message="Loading participants..." size="default" />
            ) : registeredParticipants.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No participants registered for this session yet.</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid gap-3">
                  {registeredParticipants.map((participant, index) => {
                    const isSelected = selectedParticipants.includes(participant.id);
                    return (
                      <div key={participant.id} className={`bg-white p-4 rounded-lg shadow-sm border transition-colors ${
                        isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Name</span>
                                <p className="font-semibold text-gray-800 text-sm">{participant.name}</p>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Chapter</span>
                                <p className="text-gray-700 text-sm">{participant.chapter || 'Not specified'}</p>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Email</span>
                                <p className="text-gray-700 text-sm break-all">{participant.email || 'Not provided'}</p>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Phone</span>
                                <p className="text-gray-700 text-sm">{participant.phone || 'Not provided'}</p>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Date of Birth</span>
                                <p className="text-gray-700 text-sm">{participant.date_of_birth ? new Date(participant.date_of_birth).toLocaleDateString('en-IN', {day: '2-digit', month: '2-digit', year: 'numeric'}) : 'Not provided'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 ml-4">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              isSelected ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              #{index + 1}
                            </span>
                            <input
                              type="checkbox"
                              id={`participant-${participant.id}`}
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleParticipantSelect(participant.id, e.target.checked);
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4">
                  {/* Participant Confirmation Section */}
                  {selectedParticipants.length > 0 && (
                    <div className={`p-4 rounded-lg border-2 transition-colors ${
                      participantSelectionConfirmed 
                        ? 'bg-green-50 border-green-300' 
                        : 'bg-yellow-50 border-yellow-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {participantSelectionConfirmed ? (
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-green-800 font-medium">
                                Confirmed: {selectedParticipants.length} participants attended
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <span className="text-yellow-800 font-medium">
                                Please confirm: {selectedParticipants.length} participants attended this session
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {!participantSelectionConfirmed && (
                          <button
                            type="button"
                            onClick={handleConfirmParticipants}
                            className="ml-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium transition-colors"
                          >
                            OK, Confirm Attendance
                          </button>
                        )}
                        
                        {participantSelectionConfirmed && (
                          <button
                            type="button"
                            onClick={() => setParticipantSelectionConfirmed(false)}
                            className="ml-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm transition-colors"
                          >
                            Edit Selection
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Step-by-Step Progress */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-3">Completion Progress</h3>
            <div className="space-y-2">
              {/* Step 1: Participants Count */}
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  editableParticipantsCount === registeredParticipants.length 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {editableParticipantsCount === registeredParticipants.length ? '✓' : '1'}
                </div>
                <span className={`text-sm ${
                  editableParticipantsCount === registeredParticipants.length 
                    ? 'text-green-700 font-medium' 
                    : 'text-gray-600'
                }`}>
                  Match participants count ({editableParticipantsCount}/{registeredParticipants.length})
                </span>
              </div>
              
              {/* Step 2: Media Upload */}
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  mediaFiles[0] && editableParticipantsCount === registeredParticipants.length
                    ? 'bg-green-500 text-white' 
                    : editableParticipantsCount === registeredParticipants.length
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {mediaFiles[0] && editableParticipantsCount === registeredParticipants.length ? '✓' : '2'}
                </div>
                <span className={`text-sm ${
                  mediaFiles[0] && editableParticipantsCount === registeredParticipants.length
                    ? 'text-green-700 font-medium'
                    : editableParticipantsCount === registeredParticipants.length
                    ? 'text-yellow-700'
                    : 'text-gray-600'
                }`}>
                  Upload media files (Required)
                </span>
              </div>
              
              {/* Step 3: Select Participants */}
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  participantSelectionConfirmed && mediaFiles[0] && editableParticipantsCount === registeredParticipants.length
                    ? 'bg-green-500 text-white' 
                    : mediaFiles[0] && editableParticipantsCount === registeredParticipants.length
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {participantSelectionConfirmed && mediaFiles[0] && editableParticipantsCount === registeredParticipants.length ? '✓' : '3'}
                </div>
                <span className={`text-sm ${
                  participantSelectionConfirmed && mediaFiles[0] && editableParticipantsCount === registeredParticipants.length
                    ? 'text-green-700 font-medium'
                    : mediaFiles[0] && editableParticipantsCount === registeredParticipants.length
                    ? 'text-yellow-700'
                    : 'text-gray-600'
                }`}>
                  Select participants who attended
                </span>
              </div>
              
              {/* Step 4: Complete Session */}
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  participantSelectionConfirmed && mediaFiles[0] && editableParticipantsCount === registeredParticipants.length
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  4
                </div>
                <span className={`text-sm ${
                  participantSelectionConfirmed && mediaFiles[0] && editableParticipantsCount === registeredParticipants.length
                    ? 'text-yellow-700 font-medium'
                    : 'text-gray-600'
                }`}>
                  Confirm completion
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading || !mediaFiles[0] || !participantSelectionConfirmed || editableParticipantsCount !== registeredParticipants.length}
              className={`px-8 py-3 rounded-lg font-medium ${
                loading || !mediaFiles[0] || !participantSelectionConfirmed || editableParticipantsCount !== registeredParticipants.length
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } text-white`}
            >
              {loading ? (
                <ButtonLoading />
              ) : editableParticipantsCount !== registeredParticipants.length ? (
                "Step 1: Fix Participants Count"
              ) : !mediaFiles[0] ? (
                "Step 2: Upload Media Files"
              ) : !participantSelectionConfirmed ? (
                "Step 3: Select Participants"
              ) : (
                "✓ Confirm Completion"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteSessionPopup;
