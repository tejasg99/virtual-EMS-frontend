import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineVideoCamera,
  HiOutlinePencil,
  HiOutlineTrash
} from "react-icons/hi";

// RTK query hooks
import { useGetEventByIdQuery, useDeleteEventMutation } from "../api/eventApiSlice.js";
import {
  useCheckRegistrationStatusQuery,
  useRegisterForEventMutation,
  useUnregisterFromEventMutation,
} from "../api/registrationApiSlice.js";

// Redux state selector
import { selectCurrentUser } from "../slices/authSlice.js";

// Placeholder Loading and Error components
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
      {message || "Could not fetch event details."}
    </span>
  </div>
);

// Configuration for time checks
const ACTIVE_CHECK_INTERVAL_MS = 15000; // 15 seconds for active checking when event is near/live
const PRE_LIVE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes before start time to begin active checks
const FAR_FUTURE_CHECK_INTERVAL_MS = 60000 * 2; // 2 minutes for less frequent checks if event is far off

function EventDetailPage() {
  const { eventId } = useParams(); // Get eventId from URL parameters
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser); // User info

  const {
    data: eventData,
    isLoading: isLoadingEvent,
    isError: isErrorEvent,
    error: errorEvent,
    refetch: refetchEvent,
  } = useGetEventByIdQuery(eventId, {
    skip: !eventId, // Skip fetching if eventId is invalid
  });

  // Fetch user registration status for this event
  const { data: registrationStatusData, isLoading: isLoadingStatus } =
    useCheckRegistrationStatusQuery(eventId, {
      skip: !currentUser || !eventId, // Skip if not logged in or eventId is invalid
    });

  // Mutation hooks for register and unregister
  const [register, { isLoading: isRegistering }] =
    useRegisterForEventMutation();
  const [unregister, { isLoading: isUnregistering }] =
    useUnregisterFromEventMutation();

  // Mutation hook for delete event
  const [deleteEvent, { isLoading: isDeletingEvent }] = useDeleteEventMutation();

  const [currentTime, setCurrentTime] = useState(new Date());
  const event = eventData?.data;
  
  const activeTimerIdRef = useRef(null); // Ref for the 15-second interval
  const recheckTimerIdRef = useRef(null); // Ref for the less frequent re-check interval

  // Effect to update current time periodically, with optimized intervals
  useEffect(() => {
    const clearAllTimers = () => {
      if (activeTimerIdRef.current) {
        clearInterval(activeTimerIdRef.current);
        activeTimerIdRef.current = null;
      }
      if (recheckTimerIdRef.current) {
        clearInterval(recheckTimerIdRef.current);
        recheckTimerIdRef.current = null;
      }
    }

    if (!event || !event.startTime || !event.endTime) {
      clearAllTimers();
      return;
    }

    const startTimeMs = new Date(event.startTime).getTime();
    const endTimeMs = new Date(event.endTime).getTime();

    const manageTimeUpdates = () => {
      const nowMs = Date.now();
      setCurrentTime(new Date(nowMs)); // Update time for immediate calculation

      // Stop all checks if event has clearly ended (e.g., 5 mins past end time)
      if (nowMs > endTimeMs + (5 * 60000)) {
        console.log("[EventDetailPage] Event ended. Stopping all time updates.");
        clearAllTimers();
        return;
      }

      // Condition to run the ACTIVE 15-second interval:
      // 1. Event is 'upcoming' AND within PRE_LIVE_WINDOW_MS of starting or backend status is live
      const shouldRunActiveInterval = (event.status === 'upcoming' && (startTimeMs - nowMs) <= PRE_LIVE_WINDOW_MS && (startTimeMs - nowMs) > -ACTIVE_CHECK_INTERVAL_MS) || event.status === 'live';

      if(shouldRunActiveInterval) {
        if(recheckTimerIdRef.current) { // Clear less frequent timer if active one starts
          clearInterval(recheckTimerIdRef.current);
          recheckTimerIdRef.current = null;
          console.log("[EventDetailPage] Switched to active time updates, cleared re-check interval.");
        }

        if(!activeTimerIdRef.current) { // Only set if not already running
          console.log("[EventDetailPage] Starting active time updates (every 15s).");
          activeTimerIdRef.current = setInterval(() => {
            setCurrentTime(new Date());
          }, ACTIVE_CHECK_INTERVAL_MS)
        }
      } else {
        // If active conditions are not met, clear the active timer
        if (activeTimerIdRef.current) {
          clearInterval(activeTimerIdRef.current);
          activeTimerIdRef.current = null;
          console.log("[EventDetailPage] Stopping active time updates.");
        }

        // If event is upcoming but further out than PRE_LIVE_WINDOW_MS, set up a less frequent re-check
        if(event.status === 'upcoming' && (startTimeMs - nowMs) > PRE_LIVE_WINDOW_MS) {
          if(!recheckTimerIdRef.current) {
            console.log("[EventDetailPage] Event is upcoming but not near. Setting up less frequent re-check.");
            recheckTimerIdRef.current = setInterval(manageTimeUpdates, FAR_FUTURE_CHECK_INTERVAL_MS);
          }
        }
      }
    };

    manageTimeUpdates(); // Initial check and setup

    return clearAllTimers; // Cleanup on unmount or when event data changes
  }, [event]); // Rerun if event data changes

  // Memoized calculation of event statuses
  const eventTimings = useMemo(() => {
    if (!event?.startTime || !event?.endTime) {
      return { startTimeObj: null, endTimeObj: null, isLocallyLive: false, isUpcoming: false, isPast: false };
    }

    const startTimeObj = new Date(event.startTime);
    const endTimeObj = new Date(event.endTime);
    const isLocallyLive = currentTime >= startTimeObj && currentTime < endTimeObj;
    const isUpcoming = currentTime < startTimeObj;
    const isPast = currentTime >= endTimeObj;
    return { startTimeObj, endTimeObj, isLocallyLive, isUpcoming, isPast };
  }, [event, currentTime]);

  // Effect to refetch event data if local time indicates it should be live
  useEffect(() => {
    // Only refetch if status is 'upcoming' and local time says it's live, and refetch function exists
    if (event && event.status === 'upcoming' && eventTimings.isLocallyLive && refetchEvent) {
      console.log(`[EventDetailPage] Event "${event.title}" should be live by local time (status: ${event.status}). Refetching event data...`);
      refetchEvent();
    }
  }, [event, eventTimings.isLocallyLive, refetchEvent]);

  // Extract data safely
  const isRegistered = registrationStatusData?.data?.isRegistered || false;
  const isLoading = isLoadingEvent || (currentUser && isLoadingStatus); // Combined loading state

  // Handlers
  const handleRegister = async () => {
    if (!currentUser) {
      toast.error("Please log in to register for events");
      navigate("/login", { state: { from: `/events/${eventId}` } }); // Redirect to login and remember where the user came from
      return;
    }

    try {
      await register(eventId).unwrap();
      toast.success("Successfully Registered");
      // Registration status query will refetch automatically due to tag invalidation
    } catch (err) {
      console.error("Registration Failed: ", err);
      toast.error(
        err?.data?.message || "Registration failed. Please try again"
      );
    }
  };

  const handleUnregister = async () => {
    if (!currentUser) return; // Should not happen if button is shown correctly
    try {
      await unregister(eventId).unwrap();
      toast.success("Successfully unregistered.");
      // Status query will refetch automatically
    } catch (err) {
      console.error("Unregistration failed:", err);
      toast.error(
        err?.data?.message || "Unregistration failed. Please try again."
      );
    }
  };

  const handleDelete = async (eventId, eventTitle) => {
    if(window.confirm(`Are you sure you want to permanently delete the event "${eventTitle}"? This action cannot be undone.`)) {
      try {
        await deleteEvent(eventId).unwrap();
        toast.success(`Event "${eventTitle}" deleted successfully.`);
        // Redirect to browse events page
        navigate('/events');
      } catch (err) {
        toast.error(err?.data?.message || `Failed to delete event "${eventTitle}".`);
      }
    }
  };

  // Date formatting
  let formattedDate = "";
  let formattedStartTime = "";
  let formattedEndTime = "";
  if (event?.startTime && eventTimings.startTimeObj) {
    try {
      // const start = new Date(event.startTime);
      formattedDate = format(eventTimings.startTimeObj, "EEEE, MMMM d, yyyy"); // e.g., Wednesday, April 24, 2025
      formattedStartTime = format(eventTimings.startTimeObj, "p"); // e.g., 11:00 AM
    } catch (e) {
      console.error("Error formatting start date:", e);
    }
  }
  if (event?.endTime && eventTimings.endTimeObj) {
    try {
      formattedEndTime = format(eventTimings.endTimeObj, "p"); // e.g., 1:00 PM
    } catch (e) {
      console.error("Error formatting end date:", e);
    }
  }

  // Conditional rendering
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isErrorEvent || !event) {
    return (
      <ErrorDisplay message={errorEvent?.data?.message || "Event not found"} />
    );
  }

  // Determine if event is upcoming, past or live
  // const now = new Date();
  // const startTime = new Date(event.startTime);
  // const endTime = new Date(event.endTime);
  // const isLive = now >= startTime && now < endTime || event.status === "live";
  // const isUpcoming = now < startTime && event.status === "upcoming";
  // const isPast = now >= endTime || event.status === "past";
  // const canRegister = isUpcoming || (isLive && !isPast); // allow registration for upcoming and live events only

  const effectiveIsLive = event.status === 'live' || (event.status === 'upcoming' && eventTimings.isLocallyLive);
  const effectiveIsPast = event.status === 'past' || (event.status !== 'live' && event.status !== 'upcoming' && eventTimings.isPast); // More precise past check
  const effectiveIsUpcoming = event.status === 'upcoming' && !eventTimings.isLocallyLive && !effectiveIsPast;

  // Check if the user can edit the event(only admin and organizer)
  const canEditAndDelete = currentUser && event.organizer && (currentUser._id === event.organizer._id || currentUser.role === 'admin');
  const canRegister = effectiveIsUpcoming || (effectiveIsLive && !effectiveIsPast);

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200">
      {/* Event header and Edit button */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        {/* Left side: Title/Organizer */}
        <div className="flex justify-between items-start gap-4">
          {event.eventType && (
            <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold mb-2 px-2.5 py-0.5 rounded capitalize">
              {event.eventType.replace("_", " ")}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {event.title}
          </h1>
          <p className="text-lg text-gray-600">
            Organized by {event.organizer?.name || "Unknown"}
          </p>          
        </div>
        {/* Right side: Edit Button (Conditional) */}
        {canEditAndDelete && (
          <div className="w-full flex justify-between">
            <Link
              to={`/edit-event/${eventId}`}
              className="inline-flex items-center mt-1 flex-shrink-0 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label="Edit event"
            >
            <HiOutlinePencil className="w-5 h-5 mr-2"/>
            Edit
            </Link>
            <button
              onClick={() => handleDelete(event._id, event.title)}
              disabled={isDeletingEvent}
              className="inline-flex items-center border border-gray-300 px-4 py-2 mt-1 text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-700 hover:cursor-pointer"
            > 
              <HiOutlineTrash className="w-5 h-5 mr-2"/>
              {isDeletingEvent ? 'Deleting...' : 'Delete'}
            </button>            
          </div>

        )}

      </div>
      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column (Details) */}
        <div className="md:col-span-2 space-y-5">
          {/* Date & Time */}
          <div className="flex items-start">
            <HiOutlineCalendar className="w-6 h-6 mr-3 text-indigo-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800">Date & Time</h3>
              <p className="text-gray-600">{formattedDate}</p>
              <p className="text-gray-600">
                {formattedStartTime} - {formattedEndTime}{" "}
              </p>
              {/* TODO: Add timezone info */}
            </div>
          </div>
          {/* Location and join link*/}
          <div className="flex items-start">
            <HiOutlineLocationMarker className="w-6 h-6 mr-3 text-indigo-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800">Location</h3>
              <p className="text-gray-600">Virtual Event</p>
              {/* Link to join if live and registered */}
              {effectiveIsLive && isRegistered && (
                <Link
                  to={`/events/${eventId}/live`}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <HiOutlineVideoCamera className="w-5 h-5 mr-2" /> 
                  Join Live Event
                </Link>
              )}
              {effectiveIsLive && !isRegistered && canRegister && (
                <p className="text-sm text-orange-600 mt-1">
                  Register below to join the live event.
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              About this Event
            </h3>
            {/* Use whitespace-pre-wrap to respect newlines from backend */}
            <p className="text-gray-700 whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          {/* Speakers */}
          {event.speakers && event.speakers.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Speakers
              </h3>
              <div className="space-y-3">
                {event.speakers.map((speaker) => (
                  <div
                    key={speaker._id}
                    className="flex items-center space-x-3"
                  >
                    <HiOutlineUser className="w-6 h-6 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700">{speaker.name}</span>
                    {/* Add speaker bio/title if available */}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Registration/Status) */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
            {/* Display different content based on event status and registration */}
            {effectiveIsPast && (
                <p className="font-semibold text-gray-600">This event has ended.</p>
            )}
            
            {!effectiveIsPast && currentUser && isRegistered && (
                <>
                    <p className="font-semibold text-green-700 mb-3">You are registered!</p>
                    {/* Allow unregistering anytime before the end of event */}
                    <button
                        onClick={handleUnregister}
                        disabled={isUnregistering}
                        className={`w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isUnregistering ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isUnregistering ? 'Unregistering...' : 'Cancel Registration'}
                      </button>
                </>
            )}

            {!effectiveIsPast && currentUser && !isRegistered && canRegister && (
                <button
                    onClick={handleRegister}
                    disabled={isRegistering}
                    className={`w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isRegistering ? 'Registering...' : 'Register for this Event'}
                </button>
            )}

            {!effectiveIsPast && !currentUser && canRegister && (
                 <button
                    onClick={() => navigate('/login', { state: { from: `/events/${eventId}` } })}
                    className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                 >
                    Log in to Register
                 </button>
             )}
             {!effectiveIsPast && !canRegister && ( // Event is cancelled or status prevents registration
                 <p className="font-semibold text-gray-600">Registration is currently closed for this event.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetailPage;
