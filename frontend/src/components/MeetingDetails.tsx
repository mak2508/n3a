import { useEffect, useState } from "react";
import { Meeting, MEETING_TYPES } from "../types";
import { formatDate } from "../utils";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

type UploadStatus = {
  isUploading: boolean;
  progress: number;
  currentStep:
    | "uploading"
    | "transcribing"
    | "analyzing"
    | "summarizing"
    | "completed"
    | "error";
  error?: string;
};

export function MeetingDetails({
  meeting,
  setSelectedMeeting,
  refreshMeetings,
}: {
  meeting: Meeting;
  setSelectedMeeting: (meeting: Meeting | null) => void;
  refreshMeetings: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMeeting, setEditedMeeting] = useState<Meeting | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    isUploading: false,
    progress: 0,
    currentStep: "uploading",
  });

  useEffect(() => {
    // Reset save status after 3 seconds
    if (saveStatus === "success" || saveStatus === "error") {
      const timer = setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  // Format the date for datetime-local input
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
  };

  const handleEdit = () => {
    setEditedMeeting(meeting);
    setIsEditing(true);
    setSaveStatus("idle");
  };

  const handleSave = async () => {
    if (!editedMeeting) return;

    setSaveStatus("saving");

    try {
      const response = await fetch(
        `${API_URL}/api/meetings/${editedMeeting.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: editedMeeting.date,
            meeting_type: editedMeeting.meeting_type,
            description: editedMeeting.description,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update meeting");
      }

      refreshMeetings();

      setIsEditing(false);
      setSaveStatus("success");
    } catch (err) {
      console.error("Error updating meeting:", err);
      setSaveStatus("error");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedMeeting(null);
    setSaveStatus("idle");
  };

  // Function to handle date change that properly preserves time
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedMeeting) return;

    const newDateValue = e.target.value; // Format: YYYY-MM-DDThh:mm

    // Ensure we have a valid date string with time
    if (newDateValue) {
      try {
        // Make sure the date is in the correct ISO format for the database
        const dateObj = new Date(newDateValue);
        if (isNaN(dateObj.getTime())) {
          console.error("Invalid date value:", newDateValue);
          return;
        }

        setEditedMeeting({
          ...editedMeeting,
          date: dateObj.toISOString(),
        });
      } catch (err) {
        console.error("Error processing date:", err);
      }
    }
  };

  const handleFileUpload = async (file: File, meetingId: string) => {
    try {
      setUploadStatus({
        isUploading: true,
        progress: 0,
        currentStep: "uploading",
      });

      const formData = new FormData();
      formData.append("file", file);

      // Upload file to the new endpoint
      const response = await fetch(
        `${API_URL}/api/meetings/${meetingId}/upload-audio`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      // Simulate processing steps
      setUploadStatus((prev) => ({
        ...prev,
        progress: 30,
        currentStep: "transcribing",
      }));
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setUploadStatus((prev) => ({
        ...prev,
        progress: 50,
        currentStep: "analyzing",
      }));
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setUploadStatus((prev) => ({
        ...prev,
        progress: 70,
        currentStep: "summarizing",
      }));
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setUploadStatus((prev) => ({
        ...prev,
        progress: 100,
        currentStep: "completed",
      }));

      // Refresh meetings list to get the updated meeting with the new audio URL
      await refreshMeetings();

      // Reset upload status after a delay
      setTimeout(() => {
        setUploadStatus({
          isUploading: false,
          progress: 0,
          currentStep: "uploading",
        });
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setUploadStatus((prev) => ({
        ...prev,
        isUploading: false,
        currentStep: "error",
        error: error instanceof Error ? error.message : "Upload failed",
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900">
              Meeting Details
            </h2>
            <button
              onClick={() => {
                setSelectedMeeting(null);
                setIsEditing(false);
                setSaveStatus("idle");
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Client Name
                </h3>
                <p className="mt-1 text-sm text-gray-900">
                  {meeting.client_name}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Date & Time
                </h3>
                {isEditing ? (
                  <div>
                    <input
                      type="datetime-local"
                      value={
                        editedMeeting
                          ? formatDateForInput(editedMeeting.date)
                          : ""
                      }
                      onChange={handleDateChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Click the calendar icon to select date and use the time
                      input to set the time
                    </p>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(meeting.date)}
                  </p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Meeting Type
                </h3>
                {isEditing ? (
                  <select
                    value={editedMeeting?.meeting_type || ""}
                    onChange={(e) =>
                      setEditedMeeting((prev) =>
                        prev ? { ...prev, meeting_type: e.target.value as Meeting['meeting_type'] } : null
                      )
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    {MEETING_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-1 text-sm text-gray-900">
                    {meeting.meeting_type}
                  </p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Sentiment</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {meeting.sentiment ? `${meeting.sentiment}%` : "Not analyzed"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              {isEditing ? (
                <textarea
                  value={editedMeeting?.description || ""}
                  onChange={(e) =>
                    setEditedMeeting((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">
                  {meeting.description}
                </p>
              )}
            </div>

            {meeting && !meeting.audio_url && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Upload Audio Recording
                </h3>
                <div className="mt-2 space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="audio-upload"
                      className={`w-full flex flex-col items-center justify-center px-4 py-6 bg-white text-gray-500 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer hover:bg-gray-50 ${
                        uploadStatus.isUploading
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <svg
                        className="w-8 h-8 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <span className="text-sm">
                        Click to upload audio or drag and drop
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        MP3, WAV, or M4A up to 50MB
                      </span>
                      <input
                        id="audio-upload"
                        type="file"
                        className="hidden"
                        accept="audio/*"
                        disabled={uploadStatus.isUploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !meeting) return;
                          await handleFileUpload(file, meeting.id);
                        }}
                      />
                    </label>
                  </div>

                  {uploadStatus.isUploading && (
                    <div className="space-y-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${uploadStatus.progress}%` }}
                        ></div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {uploadStatus.currentStep === "uploading" &&
                            "Uploading audio..."}
                          {uploadStatus.currentStep === "transcribing" &&
                            "Transcribing audio..."}
                          {uploadStatus.currentStep === "analyzing" &&
                            "Analyzing sentiment..."}
                          {uploadStatus.currentStep === "summarizing" &&
                            "Generating summary..."}
                          {uploadStatus.currentStep === "completed" &&
                            "Processing complete!"}
                        </div>
                        <ul className="space-y-1 text-sm text-gray-500">
                          <li className="flex items-center">
                            <svg
                              className={`w-4 h-4 mr-2 ${
                                uploadStatus.progress >= 30
                                  ? "text-green-500"
                                  : "text-gray-400"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {uploadStatus.progress >= 30 ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              ) : (
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  strokeWidth="2"
                                />
                              )}
                            </svg>
                            Audio upload
                          </li>
                          <li className="flex items-center">
                            <svg
                              className={`w-4 h-4 mr-2 ${
                                uploadStatus.currentStep === "transcribing"
                                  ? "text-blue-500 animate-spin"
                                  : uploadStatus.progress >= 50
                                  ? "text-green-500"
                                  : "text-gray-400"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {uploadStatus.progress >= 50 ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              ) : (
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  strokeWidth="2"
                                />
                              )}
                            </svg>
                            Transcription
                          </li>
                          <li className="flex items-center">
                            <svg
                              className={`w-4 h-4 mr-2 ${
                                uploadStatus.currentStep === "analyzing"
                                  ? "text-blue-500 animate-spin"
                                  : uploadStatus.progress >= 70
                                  ? "text-green-500"
                                  : "text-gray-400"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {uploadStatus.progress >= 70 ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              ) : (
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  strokeWidth="2"
                                />
                              )}
                            </svg>
                            Sentiment analysis
                          </li>
                          <li className="flex items-center">
                            <svg
                              className={`w-4 h-4 mr-2 ${
                                uploadStatus.currentStep === "summarizing"
                                  ? "text-blue-500 animate-spin"
                                  : uploadStatus.progress >= 90
                                  ? "text-green-500"
                                  : "text-gray-400"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {uploadStatus.progress >= 90 ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              ) : (
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  strokeWidth="2"
                                />
                              )}
                            </svg>
                            Summary generation
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {uploadStatus.currentStep === "error" && (
                    <div className="text-red-500 text-sm">
                      Error: {uploadStatus.error}
                    </div>
                  )}
                </div>
              </div>
            )}

            {meeting.audio_url && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Audio Recording
                </h3>
                <div className="mt-2 bg-gray-100 rounded p-3">
                  <audio controls className="w-full">
                    <source src={meeting.audio_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            )}

            {meeting.summary && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Summary</h3>
                <div className="mt-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">{meeting.summary}</p>
                </div>
              </div>
            )}

            {meeting.transcript && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Transcript
                </h3>
                <div className="mt-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">{meeting.transcript}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  disabled={saveStatus === "saving"}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className={`px-4 py-2 ${
                    saveStatus === "saving"
                      ? "bg-blue-400"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white rounded-md flex items-center`}
                  disabled={saveStatus === "saving"}
                >
                  {saveStatus === "saving" ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </>
            ) : (
              <>
                {saveStatus === "success" && (
                  <div className="px-4 py-2 bg-green-100 text-green-800 rounded-md mr-2">
                    Changes saved successfully!
                  </div>
                )}
                {saveStatus === "error" && (
                  <div className="px-4 py-2 bg-red-100 text-red-800 rounded-md mr-2">
                    Error saving changes
                  </div>
                )}
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Meeting
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
