"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [purchases, setPurchases] = useState([]);

  // Mock data for LC Sign items
  const lcSignItems = [
    { id: 1, name: "Exit Sign", price: 89.99, category: "Safety" },
    { id: 2, name: "No Smoking Sign", price: 24.99, category: "Regulatory" },
    { id: 3, name: "Restroom Sign", price: 19.99, category: "Directional" },
    { id: 4, name: "Emergency Exit Sign", price: 99.99, category: "Safety" },
    {
      id: 5,
      name: "Handicap Access Sign",
      price: 29.99,
      category: "Accessibility",
    },
  ];

  // Mock data for users
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com" },
  ];

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

  return (
    <main className="min-h-screen bg-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-orange-900 mb-8">
          LC Sign Purchase Management
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
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-orange-600">{item.category}</p>
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
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white"
              >
                <option value="" className="text-gray-500">
                  Select a user...
                </option>
                {users.map((user) => (
                  <option
                    key={user.id}
                    value={user.id}
                    className="text-gray-900"
                  >
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Assign Button */}
            <button
              onClick={handleAssignPurchase}
              disabled={!selectedItem || !selectedUser}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                selectedItem && selectedUser
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Assign Purchase
            </button>

            {/* Recent Purchases */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-orange-900 mb-4">
                Recent Purchases
              </h3>
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="p-4 border border-orange-200 rounded-lg bg-orange-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-orange-900">
                          {purchase.item.name}
                        </p>
                        <p className="text-sm text-orange-700">
                          Assigned to: {purchase.user.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-orange-900">
                          ${purchase.item.price}
                        </p>
                        <p className="text-sm text-orange-700">
                          {purchase.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {purchases.length === 0 && (
                  <p className="text-orange-600 text-center">
                    No purchases assigned yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
