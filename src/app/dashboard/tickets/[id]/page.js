"use client";

import { use, useEffect, useState, useCallback, useRef } from "react"; // Import 'use', useCallback, and useRef
import axios from "axios";
import Link from "next/link";
import { getToken } from "@/utils/auth";
import withAuth from "@/components/withAuth";
import { FiEdit } from "react-icons/fi"; // Import an edit icon

function TicketPage({ params: paramsPromise, user }) {
  // user prop is injected by withAuth, rename params to indicate it might be a Promise
  const actualParams = use(paramsPromise); // Unwrap the params Promise
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const ticketId = actualParams.id; // Use the unwrapped params

  // State for new functionalities
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [replyAttachments, setReplyAttachments] = useState([]); // State for attachments
  const [replyAttachmentError, setReplyAttachmentError] = useState(""); // State for attachment validation errors
  const replyFileInputRef = useRef(null); // Ref for the reply file input
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Admin specific state
  const [availableAdmins, setAvailableAdmins] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const TICKET_STATUSES = ["open", "in_progress", "resolved", "closed"]; // Define available statuses
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const MAX_REPLY_FILES = 5; // Maximum number of files for a reply

  // Lifted fetchTicketDetails and wrapped in useCallback
  const fetchTicketDetails = useCallback(
    async (tokenToUse) => {
      if (!ticketId) {
        setError("Ticket ID is missing for fetching details.");
        setTicket(null);
        return null; // Return null as ticket could not be fetched
      }
      if (!tokenToUse) {
        // Ensure token is provided
        setError("Authentication token not provided for fetching details.");
        setTicket(null);
        return null;
      }
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets/${ticketId}`,
          {
            headers: { Authorization: `Bearer ${tokenToUse}` },
          }
        );
        const fetchedTicket = response.data.ticket || response.data; // Adjust based on your API response structure
        setTicket(fetchedTicket);
        setSelectedStatus(fetchedTicket?.status || "");
        return fetchedTicket; // Return the fetched ticket
      } catch (err) {
        console.error("Error fetching ticket details:", err);
        setError(
          err.response?.data?.message || "Failed to load ticket details."
        );
        setTicket(null); // Ensure ticket is null on error
        return null; // Return null on error
      }
    },
    [ticketId]
  ); // Dependency: ticketId

  useEffect(() => {
    if (!user) {
      // If user is not yet available (e.g. due to withAuth HOC)
      setIsLoading(false); // Stop loading, withAuth will handle redirection or user update
      return;
    }
    if (!ticketId) {
      setIsLoading(false);
      setError("Ticket ID is missing.");
      return;
    }

    const fetchInitialData = async () => {
      setIsLoading(true);
      setError("");
      const token = getToken();

      if (!token) {
        setError("Authentication token not found.");
        setIsLoading(false);
        return;
      }

      const fetchedTicket = await fetchTicketDetails(token);

      if (fetchedTicket && user?.role === "admin") {
        try {
          const adminRes = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/admins`, // Using /api/users/admins for fetching admin list
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setAvailableAdmins(adminRes.data.admins || adminRes.data || []);
          // If ticket has an assigned admin, pre-select them
          if (fetchedTicket.assignedAdmin?._id) {
            setSelectedAdminId(fetchedTicket.assignedAdmin._id);
          }
        } catch (err) {
          console.error("Error fetching admins:", err);
          // Non-critical error, so don't block page load
          setActionError("Could not load list of admins.");
        }
      }
      setIsLoading(false);
    };

    fetchInitialData();
  }, [ticketId, user, fetchTicketDetails]); // Added fetchTicketDetails as a dependency

  // Effect to update selectedStatus when ticket data changes (e.g., after an update)
  useEffect(() => {
    if (ticket) {
      setSelectedStatus(ticket.status);
    }
  }, [ticket]);

  if (isLoading)
    return <div className="p-4 text-center">Loading ticket details...</div>;
  if (error)
    return <div className="p-4 text-red-500 text-center">Error: {error}</div>;
  if (!ticket)
    return (
      <div className="p-4 text-center">Ticket not found or unable to load.</div>
    );

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      setActionError("Reply content cannot be empty.");
      return;
    }
    if (replyAttachmentError) {
      setActionError(`Cannot submit: ${replyAttachmentError}`);
      return;
    }
    setIsReplying(true);
    setActionError("");
    setActionSuccess("");
    const token = getToken();

    const formData = new FormData();
    formData.append("content", replyContent);

    // Append attachments if any
    if (replyAttachments.length > 0) {
      for (let i = 0; i < replyAttachments.length; i++) {
        formData.append("attachments", replyAttachments[i]);
      }
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets/${ticketId}/messages`,
        formData, // Send formData instead of JSON object
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // 'Content-Type': 'multipart/form-data' is automatically set by Axios when sending FormData
          },
        }
      );
      setTicket(response.data); // Backend returns the fully populated ticket directly
      setReplyContent("");
      setReplyAttachments([]); // Clear attachments after successful post
      setReplyAttachmentError(""); // Clear attachment error
      if (replyFileInputRef.current) {
        replyFileInputRef.current.value = null; // Reset file input
      }
      setActionSuccess("Reply posted successfully!");
    } catch (err) {
      const backendErrorMessage = err.response?.data?.error; // Backend uses { error: "..." }
      const statusText = err.response?.statusText;
      const statusCode = err.response?.status;
      setActionError(
        backendErrorMessage ||
          (statusCode ? `${statusCode} ${statusText}` : "Failed to post reply.")
      );
      console.error(
        "Error posting reply:",
        err.response?.data || err.message || err
      );
    } finally {
      setIsReplying(false);
    }
  };

  const handleAssignAdmin = async (e) => {
    e.preventDefault();
    if (!selectedAdminId) {
      setActionError("Please select an admin to assign.");
      return;
    }
    setIsAssigning(true);
    setActionError("");
    setActionSuccess("");
    const token = getToken();

    try {
      await axios.patch(
        // No need to store response if we re-fetch
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets/${ticketId}/assign`,
        { adminId: selectedAdminId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionSuccess("Ticket assigned successfully!");

      // Re-fetch ticket details to get the populated assignedAdmin
      const tokenForRefresh = getToken();
      if (tokenForRefresh) {
        await fetchTicketDetails(tokenForRefresh); // This will call setTicket with fresh data
      } else {
        setActionError(
          "Session possibly expired. Please refresh to continue or log in again."
        );
      }

      setTimeout(() => {
        setIsAdminModalOpen(false); // Close modal
        setActionSuccess(""); // Clear success message after closing
      }, 1500); // Delay to show success message
    } catch (err) {
      console.error(
        "Error assigning admin:",
        err.response || err.message || err
      );
      const backendErrorMessage = err.response?.data?.error; // Backend uses { error: "..." }
      const statusText = err.response?.statusText;
      const statusCode = err.response?.status;
      setActionError(
        backendErrorMessage ||
          (statusCode
            ? `${statusCode} ${statusText}`
            : "Failed to assign ticket.")
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const handleChangeStatus = async (e) => {
    e.preventDefault();
    if (!selectedStatus) {
      setActionError("Please select a status.");
      return;
    }
    setIsUpdatingStatus(true);
    setActionError("");
    setActionSuccess("");
    const token = getToken();

    try {
      await axios.patch(
        // No need to store response if we re-fetch
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets/${ticketId}/status`,
        { status: selectedStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionSuccess("Ticket status updated successfully!");

      // Re-fetch ticket details to get the updated status reflected properly
      const tokenForRefresh = getToken();
      if (tokenForRefresh) {
        await fetchTicketDetails(tokenForRefresh);
      } else {
        setActionError(
          "Session possibly expired. Please refresh to continue or log in again."
        );
      }
      setTimeout(() => {
        setIsAdminModalOpen(false); // Close modal
        setActionSuccess(""); // Clear success message
      }, 1500);
    } catch (err) {
      console.error(
        "Error updating status:",
        err.response || err.message || err
      );
      const backendErrorMessage = err.response?.data?.error; // Assuming consistent error format
      const statusText = err.response?.statusText;
      const statusCode = err.response?.status;
      setActionError(
        backendErrorMessage ||
          (statusCode
            ? `${statusCode} ${statusText}`
            : "Failed to update status.")
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "text-blue-600";
      case "in_progress":
        return "text-yellow-600";
      case "finished":
        return "text-green-600";
      case "closed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const currentAssignedAdmin = ticket.assignedAdmin
    ? `${ticket.assignedAdmin.firstName} ${ticket.assignedAdmin.lastName} (${ticket.assignedAdmin.username})`
    : "Unassigned";

  const handleReplyFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > MAX_REPLY_FILES) {
      setReplyAttachmentError(
        `Attachment limit is ${MAX_REPLY_FILES} items. You selected ${files.length}.`
      );
      if (replyFileInputRef.current) {
        replyFileInputRef.current.value = null; // Clear the file input
      }
      setReplyAttachments([]); // Clear selected files state
      return;
    }
    setReplyAttachmentError(""); // Clear any previous error
    setReplyAttachments(files);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/dashboard/tickets"
          className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Tickets
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          {/* Ticket Info Section */}
          <div className="flex-grow">
            <h1 className="text-2xl font-bold">{ticket.title}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600 mt-2">
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`${getStatusColor(ticket.status)} font-semibold`}
                >
                  {ticket.status.replace("_", " ").toUpperCase()}
                </span>
              </p>
              <p>
                <strong>Assigned to:</strong>{" "}
                <span className="font-semibold">{currentAssignedAdmin}</span>
              </p>
              <p>
                <strong>Created by:</strong> {ticket.creator?.firstName}{" "}
                {ticket.creator?.lastName} ({ticket.creator?.username})
              </p>
              <p>
                <strong>Purchase Order:</strong>{" "}
                {ticket.purchase?.orderNumber || "N/A"}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(ticket.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Last Updated:</strong>{" "}
                {new Date(ticket.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Admin Actions - Compact and to the side */}
          {user?.role === "admin" && (
            <div className="md:w-1/3 lg:w-1/4 flex flex-col items-end">
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="flex items-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                aria-label="Manage Ticket"
              >
                <FiEdit size={16} className="mr-2" />
                Manage Ticket
              </button>
            </div>
          )}
        </div>

        {/* Admin Controls Modal */}
        {isAdminModalOpen && user?.role === "admin" && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4">
            <div className="bg-white p-5 sm:p-8 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Manage Ticket
                </h3>
                <button
                  onClick={() => setIsAdminModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Assign Admin Form */}
                <form onSubmit={handleAssignAdmin} className="space-y-3">
                  <h4 className="text-md font-medium text-gray-800">
                    Assign to Admin
                  </h4>
                  <div>
                    <label
                      htmlFor="assignAdminModal"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Select Admin:
                    </label>
                    <select
                      id="assignAdminModal"
                      value={selectedAdminId}
                      onChange={(e) => setSelectedAdminId(e.target.value)}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      disabled={availableAdmins.length === 0}
                    >
                      <option value="">-- Select --</option>
                      {availableAdmins.map((admin) => (
                        <option key={admin._id} value={admin._id}>
                          {admin.firstName} {admin.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isAssigning || !selectedAdminId}
                    className="w-full px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {isAssigning ? "Assigning..." : "Assign"}
                  </button>
                </form>

                {/* Change Status Form */}
                <form
                  onSubmit={handleChangeStatus}
                  className="space-y-3 pt-4 border-t border-gray-200"
                >
                  <h4 className="text-md font-medium text-gray-800">
                    Update Status
                  </h4>
                  <div>
                    <label
                      htmlFor="changeStatusModal"
                      className="block text-sm font-medium text-gray-700"
                    >
                      New Status:
                    </label>
                    <select
                      id="changeStatusModal"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      {TICKET_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() +
                            status.slice(1).replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={
                      isUpdatingStatus ||
                      !selectedStatus ||
                      selectedStatus === ticket.status
                    }
                    className="w-full px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
                  >
                    {isUpdatingStatus ? "Updating..." : "Update Status"}
                  </button>
                </form>
              </div>

              {(actionError || actionSuccess) && (
                <div className="mt-4 text-center">
                  {actionError && (
                    <p className="text-sm text-red-600 bg-red-100 p-2 rounded">
                      {actionError}
                    </p>
                  )}
                  {actionSuccess && (
                    <p className="text-sm text-green-600 bg-green-100 p-2 rounded">
                      {actionSuccess}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Messages</h2>
          {ticket.messages && ticket.messages.length > 0 ? (
            ticket.messages.map((message) => (
              <div key={message._id} className="border rounded-lg p-4">
                {" "}
                {/* Assuming message._id is unique */}
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">
                    From:{" "}
                    {message.sender?.firstName +
                      " " +
                      message.sender?.lastName || "Unknown Sender"}
                  </span>{" "}
                  {/* Adjust based on sender data */}
                  <span className="text-sm text-gray-500">
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 mb-4">{message.content}</p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="border-t pt-3">
                    <h3 className="text-sm font-semibold mb-2">Attachments:</h3>
                    <div className="flex gap-2">
                      {message.attachments.map((attachment) => (
                        <a
                          key={attachment._id} // Assuming attachment._id is unique
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {attachment.filename}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No messages in this ticket yet.</p>
          )}
        </div>
      </div>

      {/* Reply Section */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Post a Reply</h2>
        <form onSubmit={handleReplySubmit}>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows="4"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Type your message here..."
            required
          ></textarea>
          <div className="mt-3">
            <label
              htmlFor="attachments"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Attach files (Max {MAX_REPLY_FILES}):
            </label>
            <input
              type="file"
              id="attachments"
              ref={replyFileInputRef}
              multiple
              onChange={handleReplyFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              accept="image/*,application/pdf,.doc,.docx,.txt,.xls,.xlsx" // Optional: specify accepted file types
            />
            {replyAttachmentError && (
              <p className="mt-1 text-sm text-red-600">
                {replyAttachmentError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isReplying}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {isReplying ? "Submitting..." : "Submit Reply"}
          </button>
        </form>
      </div>

      {actionError && !isAdminModalOpen && (
        <p className="mt-4 text-sm text-red-600 bg-red-100 p-3 rounded text-center">
          {actionError}
        </p>
      )}
      {actionSuccess && !isAdminModalOpen && (
        <p className="mt-4 text-sm text-green-600 bg-green-100 p-3 rounded text-center">
          {actionSuccess}
        </p>
      )}
    </div>
  );
}

export default withAuth(TicketPage, ["admin", "user"]); // Protect the page
