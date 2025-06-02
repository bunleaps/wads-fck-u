"use client";

import { useEffect, useState, useCallback, use } from "react";
import axios from "axios";
import { getToken } from "@/utils/auth";
import withAuth from "@/components/withAuth";
import Link from "next/link";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

function UserDetailPage({ params: paramsPromise, user: authUser }) {
  // authUser is the logged-in admin
  const actualParams = use(paramsPromise);
  const username = actualParams.username;

  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUserDetails = useCallback(async () => {
    if (!username) {
      setError("Username parameter is missing.");
      setIsLoading(false);
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

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/users/${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserData(response.data.user || response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || `Failed to load user ${username}.`
      );
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  if (isLoading)
    return <div className="p-4 text-center">Loading user details...</div>;
  if (error)
    return <div className="p-4 text-red-500 text-center">Error: {error}</div>;
  if (!userData) return <div className="p-4 text-center">User not found.</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <Link
          href="/dashboard/users"
          className="text-indigo-600 hover:text-indigo-800 inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            ></path>
          </svg>
          Back to Users List
        </Link>
      </div>

      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-indigo-500 text-white flex items-center justify-center text-4xl font-semibold mb-3">
            {userData.firstName?.charAt(0)?.toUpperCase()}
            {userData.lastName?.charAt(0)?.toUpperCase()}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {userData.firstName} {userData.lastName}
          </h1>
          <p className="text-md text-gray-500">@{userData.username}</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium text-gray-600">Email:</span>
            <span className="text-gray-800">{userData.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium text-gray-600">Role:</span>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                userData.role === "admin"
                  ? "bg-red-200 text-red-800"
                  : "bg-blue-200 text-blue-800"
              }`}
            >
              {userData.role}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium text-gray-600">Joined:</span>
            <span className="text-gray-800">
              {new Date(userData.createdAt).toLocaleDateString()}
            </span>
          </div>
          {/* Add more user details as needed */}
        </div>
        {/* 
          Optionally, you can add an "Edit User" button here that triggers 
          the same modal logic as on the users list page, or navigates to a dedicated edit page.
          For now, editing is handled from the main users list.
        */}
      </div>
    </div>
  );
}

export default withAuth(UserDetailPage, ["admin"]);
