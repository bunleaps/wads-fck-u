"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!user || !user.role) {
      // User prop might not be available immediately on first render
      // or if there's an issue with withAuth (though it should redirect)
      setIsLoading(false);
      setError("User information not available.");
      return;
    }

    const fetchTickets = async () => {
      setIsLoading(true);
      setError("");
      const token = getToken();
      if (!token) {
        setError("Authentication token not found.");
        setIsLoading(false);
        // withAuth should ideally handle this, but as a safeguard:
        // router.push('/auth/login');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      let apiUrl = "";
      if (user.role === "admin") {
        apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/tickets`; // Example admin endpoint
      } else if (user.role === "user") {
        apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets/my-tickets`; // Example user endpoint
      } else {
        setError("Invalid user role for fetching tickets.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(apiUrl, config);
        setTickets(response.data.tickets || response.data || []); // Adjust based on your API response structure
      } catch (err) {
        console.error(`Error fetching ${user.role} tickets:`, err);
        setError(
          err.response?.data?.message ||
            `Failed to load tickets for ${user.role}.`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [user]); // Re-fetch if the user object changes

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
          <div className="mb-4 p-2 bg-blue-100 border border-blue-300 rounded">
            Admin-specific controls or information can go here.
          </div>
          {tickets.length > 0 ? (
            <TicketTableAdmin tickets={tickets} user={user} />
          ) : (
            <p>No tickets to display.</p>
          )}
        </div>
      )}
      {user && user.role === "user" && (
        <div>
          <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
            User-specific actions like "Create New Ticket" can go here.
          </div>
          {tickets.length > 0 ? (
            <TicketTable tickets={tickets} user={user} />
          ) : (
            <p>No tickets to display.</p>
          )}
        </div>
      )}
    </div>
  );
}

// Protect this page: only allow users with the 'admin' or 'user' role.
export default withAuth(TicketsPage, ["admin", "user"]);
