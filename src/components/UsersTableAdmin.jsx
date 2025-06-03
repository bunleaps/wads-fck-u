import React from "react";
import Link from "next/link";
import { FiMoreVertical, FiEdit, FiTrash2, FiEye } from "react-icons/fi"; // Icons for actions

export default function UsersTableAdmin({ users, onEditUser, onDeleteUser }) {
  const [openMenuId, setOpenMenuId] = React.useState(null);

  const toggleMenu = (userId) => {
    setOpenMenuId(openMenuId === userId ? null : userId);
  };

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3 font-semibold">Name</th>
            <th className="px-6 py-3 font-semibold">Username</th>
            <th className="px-6 py-3 font-semibold">Email</th>
            <th className="px-6 py-3 font-semibold">Role</th>
            <th className="px-6 py-3 font-semibold text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-600">
                {user.firstName} {user.lastName}
              </td>
              <td className="px-4 py-2 text-gray-600">{user.username}</td>
              <td className="px-4 py-2 text-gray-600">{user.email}</td>
              <td className="px-4 py-2 text-gray-600">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === "admin"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-2 text-center">
                {" "}
                {/* Removed 'relative' here */}
                <div className="relative inline-block text-left">
                  {" "}
                  {/* Added wrapper for positioning context */}
                  <button
                    onClick={() => toggleMenu(user._id)}
                    className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    aria-label="Actions"
                    aria-haspopup="true"
                    aria-expanded={openMenuId === user._id}
                  >
                    <FiMoreVertical />
                  </button>
                  {openMenuId === user._id && (
                    <div
                      className={`absolute z-20 right-0 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5
                                  ${
                                    users.indexOf(user) >= users.length - 3
                                      ? "bottom-full mb-1"
                                      : "top-full mt-1"
                                  }`}
                      role="menu"
                      onMouseLeave={() => setOpenMenuId(null)} // Close on mouse leave
                    >
                      <Link
                        href={`/dashboard/users/${user.username}`}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={() => setOpenMenuId(null)}
                      >
                        <FiEye className="mr-2" /> View Details
                      </Link>
                      <button
                        onClick={() => {
                          onEditUser(user);
                          setOpenMenuId(null);
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        <FiEdit className="mr-2" /> Edit User
                      </button>
                      <button
                        onClick={() => {
                          onDeleteUser(user);
                          setOpenMenuId(null);
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        role="menuitem"
                      >
                        <FiTrash2 className="mr-2" /> Delete User
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
