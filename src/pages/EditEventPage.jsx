import React from "react";
import { useParams, Link } from "react-router-dom";
import EventForm from "../components/events/EventForm.jsx"; // Import the form component
import { useGetEventByIdQuery } from "../api/eventApiSlice.js"; // Hook to fetch event data

// Reusable Loading/Error components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-10">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);
const ErrorDisplay = ({ message }) => (
  <div
    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center"
    role="alert"
  >
    <strong className="font-bold">Error:</strong>
    <span className="block sm:inline">
      {" "}
      {message || "Could not load event data for editing."}
    </span>
    <Link to="/events" className="ml-4 underline font-medium">
      Go back to events
    </Link>
  </div>
);

function EditEventPage() {
  const { eventId } = useParams(); // Get eventId from URL

  // Fetch the event data
  const {
    data: eventData,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useGetEventByIdQuery(eventId, {
    skip: !eventId, // Don't fetch if eventId is missing
  });

  // Determine content based on fetch state
  let content;
  if (isLoading) {
    content = <LoadingSpinner />;
  } else if (isError || !eventData?.data) {
    content = (
      <ErrorDisplay
        message={error?.data?.message || "Event not found or failed to load."}
      />
    );
  } else if (isSuccess && eventData.data) {
    // Pass the fetched event data to the form
    content = <EventForm eventToEdit={eventData.data} />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Edit Event
        </h1>
        {content}
      </div>
    </div>
  );
}

export default EditEventPage;
