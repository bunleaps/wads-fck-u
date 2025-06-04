"use client";

import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useEffect, useCallback } from "react";
import { getToken, isLoggedIn } from "@/utils/auth"; // Import isLoggedIn

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function Home() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(""); // Use ID instead of user object

  // State for fetching users
  const [apiUsers, setApiUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [fetchUsersError, setFetchUsersError] = useState(null);

  // State for posting purchases
  const [isPostingPurchase, setIsPostingPurchase] = useState(false);
  const [postPurchaseError, setPostPurchaseError] = useState(null);
  const [postPurchaseSuccess, setPostPurchaseSuccess] = useState(null);

  // Mock data for LC Sign items
  const lcSignItems = [
    { id: 1, name: "Exit Sign", price: 89.99, quantity: 1 },
    { id: 2, name: "No Smoking Sign", price: 24.99, quantity: 1 },
    { id: 3, name: "Restroom Sign", price: 19.99, quantity: 1 },
    { id: 4, name: "Emergency Exit Sign", price: 99.99, quantity: 1 },
    {
      id: 5,
      name: "Handicap Access Sign",
      price: 29.99,
      quantity: 1,
    },
  ];

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setFetchUsersError(null);
    try {
      // API route that doesn't need a token
      const response = await axios.get(
        `${API_BASE_URL}/api/purchases/users_list`
      );
      setApiUsers(response.data.users || response.data || []); // Adjust based on your API response structure
    } catch (err) {
      console.error("Error fetching users:", err);
      setFetchUsersError(
        err.response?.data?.message || "Failed to load users list."
      );
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAssignPurchase = async () => {
    if (!selectedItem || !selectedUserId) {
      setPostPurchaseError("Please select an item and a user.");
      return;
    }

    setIsPostingPurchase(true);
    setPostPurchaseError(null);
    setPostPurchaseSuccess(null);

    // Generate a random 3-digit number for the order number
    const randomThreeDigits = Math.floor(Math.random() * 900) + 100;
    const generatedOrderNumber = `ORD${randomThreeDigits}`;

    // Construct the purchase data payload
    const purchaseData = {
      orderNumber: generatedOrderNumber, // Add the generated order number
      userId: selectedUserId,
      items: [
        {
          // Assuming only one item can be selected and assigned at a time,
          // and the backend needs the product ID to identify the item.
          productId: selectedItem.id, // Add the product ID from your mock data
          name: selectedItem.name,
          quantity: selectedItem.quantity, // Add quantity from selected item
          price: selectedItem.price, // Price of the item
        },
      ],
      // Add totalAmount and status, similar to your seed data structure.
      // Backend might recalculate totalAmount and will likely generate orderNumber.
      totalAmount: selectedItem.price * selectedItem.quantity, // Calculate total for the single item
      status: "pending", // Set an initial status
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/purchases`, // API route to create a purchase
        purchaseData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Assuming backend returns the created purchase object on success
      const createdPurchase = response.data.purchase || response.data;

      setPostPurchaseSuccess(
        `Purchase created successfully! Order: ${createdPurchase.orderNumber}`
      );

      // Clear selections after successful post
      setSelectedItem(null);
      setSelectedUserId("");

      // Note: The "Recent Purchases" list below is currently removed/commented out.
      // A full implementation would fetch recent purchases from an API here or elsewhere.
    } catch (err) {
      console.error("Error creating purchase:", err);
      setPostPurchaseError(
        err.response?.data?.message || "Failed to create purchase."
      );
    } finally {
      setIsPostingPurchase(false);
    }
  };

  // Remove or comment out the mock purchases state as it's no longer used for display
  // const [purchases, setPurchases] = useState([]);

  // Remove or comment out the mock users data as it's replaced by API fetch
  // const users = [
  //   { id: 1, name: "John Doe", email: "john@example.com" },
  //   { id: 2, name: "Jane Smith", email: "jane@example.com" },
  //   { id: 3, name: "Mike Johnson", email: "mike@example.com" },
  // ];

  // Remove the handleAssignPurchase mock logic
  /*
  const handleAssignPurchase = () => {
    if (selectedItem && selectedUser) {
      const newPurchase = {
        id: Date.now(),
        item: selectedItem,
        user: users.find((u) => u.id === parseInt(selectedUser)),
        date: new Date().toLocaleDateString(),
      };
      setPurchases([...purchases, newPurchase]);
      setSelectedItem(null);
      setSelectedUser("");
    }
  };
  */

  return (
    <main className="min-h-screen bg-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-orange-900 mb-8">
          LC Sign Purchase Management Demo
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - LC Sign Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-orange-900 mb-4">
              Available LC Signs
            </h2>
            <div className="space-y-4">
              {lcSignItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedItem?.id === item.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {item.name} (Qty: {item.quantity})
                      </h3>
                      {/* <p className="text-sm text-orange-600">{item.category}</p> */}{" "}
                      {/* Category removed from mock */}
                    </div>
                    <span className="text-lg font-semibold text-orange-600">
                      ${item.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Purchase Assignment */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-orange-900 mb-4">
              Assign Purchase
            </h2>

            {/* Selected Item Display */}
            {selectedItem && (
              <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h3 className="font-medium text-orange-900">Selected Item:</h3>
                <p className="text-orange-700">
                  {selectedItem.name} - ${selectedItem.price}
                </p>
              </div>
            )}

            {/* User Selection */}
            <div className="mb-6">
              <label
                htmlFor="user"
                className="block text-sm font-medium text-orange-900 mb-2"
              >
                Select User
              </label>
              <select
                id="user"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full p-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white"
                disabled={isLoadingUsers}
              >
                <option value="" className="text-gray-500">
                  {isLoadingUsers ? "Loading users..." : "Select a user..."}
                </option>
                {fetchUsersError && (
                  <option value="" disabled className="text-red-500">
                    {fetchUsersError}
                  </option>
                )}
                {!isLoadingUsers &&
                  !fetchUsersError &&
                  apiUsers.length === 0 && (
                    <option value="" disabled className="text-gray-500">
                      No users found
                    </option>
                  )}
                {!isLoadingUsers &&
                  apiUsers.length > 0 &&
                  apiUsers.map((user) => (
                    <option
                      key={user._id} // Assuming API returns _id
                      value={user._id} // Use _id as the value
                      className="text-gray-900"
                    >
                      {user.firstName} {user.lastName} ({user.username})
                    </option>
                  ))}
              </select>
            </div>

            {/* Assign Button */}
            <button
              onClick={handleAssignPurchase}
              disabled={!selectedItem || !selectedUserId || isPostingPurchase}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                selectedItem && selectedUserId && !isPostingPurchase
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isPostingPurchase ? "Assigning..." : "Assign Purchase"}
            </button>

            {/* Feedback messages */}
            {postPurchaseError && (
              <p className="mt-4 text-sm text-red-600 text-center">
                {postPurchaseError}
              </p>
            )}
            {postPurchaseSuccess && (
              <p className="mt-4 text-sm text-green-600 text-center">
                {postPurchaseSuccess}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
