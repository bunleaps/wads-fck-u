'use client';

import { use, useEffect, useState } from 'react'; // Import 'use'
import axios from 'axios';
import Link from "next/link";
import { getToken } from '@/utils/auth';
import withAuth from '@/components/withAuth';

function TicketPage({ params: paramsPromise, user }) { // user prop is injected by withAuth, rename params to indicate it might be a Promise
  const actualParams = use(paramsPromise); // Unwrap the params Promise
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const ticketId = actualParams.id; // Use the unwrapped params

  useEffect(() => {
    if (!ticketId || !user) {
      // Don't fetch if id or user is not available yet
      // withAuth should handle user availability
      setIsLoading(false);
      if (!ticketId) setError("Ticket ID is missing.");
      return;
    }

    const fetchTicketThread = async () => {
      setIsLoading(true);
      setError('');
      const token = getToken();

      if (!token) {
        setError("Authentication token not found.");
        setIsLoading(false);
        // withAuth should redirect, but this is a safeguard
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tickets/${ticketId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTicket(response.data.ticket || response.data); // Adjust based on your API response structure
      } catch (err) {
        console.error("Error fetching ticket thread:", err);
        setError(err.response?.data?.message || "Failed to load ticket details.");
        setTicket(null); // Ensure ticket is null on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketThread();
  }, [ticketId, user]); // Re-fetch if ticketId or user changes

  console.log(ticket);

  if (isLoading) return <div className="p-4 text-center">Loading ticket details...</div>;
  if (error) return <div className="p-4 text-red-500 text-center">Error: {error}</div>;
  if (!ticket) return <div className="p-4 text-center">Ticket not found or unable to load.</div>;

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{ticket.title}</h1>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Status: {ticket.status}</span>
            <span className="text-gray-600">
              Created:{" "}
              {new Date(
                // Assuming createdAt is a valid date string or number
                ticket.createdAt
              ).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Messages</h2>
          {ticket.messages && ticket.messages.length > 0 ? (
            ticket.messages.map((message) => (
            <div key={message._id} className="border rounded-lg p-4"> {/* Assuming message._id is unique */}
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">From: {message.sender?.username || message.senderId || 'Unknown Sender'}</span> {/* Adjust based on sender data */}
                <span className="text-sm text-gray-500">
                  {new Date(
                    message.createdAt
                  ).toLocaleString()}
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
    </div>
  );
}

export default withAuth(TicketPage, ['admin', 'user']); // Protect the page
