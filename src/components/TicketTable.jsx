"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { getToken } from "@/utils/auth";

export default function TicketTable({ tickets, user, onTicketCreated }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // State for Create Ticket Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [selectedPurchaseId, setSelectedPurchaseId] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [userPurchases, setUserPurchases] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTicketAttachments, setNewTicketAttachments] = useState([]); // State for attachments
  const [submitError, setSubmitError] = useState("");
  const [fetchPurchasesError, setFetchPurchasesError] = useState("");
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(false);

  const getStatusConfig = (status) => {
    switch (status) {
      case "open":
        return {
          label: "Open",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          borderColor: "border-blue-400",
        };
      case "in_progress":
        return {
          label: "In Progress",
          bgColor: "bg-amber-100",
          textColor: "text-amber-800",
          borderColor: "border-amber-400",
        };
      case "finished":
        return {
          label: "Completed",
          bgColor: "bg-emerald-100",
          textColor: "text-emerald-800",
          borderColor: "border-emerald-400",
        };
      default:
        return {
          label: status,
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-400",
        };
    }
  };

  const filteredTickets = tickets
    // First filter by status
    .filter((ticket) =>
      statusFilter === "all" ? true : ticket.status === statusFilter
    )
    // Then filter by search query
    .filter((ticket) =>
      searchQuery
        ? ticket.title.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  useEffect(() => {
    if (isModalOpen && userPurchases.length === 0) {
      const fetchUserPurchases = async () => {
        setIsLoadingPurchases(true);
        setFetchPurchasesError("");
        const token = getToken();
        if (!token) {
          setFetchPurchasesError("Authentication required to fetch purchases.");
          setIsLoadingPurchases(false);
          return;
        }
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/purchases/user`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setUserPurchases(response.data.purchases || response.data || []);
        } catch (error) {
          console.error("Error fetching user purchases:", error);
          setFetchPurchasesError(
            error.response?.data?.message || "Failed to load purchases."
          );
        } finally {
          setIsLoadingPurchases(false);
        }
      };
      fetchUserPurchases();
    }
  }, [isModalOpen]); // Removed userPurchases.length from dependency to allow re-fetch if modal reopens after an error

  const handleCreateTicketSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    const token = getToken();

    if (!newTicketTitle || !selectedPurchaseId || !initialMessage) {
      setSubmitError("All fields are required.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", newTicketTitle);
    formData.append("purchaseId", selectedPurchaseId);
    formData.append("initialMessage", initialMessage);

    // Append attachments if any
    if (newTicketAttachments.length > 0) {
      for (let i = 0; i < newTicketAttachments.length; i++) {
        formData.append("attachments", newTicketAttachments[i]); // Key "attachments"
      }
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets`,
        formData, // Send FormData
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // 'Content-Type': 'multipart/form-data' is automatically set by Axios
          },
        }
      );
      setIsModalOpen(false);
      setNewTicketTitle("");
      setSelectedPurchaseId("");
      setInitialMessage("");
      setNewTicketAttachments([]); // Clear selected attachments
      if (onTicketCreated) onTicketCreated();
    } catch (error) {
      console.error("Error creating ticket:", error);
      setSubmitError(
        error.response?.data?.message || "Failed to create ticket."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 space-y-2">
        <div className="flex gap-2">
          <div className="flex gap-2">
            {/* Status Filter */}
            <select
              onChange={(e) => setStatusFilter(e.target.value)}
              value={statusFilter}
              className="border p-2 rounded bg-white"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="finished">Finished</option>
            </select>
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded w-full"
          />
          {/* Create Ticket Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded whitespace-nowrap"
          >
            Create New Ticket
          </button>
        </div>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-semibold">Ticket Details</th>
              <th className="px-6 py-3 font-semibold">Assigned Admin</th>
              <th className="px-6 py-3 font-semibold">Purchase ID</th>
              <th className="px-6 py-3 font-semibold">Current Status</th>
              <th className="px-6 py-3 font-semibold">Created At</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => {
              const statusConfig = getStatusConfig(ticket.status);
              return (
                <tr key={ticket._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <Link
                      href={`/dashboard/tickets/${ticket._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {ticket.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {ticket.assignedAdmin
                      ? `${ticket.assignedAdmin.firstName} ${ticket.assignedAdmin.lastName}`
                      : ticket.assignedAdmin
                      ? ticket.assignedAdmin.username
                      : "unassign"}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {ticket.purchase.orderNumber}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}
                    >
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Create New Ticket</h2>
            <form onSubmit={handleCreateTicketSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="ticketTitle"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="ticketTitle"
                  value={newTicketTitle}
                  onChange={(e) => setNewTicketTitle(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="purchaseId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Related Purchase
                </label>
                {isLoadingPurchases && (
                  <p className="text-sm text-gray-500">Loading purchases...</p>
                )}
                {fetchPurchasesError && (
                  <p className="text-sm text-red-500">{fetchPurchasesError}</p>
                )}
                {!isLoadingPurchases &&
                  !fetchPurchasesError &&
                  userPurchases.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No purchases found or you might need to make a purchase
                      first.
                    </p>
                  )}
                {!isLoadingPurchases && userPurchases.length > 0 && (
                  <select
                    id="purchaseId"
                    value={selectedPurchaseId}
                    onChange={(e) => setSelectedPurchaseId(e.target.value)}
                    className="border p-2 rounded w-full"
                    required
                  >
                    <option value="" disabled>
                      Select a purchase
                    </option>
                    {userPurchases.map((purchase) => (
                      <option key={purchase._id} value={purchase._id}>
                        Order: {purchase.orderNumber} - Items:{" "}
                        {purchase.items.length} - Total: $
                        {purchase.totalAmount.toFixed(2)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="initialMessage"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Initial Message
                </label>
                <textarea
                  id="initialMessage"
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  rows="4"
                  className="border p-2 rounded w-full"
                  required
                ></textarea>
              </div>

              {/* Attachments Input */}
              <div className="mb-4">
                <label
                  htmlFor="newTicketAttachments"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Attach files (up to 5):
                </label>
                <input
                  type="file"
                  id="newTicketAttachments"
                  multiple
                  onChange={(e) =>
                    setNewTicketAttachments(Array.from(e.target.files))
                  }
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  accept="image/*,application/pdf,.doc,.docx,.txt,.xls,.xlsx" // Optional: specify accepted file types
                />
              </div>

              {submitError && (
                <p className="text-red-500 text-sm mb-3">{submitError}</p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-orange-500 hover:bg-orange-600 rounded"
                  disabled={
                    isSubmitting ||
                    isLoadingPurchases ||
                    (userPurchases.length === 0 && !fetchPurchasesError)
                  }
                >
                  {isSubmitting ? "Submitting..." : "Create Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
