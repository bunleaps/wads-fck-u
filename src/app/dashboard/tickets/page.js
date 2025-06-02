"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import TicketTable from "@/components/TicketTable";
import TicketTableAdmin from "@/components/TicketTableAdmin";
import withAuth from "@/components/withAuth"; // Import the HOC
import { getToken } from "@/utils/auth"; // To get token for API calls

// The 'user' prop is injected by the withAuth HOC
function TicketsPage({ user }) {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTickets = useCallback(async () => {
    if (!user || !user.role) {
      setIsLoading(false);
      setError("User information not available.");
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

    let apiUrl = "";
    if (user.role === "admin") {
      apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/tickets`;
    } else if (user.role === "user") {
      apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets/my-tickets`;
    } else {
      setError("Invalid user role for fetching tickets.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(apiUrl, config);
      setTickets(response.data.tickets || response.data || []);
    } catch (err) {
      console.error(`Error fetching ${user.role} tickets:`, err);
      setError(
        err.response?.data?.message ||
          `Failed to load tickets for ${user.role}.`
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  console.log(tickets);

  if (isLoading)
    return <div className="p-4 text-center">Loading tickets...</div>;
  if (error)
    return <div className="p-4 text-red-500 text-center">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Tickets Management{" "}
        {user && `(${user.role === "admin" ? "Admin View" : "My Tickets"})`}
      </h1>
      {user && (
        <p className="mb-2 text-sm text-gray-600">
          Viewing as: {user.email} (Role: {user.role})
        </p>
      )}

      {user && user.role === "admin" && (
        <div>
          <TicketTableAdmin
            tickets={tickets}
            user={user}
            onTicketCreated={fetchTickets}
          />
        </div>
      )}
      {user && user.role === "user" && (
        <div>
          <TicketTable
            tickets={tickets}
            user={user}
            onTicketCreated={fetchTickets}
          />
        </div>
      )}
    </div>
  );
}

// Protect this page: only allow users with the 'admin' or 'user' role.
export default withAuth(TicketsPage, ["admin", "user"]);
