"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import TicketTableAdmin from "@/components/TicketTableAdminAssigned";
import withAuth from "@/components/withAuth"; // Import the HOC
import { getToken } from "@/utils/auth"; // To get token for API calls

// The 'user' prop is injected by the withAuth HOC
function AssignedTicketsPage({ user }) {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTickets = useCallback(async () => {
    if (!user || !user.role) {
      setIsLoading(false);
      // withAuth should ensure user and role are present for admin
      return;
    }

    setIsLoading(true);
    setError("");
    const token = getToken();
    if (!token) {
      setError("Authentication token not found.");
      setIsLoading(false);
      return;
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    // Since this page is admin-only, we directly use the admin endpoint
    // Assuming this endpoint fetches tickets assigned to the currently logged-in admin
    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/tickets/assigned`;

    try {
      const response = await axios.get(apiUrl, config);
      setTickets(response.data.tickets || response.data || []);
    } catch (err) {
      console.error(`Error fetching ${user.role} tickets:`, err);
      setError(
        err.response?.data?.message || "Failed to load assigned tickets."
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  if (isLoading)
    return <div className="p-4 text-center">Loading tickets...</div>;
  if (error)
    return <div className="p-4 text-red-500 text-center">Error: {error}</div>;
  if (!user || user.role !== "admin") {
    // This is a fallback, withAuth should ideally handle redirection
    return <div className="p-4 text-center">Access Denied. Admins only.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Assigned Tickets (Admin)</h1>
      <p className="mb-2 text-sm text-gray-600">Viewing as: {user.email}</p>
      <TicketTableAdmin
        tickets={tickets}
        user={user}
        onTicketCreated={fetchTickets} // If admins can create tickets from this view
      />
    </div>
  );
}

export default withAuth(AssignedTicketsPage, ["admin"]);
