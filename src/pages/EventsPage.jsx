import React, { useState } from "react";
import EventCard from "../components/events/EventCard.jsx";
import { useGetEventsQuery } from "../api/eventApiSlice.js"; // RTK query hook

// Placeholder for a loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-10">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

// Placeholder for an error message component
const ErrorDisplay = ({ message }) => (
  <div
    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center"
    role="alert"
  >
    <strong className="font-bold">Error:</strong>
    <span className="block sm:inline">
      {" "}
      {message || "Could not fetch events."}
    </span>
  </div>
);

function EventsPage() {
  // State for potential filtering/pagination
  // State for filters to be added later
  // const [statusFilter, setStatusFilter] = useState('upcoming');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Data fetching using RTK query hook
  const {
    data: eventsData,
    isLoading,
    isFetching,
    isError,
    error,
    isSuccess,
  } = useGetEventsQuery({
    // Parameters for filtering/pagination
    // status: statusFilter,
    page: currentPage,
    limit: itemsPerPage,
    sortBy: "startTime", // Default
    order: "asc",
  });

  // Extract events and pagination info safely
  const events = eventsData?.data?.events || [];
  const pagination = eventsData?.data?.pagination || {};

  let content; // for content rendering

  if (isLoading) {
    content = <LoadingSpinner />;
  } else if (isError) {
    content = <ErrorDisplay message={error?.data?.message || error?.error} />;
  } else if (isSuccess && events.length === 0) {
    content = (
      <p className="text-center text-gray-600 py-10">
        No events found matching your criteria.
      </p>
    );
  } else if (isSuccess && events.length > 0) {
    content = (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    );
  } else {
    // Fallback for unexpected states
    content = (
      <p className="text-center text-gray-600 py-10">Could not load events.</p>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
        Browse Events
      </h1>

      {/* TODO: Add Filtering/Sorting Controls Here */}
      {/* <div className="flex justify-between items-center mb-6"> ... filters ... </div> */}

      {/* Display Loading/Error/Content */}
      {isFetching && !isLoading && (
        <p className="text-center text-indigo-600">Updating...</p>
      )}
      {content}

      {/* TODO: Add Pagination Controls Here */}
      {/*
      {isSuccess && pagination && pagination.totalPages > 1 && (
         <div className="mt-8 flex justify-center">
            // Pagination component using pagination.currentPage, pagination.totalPages, setCurrentPage
         </div>
      )}
      */}
    </div>
  );
}

export default EventsPage;
