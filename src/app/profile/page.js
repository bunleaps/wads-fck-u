"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, setUser, logout, getToken } from "@/utils/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const user = getUser();
    if (user) {
      setCurrentUser(user);
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
      });
    } else {
      router.push("/auth/login"); // Redirect if not logged in
    }
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    if (isEditing && currentUser) {
      // If canceling edit, revert to original data
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        username: currentUser.username || "",
      });
    }
    setIsEditing(!isEditing);
    setError(null);
    setMessage(null);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      // Update localStorage and local state
      const updatedUser = { ...currentUser, ...formData };
      setUser(updatedUser);
      setCurrentUser(updatedUser);

      setMessage(data.message || "Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
    setDeleteError("");
    setConfirmUsername("");
  };

  const handleConfirmDelete = async () => {
    if (confirmUsername !== currentUser?.username) {
      setDeleteError("Username does not match. Deletion cancelled.");
      return;
    }
    setIsLoading(true);
    setDeleteError("");

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete account.");
      }

      logout();
      router.push("/auth/login?message=Account deleted successfully.");
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setIsLoading(false);
      // Do not close modal on error, let user see the error
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading profile...
      </div>
    ); // Or a proper loading spinner
  }

  //   console.log(currentUser);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-2xl">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-semibold mb-4 border-4 border-white shadow-lg">
          {currentUser?.firstName?.charAt(0)?.toUpperCase()}
          {currentUser?.lastName?.charAt(0)?.toUpperCase()}
        </div>
        <h1 className="text-3xl font-bold text-gray-800">
          {currentUser?.firstName} {currentUser?.lastName}
        </h1>
        <p className="text-md text-gray-500">{currentUser?.email}</p>
      </div>

      {/* <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Profile</h1> */}

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-4 text-sm text-green-600 bg-green-100 p-3 rounded">
          {message}
        </p>
      )}

      <div className="bg-white shadow-xl rounded-lg p-6">
        <form onSubmit={handleProfileUpdate}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={currentUser.email || ""}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm"
            />
          </div>

          {["firstName", "lastName", "username"].map((field) => (
            <div className="mb-4" key={field}>
              <label
                htmlFor={field}
                className="block text-sm font-medium text-gray-700 capitalize"
              >
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type="text"
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleInputChange}
                disabled={!isEditing || isLoading}
                required
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>
          ))}

          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={handleEditToggle}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                isEditing
                  ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
            {isEditing && (
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:bg-green-300"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-semibold text-red-600 mb-3">Danger Zone</h2>
        <button
          onClick={handleDeleteAccount}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:bg-red-300"
        >
          Delete My Account
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-5 sm:p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">
              Confirm Account Deletion
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone. To confirm, please type your
              username (
              <span className="font-semibold text-gray-700">
                {currentUser.username}
              </span>
              ) in the box below.
            </p>
            <input
              type="text"
              value={confirmUsername}
              onChange={(e) => setConfirmUsername(e.target.value)}
              placeholder="Enter your username"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm mb-3"
            />
            {deleteError && (
              <p className="text-sm text-red-600 mb-3">{deleteError}</p>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={
                  isLoading || confirmUsername !== currentUser?.username
                }
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                {isLoading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
