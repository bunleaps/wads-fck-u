"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import withAuth from "@/components/withAuth";
import { getToken } from "@/utils/auth";
import UsersTableAdmin from "@/components/UsersTableAdmin";
import { FiUserPlus } from "react-icons/fi"; // For a potential "Add User" button

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

function UsersPage({ user }) {
  // user prop injected by withAuth
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // State for modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    role: "user",
  });
  const [deleteConfirmUsername, setDeleteConfirmUsername] = useState("");

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    setMessage("");
    const token = getToken();
    if (!token) {
      setError("Authentication token not found.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users || response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditUser = (userToEdit) => {
    setSelectedUser(userToEdit);
    setEditFormData({
      firstName: userToEdit.firstName || "",
      lastName: userToEdit.lastName || "",
      username: userToEdit.username || "",
      email: userToEdit.email || "", // Email might not be editable, adjust as needed
      role: userToEdit.role || "user",
    });
    setShowEditModal(true);
    setError("");
    setMessage("");
  };

  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsLoading(true); // Consider a specific loading state for the modal action
    setError("");
    setMessage("");
    const token = getToken();
    try {
      await axios.put(
        `${API_BASE_URL}/api/admin/users/${selectedUser._id}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("User updated successfully!");
      setShowEditModal(false);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = (userToDelete) => {
    setSelectedUser(userToDelete);
    setShowDeleteModal(true);
    setDeleteConfirmUsername("");
    setError("");
    setMessage("");
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser || deleteConfirmUsername !== selectedUser.username) {
      setError("Username confirmation does not match.");
      return;
    }
    setIsLoading(true); // Consider a specific loading state for the modal action
    setError("");
    setMessage("");
    const token = getToken();
    try {
      await axios.delete(
        `${API_BASE_URL}/api/admin/users/${selectedUser._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("User deleted successfully!");
      setShowDeleteModal(false);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && users.length === 0)
    return <div className="p-4 text-center">Loading users...</div>;
  // Error for initial load
  if (error && users.length === 0)
    return <div className="p-4 text-red-500 text-center">Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        {/* Optional: Add User Button
        <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          <FiUserPlus className="mr-2" /> Add User
        </button> */}
      </div>

      {/* Display general error/message for modal actions if needed, separate from initial load error */}
      {error && users.length > 0 && (
        <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-4 text-sm text-green-600 bg-green-100 p-3 rounded">
          {message}
        </p>
      )}

      <UsersTableAdmin
        users={users}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
      />

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Edit User: {selectedUser.username}
            </h2>
            <form onSubmit={handleUpdateUser}>
              {/* Add form fields for firstName, lastName, role. Username and Email might be read-only or not shown */}
              <div className="mb-3">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={editFormData.firstName}
                  onChange={handleEditFormChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={editFormData.lastName}
                  onChange={handleEditFormChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Role
                </label>
                <select
                  name="role"
                  id="role"
                  value={editFormData.role}
                  onChange={handleEditFormChange}
                  className="mt-1 p-2 w-full border rounded-md"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {/* Display error specific to modal action if any */}
              {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-2 text-red-600">
              Confirm Deletion
            </h2>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete user{" "}
              <span className="font-bold">{selectedUser.username}</span>? This
              action cannot be undone.
            </p>
            <p className="mb-1 text-sm text-gray-600">
              To confirm, type the username:
            </p>
            <input
              type="text"
              value={deleteConfirmUsername}
              onChange={(e) => setDeleteConfirmUsername(e.target.value)}
              placeholder={selectedUser.username}
              className="p-2 w-full border rounded-md mb-3"
            />
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={
                  isLoading || deleteConfirmUsername !== selectedUser.username
                }
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                {isLoading ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(UsersPage, ["admin"]); // Restrict to admin role
