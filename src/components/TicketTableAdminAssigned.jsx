"use client";

import { useState } from "react";
import Link from "next/link";

export default function TicketTableAdmin({ tickets }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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
        </div>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-semibold">Customer</th>
              <th className="px-6 py-3 font-semibold">Ticket Details</th>
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
                  <td className="px-4 py-2 text-gray-600">
                    {ticket.creator.firstName} {ticket.creator.lastName}
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/dashboard/tickets/${ticket._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {ticket.title}
                    </Link>
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
    </div>
  );
}
