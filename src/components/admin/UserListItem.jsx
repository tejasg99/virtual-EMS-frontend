import React, { useState } from "react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import {
  HiOutlineTrash,
  HiOutlinePencilAlt,
  HiOutlineSave,
  HiOutlineXCircle,
} from "react-icons/hi";

// RTK query hook
import {
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} from "../../api/userApiSlice.js";

// Define available roles
const availableRoles = ["attendee", "organizer", "speaker", "admin"];

function UserListItem({ user, currentAdminId }) {
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);

  // Mutation hooks
  const [updateRole, { isLoading: isUpdatingRole }] =
    useUpdateUserRoleMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  // Save the updated role
  const handleSaveRole = async () => {
    if (selectedRole === user.role) {
      setIsEditingRole(false); // no change just close edit mode
      return;
    }

    // Prevent admin from changing their own role via this interface
    if (user._id === currentAdminId && selectedRole !== "admin") {
      toast.error("Cannot change your own role from Admin via this panel.");
      setSelectedRole("admin");
      setIsEditingRole(false);
      return;
    }

    try {
      await updateRole({ userId: user._id, role: selectedRole }).unwrap();
      toast.success(`Role for ${user.name} updated to ${selectedRole}`);
      setIsEditingRole(false); // close on success
      // List will refetch due to tag invalidation
    } catch (err) {
      console.error("Failed to update role:", err);
      toast.error(err?.data?.message || "Failed to update role.");
      setSelectedRole(user.role); // Reset selection on error
      setIsEditingRole(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    // Prevent admin from deleting themselves
    if (user._id === currentAdminId) {
      toast.error("You cannot delete your own account");
      return;
    }

    // Confirmation dialogue
    if (
      window.confirm(
        `Are you sure you want to delete user ${user.name} (${user.email})? This action cannot be undone.`
      )
    ) {
      try {
        await deleteUser(user._id).unwrap();
        toast.success(`User ${user.name} deleted successfully.`);
        // List will refetch due to tag invalidation
      } catch (err) {
        console.error("Failed to delete user:", err);
        toast.error(err?.data?.message || "Failed to delete user.");
      }
    }
  };

  const registrationDate = user.createdAt
    ? format(new Date(user.createdAt), "PP")
    : "N/A"; // Format date e.g. Apr 23, 2025

  return (
    <tr className="bg-white hover:bg-gray-50 border-b last:border-b-0">
      {/* Name */}
      <td className="px-4 py-3 text-sm font-medium text-gray-900">
        {user.name}
      </td>
      {/* Email */}
      <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
      {/* Role */}
      <td className="px-4 py-3 text-sm text-gray-600 capitalize">
        {isEditingRole ? (
          <div className="flex items-center space-x-2">
            <select
              value={selectedRole}
              onChange={handleRoleChange}
              disabled={isUpdatingRole}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-2 py-1"
            >
              {availableRoles.map((role) => (
                <option key={role} value={role} className="capitalize">
                  {role}
                </option>
              ))}
            </select>
            <button
              onClick={handleSaveRole}
              disabled={isUpdatingRole || selectedRole === user.role}
              className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Save role"
            >
              <HiOutlineSave className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setIsEditingRole(false);
                setSelectedRole(user.role);
              }}
              disabled={isUpdatingRole}
              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              aria-label="Cancel role edit"
            >
              <HiOutlineXCircle className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span>{user.role}</span>
            {/* Don't allow editing own role if admin */}
            {!(user._id === currentAdminId && user.role === "admin") && (
              <button
                onClick={() => setIsEditingRole(true)}
                className="ml-2 p-1 text-gray-400 hover:text-indigo-600"
                aria-label="Edit role"
              >
                <HiOutlinePencilAlt className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </td>
      {/* Registered Date */}
      <td className="px-4 py-3 text-sm text-gray-600">{registrationDate}</td>
      {/* Actions */}
      <td className="px-4 py-3 text-right">
        {/* Prevent admin from deleting themselves */}
        {user._id !== currentAdminId && (
          <button
            onClick={handleDeleteUser}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Delete user"
          >
            {isDeleting ? (
              "Deleting..."
            ) : (
              <HiOutlineTrash className="w-5 h-5" />
            )}
          </button>
        )}
      </td>
    </tr>
  );
}

export default UserListItem;
