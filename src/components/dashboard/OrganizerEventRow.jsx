import React from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  HiOutlineCalendar,
  HiOutlineUsers,
  HiOutlinePencilAlt,
  HiOutlineEye,
  HiOutlineClipboardList,
} from "react-icons/hi";

function OrganizerEventRow({ event }) {
  if (!event) return null;

  const startDate = event.startTime
    ? format(new Date(event.startTime), "PP")
    : "N/A"; // e.g., Apr 24, 2025
  const startTime = event.startTime
    ? format(new Date(event.startTime), "p")
    : ""; // e.g., 11:00 AM

  // Determine the status badge color
  let statusColor = "bg-gray-100 text-gray-800";
  if (event.status === "live")
    statusColor = "bg-red-100 text-red-800 animate-pulse";
  else if (event.status === "upcoming")
    statusColor = "bg-blue-100 text-blue-800";
  else if (event.status === "past") statusColor = "bg-gray-100 text-gray-600";
  else if (event.status === "cancelled")
    statusColor = "bg-yellow-100 text-yellow-800";

  return (
    <tr className="bg-white hover:bg-gray-50 border-b last:border-b-0">
      {/* Title */}
      <td className="px-4 py-3 text-sm font-medium text-gray-900">
        <Link
          to={`/events/${event._id}`}
          className="hover:text-indigo-600 hover:underline"
        >
          {event.title}
        </Link>
      </td>
      {/* Status */}
      <td className="px-4 py-3 text-sm">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor} capitalize`}
        >
          {event.status}
        </span>
      </td>
      {/* Date */}
      <td className="px-4 py-3 text-sm text-gray-600">
        <div className="flex items-center">
          <HiOutlineCalendar className="w-4 h-4 mr-1.5 text-gray-400" />
          {startDate} ({startTime})
        </div>
      </td>
      {/* Registrations */}
      <td className="px-4 py-3 text-sm text-gray-600">
        <div className="flex items-center">
          <HiOutlineUsers className="w-4 h-4 mr-1.5 text-gray-400" />
          {event.registrationCount ?? "N/A"}
        </div>
      </td>
      {/* Actions */}
      <td className="px-4 py-3 text-sm font-medium text-right space-x-2">
        {/* View Registrations (Placeholder Link) */}
        <button
          onClick={() =>
            alert(`View registrations for ${event.title} (coming soon)`)
          }
          className="text-blue-600 hover:text-blue-800 inline-flex items-center"
          title="View Registrations"
        >
          <HiOutlineClipboardList className="w-5 h-5" />
        </button>
        {/* View Event */}
        <Link
          to={`/events/${event._id}`}
          className="text-green-600 hover:text-green-800 inline-flex items-center"
          title="View Event"
        >
          <HiOutlineEye className="w-5 h-5" />
        </Link>
        {/* Edit Event (only if not past/cancelled) */}
        {["upcoming", "live"].includes(event.status) && (
          <Link
            to={`/edit-event/${event._id}`}
            className="text-indigo-600 hover:text-indigo-800 inline-flex items-center"
            title="Edit Event"
          >
            <HiOutlinePencilAlt className="w-5 h-5" />
          </Link>
        )}
      </td>
    </tr>
  );
};

export default OrganizerEventRow;
