import React from 'react'
import { useParams, Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetEventByIdQuery } from '../api/eventApiSlice.js'; // RTK query hook to fetch event data
import JitsiMeet from '../components/liveEvent/JitsiMeet.jsx'; // Jitsi component
import { selectCurrentUser } from '../slices/authSlice.js'; // auth selector
import { useCheckRegistrationStatusQuery } from '../api/registrationApiSlice.js'; // reg status check hook

// Reusable Loading/Error components
const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-10 min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
);

const ErrorDisplay = ({ message, showHomeLink = false }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center min-h-[50vh] flex flex-col justify-center items-center" role="alert">
        <div>
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {message || 'Could not load event data.'}</span>
        </div>
        {showHomeLink && (
            <Link to="/" className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Go Home</Link>
        )}
    </div>
);

function EventLivePage() {
    const { eventId } = useParams();
    const currentUser = useSelector(selectCurrentUser);

    // Fetch event detailes
    const {
        data: eventData,
        isLoading: isLoadingEvent,
        isError: isErrorEvent,
        error: errorEvent,
    } = useGetEventByIdQuery(eventId, { skip: !eventId });

    // Check registration status
    const {
        data: registrationStatusData,
        isLoading: isLoadingStatus,
        isError: isErrorStatus,
    } = useCheckRegistrationStatusQuery(eventId, {
        skip: !currentUser || !eventId, // Skip if not logged in or invalid eventId
    });

    const event = eventData?.data;
    const isRegistered = registrationStatusData?.data?.isRegistered;
    const isLoading = isLoadingEvent || (currentUser && isLoadingStatus);
    
    // --- Check Access ---
    // Loading state
    if (isLoading) {
        return <LoadingSpinner />;
    }

    // Error fetching event
    if (isErrorEvent || !event) {
        return <ErrorDisplay message={errorEvent?.data?.message || 'Event not found.'} showHomeLink />;
    }

    // Check if user is logged in (double-check)
    if (!currentUser) {
        console.warn("EventLivePage accessed without user. Redirecting via Navigate.");
        // Redirect to login, preserving intended destination
        return <Navigate to="/login" state={{ from: `/events/${eventId}/live` }} replace />;
    }

    // Check if the user is registered for the event
    if(!isRegistered) {
        // Require registration unless they are admin/organizer
        const canAccessAsStaff = currentUser && event.organizer && (currentUser._id === event.organizer._id || currentUser.role === 'admin');
        if(!canAccessAsStaff) {
            return <ErrorDisplay message="You are not registered for this event" showHomeLink />;
        }
        console.log("User is staff, allowing access without registration");
    }

    // Check if event status allows joining
    const now = new Date();
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);
    const isCurrentlyLive = now >= startTime && now < endTime && event.status === 'live';
    
    // Allow joining for live events only
    if (!isCurrentlyLive) {
        return <ErrorDisplay message={`This event is not currently live (Status: ${event.status}).`} showHomeLink />;
    }

  return (
    <div className="space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="pb-4 border-b border-gray-200">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{event.title}</h1>
            {/* Show live event badge */}
            {isCurrentlyLive && (
                <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold ml-2 px-2.5 py-0.5 rounded-full align-middle">
                    LIVE
                </span>
            )}
        </div>

        {/* Layout for Video and Chat/Q&A */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Video area */}
            <div className="lg:col-span-2">
                <JitsiMeet
                    roomName={event.jitsiRoomName}
                    displayName={currentUser.name}
                    eventTitle={event.title}
                />
            </div>

            {/* Sidebar for Chat/Q&A */}
            <div className="lg:col-span-1 space-y-6">
            {/* Placeholder for Chat Component */}
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 min-h-[300px]">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Chat</h2>
                <p className="text-gray-500">Real-time chat coming soon...</p>
                {/* Chat messages and input will go here */}
            </div>

            {/* Placeholder for Q&A Component */}
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 min-h-[300px]">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Q&A</h2>
                <p className="text-gray-500">Question and Answer section coming soon...</p>
                {/* Q&A list and input will go here */}
            </div>
            </div>
        </div>
    </div>
  )
}

export default EventLivePage;