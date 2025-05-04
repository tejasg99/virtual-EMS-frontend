import React, { useState } from "react";
import { Link } from "react-router-dom";
import OrganizerEventRow from "../components/dashboard/OrganizerEventRow.jsx";
import StatCard from "../components/dashboard/StatCard.jsx";
import { useGetMyOrganizedEventsQuery, useGetOrganizerStatsQuery } from "../api/eventApiSlice.js"; // Hook to fetch organizer's event list and stats
import { HiChevronLeft, HiChevronRight, HiPlusCircle, HiOutlineCollection, HiOutlineCalendar, HiOutlineFire, HiOutlineUsers } from "react-icons/hi";

// Reusable Loading/Error/Pagination components (assuming they exist or are defined here)
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
      {message || "Could not load your events."}
    </span>
  </div>
);

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  isFetching,
}) => {
  if (!totalPages || totalPages <= 1) return null;
  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };
  return (
    <div className="mt-6 flex items-center justify-center space-x-3">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1 || isFetching}
        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <HiChevronLeft className="w-5 h-5 mr-1" />
        Previous
      </button>
      <span className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages || isFetching}
        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
        <HiChevronRight className="w-5 h-5 ml-1" />
      </button>
    </div>
  );
};



function OrganizerDashboardPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Adjust as needed

    // Fetch events
    const {
        data: organizerEventsData,
        isLoading: isLoadingEvents,
        isFetching: isFetchingEvents,
        isError: isErrorEvents,
        error: errorEvents,
        isSuccess: isSuccessEvents
    } = useGetMyOrganizedEventsQuery({
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'startTime', // by default
        order: 'desc', // Show newest starting first
    });

    // Fetch Organizer Stats
    const {
        data: statsData,
        isLoading: isLoadingStats,
        isError: isErrorStats,
        error: errorStats
    } = useGetOrganizerStatsQuery(); // Call the stats hook

    const events = organizerEventsData?.data?.events || [];
    const pagination = organizerEventsData?.data?.pagination || {};
    const totalPages = pagination?.totalPages || 0;
    const stats = statsData?.data || {}; // empty stats as fallback

    const handlePageChange = (newPage) => {
      setCurrentPage(newPage);
    };

    // Render logic
    let eventListContent;
    if(isLoadingEvents) {
        eventListContent = <div className="text-center py-10"><LoadingSpinner /></div>;
    } else if (isErrorEvents) {
        eventListContent = <ErrorDisplay message={errorEvents?.data?.message || 'Failed to fetch your events.'} />;
    } else if (isSuccessEvents && events.length === 0) {
        eventListContent = <p className="text-center text-gray-600 py-10">You haven't created any events yet.</p>;
    } else if (isSuccessEvents && events.length > 0) {
        eventListContent = (
            <div className="overflow-x-auto shadow border border-gray-200 rounded-lg">
                <table  className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrations</th>
                            <th scope="col" className="relative px-4 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {events.map(event => (
                            <OrganizerEventRow key={Math.random()} event={event}/>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    } else {
        eventListContent = <p className="text-center text-gray-600 py-10">Could not load your events.</p>;
    }


  return (
    <div className="space-y-8 mx-5 md:mx-10 h-screen mt-5 md:mt-10">
      <div className="flex justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            My Events Dashboard
          </h1>
          <Link
             to="/create-event"
             className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
             <HiPlusCircle className="w-5 h-5 mr-2" />
             Create New Event
          </Link>
      </div>

      {/* Summary Stats card section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Events"
            // Use optional chaining and nullish coalescing for safety
            value={stats?.totalEvents ?? 0}
            icon={<HiOutlineCollection />}
            isLoading={isLoadingStats}
          />
          <StatCard
            title="Upcoming Events"
            value={stats?.upcomingEvents ?? 0}
            icon={<HiOutlineCalendar />}
            isLoading={isLoadingStats}
          />
          <StatCard
            title="Past Events"
            value={stats?.pastEvents ?? 0}
            icon={<HiOutlineCalendar />}
            isLoading={isLoadingStats}
          />
          <StatCard
            title="Live Events"
            value={stats?.liveEvents ?? 0}
            icon={<HiOutlineFire className="text-red-500" />}
            isLoading={isLoadingStats}
          />
          <StatCard
            title="Total Registrations"
            value={stats?.totalRegistrations ?? 0}
            icon={<HiOutlineUsers />}
            isLoading={isLoadingStats}
          />
      </div>
      {/* Display error if stats fetching fails */}
      {isErrorStats && <ErrorDisplay message={errorStats?.data?.message || 'Failed to load statistics.'} />}

      {/* Event List Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Your Event List</h2>
        {isFetchingEvents && <p className="text-center text-indigo-600 text-sm my-2">Loading events...</p>}
        {eventListContent}
        {isSuccessEvents && events.length > 0 && (
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isFetching={isFetchingEvents}
            />
        )}        
      </div>
    </div>
  )
};

export default OrganizerDashboardPage;
