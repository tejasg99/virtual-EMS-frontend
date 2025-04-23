import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { HiOutlineCalendar, HiOutlineClock, HiOutlineLocationMarker, HiOutlineUser } from 'react-icons/hi';


function EventCard({event}) {
    // Validation for event prop
    if(!event || !event._id) {
        return null; // Dont render if event data is missing
    }

    // Format dates
    let formattedStartDate = 'Date unavailable';
    let formattedStartTime = '';
    try {
        const startDate = new Date(event.startTime);
        formattedStartDate = format(startDate, 'MMM d, yyyy'); // Ex Apr 23 2025
        formattedStartTime = format(startDate, 'p'); // ex 11:00 AM
    } catch (e) {
        console.error('Error formatting the date: ', event.startTime, e);
    }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col">
      <div className="p-5 flex flex-col flex-grow">
        {/* Event Type Badge */}
        {event.eventType && (
          <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold mb-2 px-2.5 py-0.5 rounded self-start capitalize">
            {event.eventType.replace('_', ' ')}
          </span>
        )}

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate group-hover:text-indigo-600">
          {/* Link the title to the detail page */}
          <Link to={`/events/${event._id}`} className="hover:underline">
            {event.title || 'Untitled Event'}
          </Link>
        </h3>

        {/* Date and Time */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <HiOutlineCalendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{formattedStartDate}</span>
          <HiOutlineClock className="w-4 h-4 ml-3 mr-2 flex-shrink-0" />
          <span>{formattedStartTime}</span>
        </div>

        {/* Location (Virtual) */}
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <HiOutlineLocationMarker className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>Virtual Event</span>
        </div>

        {/* Organizer Info (Optional) */}
        {event.organizer && (
          <div className="flex items-center text-sm text-gray-500 mt-auto pt-3 border-t border-gray-100">
            <HiOutlineUser className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Organized by {event.organizer.name || 'Unknown Organizer'}</span>
          </div>
        )}
      </div>

      {/* Footer Link/Button (Alternative to linking title) */}
      {/*
      <div className="bg-gray-50 px-5 py-3">
        <Link
          to={`/events/${event._id}`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          View Details &rarr;
        </Link>
      </div>
      */}
    </div>
  )
}

export default EventCard