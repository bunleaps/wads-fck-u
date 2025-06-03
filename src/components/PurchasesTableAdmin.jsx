import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getToken } from "@/utils/auth"; // Assuming getToken is available
import { FiMoreVertical } from "react-icons/fi";

// Define API_BASE_URL or ensure it's available (e.g., via props or context if used in multiple places)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function PurchasesTableAdmin({ purchases, onPurchaseUpdated }) {
  const [updatingStatus, setUpdatingStatus] = useState({
    id: null,
    loading: false,
  });
  const [updateError, setUpdateError] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null); // To control which dropdown is open
  const dropdownRef = useRef(null); // Ref for the dropdown element

  const handleUpdateStatus = async (purchaseId, newStatus) => {
    setUpdatingStatus({ id: purchaseId, loading: true });
    setUpdateError(null);
    const token = getToken();

    if (!token) {
      setUpdateError("Authentication token not found. Cannot update status.");
      setUpdatingStatus({ id: null, loading: false });
      setOpenDropdownId(null); // Close dropdown on error too
      return;
    }

    try {
      await axios.patch(
        `${API_BASE_URL}/api/purchases/${purchaseId}/status`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (onPurchaseUpdated) {
        onPurchaseUpdated(); // Callback to inform parent component to refresh data
      }
    } catch (err) {
      console.error("Error updating purchase status:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to update purchase status.";
      setUpdateError(`Error for order ${purchaseId}: ${errorMessage}`);
    } finally {
      setOpenDropdownId(null); // Ensure dropdown is closed after action
      setUpdatingStatus({ id: null, loading: false });
    }
  };

  const toggleDropdown = (purchaseId) => {
    setOpenDropdownId(openDropdownId === purchaseId ? null : purchaseId);
    setUpdateError(null); // Clear previous errors when opening a new dropdown
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If there's no open dropdown, or the ref isn't attached yet, do nothing
      if (!openDropdownId || !dropdownRef.current) {
        return;
      }

      // Check if the click was on one of the 3-dot action buttons
      const clickedOnToggleButton = event.target.closest(
        'button[aria-haspopup="true"]'
      );

      // If the click is outside the dropdown and not on any toggle button
      if (
        !dropdownRef.current.contains(event.target) &&
        !clickedOnToggleButton
      ) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]); // Only re-run if openDropdownId changes

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      {updateError && (
        <p className="p-2 text-sm text-center text-red-600 bg-red-100 rounded-t-lg">
          {updateError}
        </p>
      )}
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3 font-semibold">Order Number</th>
            <th className="px-6 py-3 font-semibold">User</th>
            <th className="px-6 py-3 font-semibold">Items</th>
            <th className="px-6 py-3 font-semibold">Total Amount</th>
            <th className="px-6 py-3 font-semibold">Date</th>
            <th className="px-6 py-3 font-semibold">Status</th>
            <th className="px-6 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((purchase, index) => {
            const isLoadingCurrent =
              updatingStatus.id === purchase._id && updatingStatus.loading;
            const currentStatus = purchase.status
              ? purchase.status.toLowerCase()
              : "pending";

            const totalRows = purchases.length;
            const openUpwards =
              totalRows >= 3 && totalRows - index <= (totalRows >= 4 ? 2 : 1);

            const STATUS_OPTIONS = ["pending", "completed", "cancelled"];

            let statusClass = "bg-yellow-100 text-yellow-800"; // Default for pending
            if (currentStatus === "completed") {
              statusClass = "bg-green-100 text-green-800";
            } else if (currentStatus === "cancelled") {
              statusClass = "bg-gray-200 text-gray-700"; // Style for cancelled
            }

            return (
              <tr key={purchase._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-600">
                  {purchase.orderNumber}
                </td>
                <td className="px-4 py-2 text-gray-600">
                  {purchase.user
                    ? `${purchase.user.firstName} ${purchase.user.lastName}`
                    : "N/A"}
                </td>
                <td className="px-4 py-2 text-gray-600">
                  {purchase.items
                    .map((item) => item.name || item.itemName || "Unknown Item")
                    .join(", ")}{" "}
                  ({purchase.items.length})
                </td>
                <td className="px-4 py-2 text-gray-600">
                  ${purchase.totalAmount.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-gray-600">
                  {new Date(
                    purchase.purchaseDate || purchase.createdAt
                  ).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-gray-600">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}
                  >
                    {purchase.status
                      ? purchase.status.charAt(0).toUpperCase() +
                        purchase.status.slice(1)
                      : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-600 relative">
                  <button
                    onClick={() => toggleDropdown(purchase._id)}
                    disabled={isLoadingCurrent}
                    className="p-1 text-gray-500 hover:text-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                    aria-haspopup="true"
                    aria-expanded={openDropdownId === purchase._id}
                  >
                    <FiMoreVertical />
                  </button>
                  {openDropdownId === purchase._id && !isLoadingCurrent && (
                    <div
                      ref={dropdownRef} // Attach the ref to the dropdown
                      className={`absolute right-0 w-40 bg-white rounded-md shadow-lg z-20 py-1 ring-1 ring-black ring-opacity-5 ${
                        openUpwards ? "bottom-full mb-2" : "mt-2"
                      }`}
                    >
                      {STATUS_OPTIONS.map((statusOption) => (
                        <button
                          key={statusOption}
                          onClick={() =>
                            handleUpdateStatus(purchase._id, statusOption)
                          }
                          disabled={currentStatus === statusOption}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            currentStatus === statusOption
                              ? "text-gray-400 cursor-not-allowed" // Style for current status
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        >
                          Mark as{" "}
                          {statusOption.charAt(0).toUpperCase() +
                            statusOption.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
