import React, { useEffect, useState, useRef } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast, Toaster } from "react-hot-toast";

import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import { useGetUserRegistrationsQuery } from '../../api/registrationApiSlice.js'; // Hook to get user's registrations
import { selectCurrentUser } from "../../slices/authSlice.js"; // user selector

// Configuration for reminders
const NOTIFICATION_WINDOW_MS = 15 * 60 * 1000; // Time before event starts to show notifications(15 mins)
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // How often to check for upcoming events (e.g., every 5 minutes in milliseconds)
const TOAST_DURATION_MS = 15000; // How long to show the toast notification (e.g., 15 seconds)

function MainLayout() {
  const currentUser = useSelector(selectCurrentUser);
  const location = useLocation(); // Get current location

  // Fetch user's upcoming registrations(logged in only)
  const { data: registrationData } = useGetUserRegistrationsQuery(
    { status: 'upcoming', limit: 10 },
    {
        skip: !currentUser, // Skip if not logged in
        // Refetch periodically or on window focus if desired
        // pollingInterval: 300000, // e.g., every 5 minutes
        // refetchOnFocus: true,
    }
  );

  // State to keep track of shown notifications to avoid duplicates per session
  const [shownNotifications, setShownNotifications] = useState(new Set());
  const intervalRef = useRef(null); // to store interval ID

  useEffect(() => {
    // Clear previous interval if dependencies change (e.g., user logs out/in)
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const upcomingRegistrations = registrationData?.data?.registrations;
    // Only run if user is logged in and has registration data
    if(currentUser && upcomingRegistrations && Array.isArray(upcomingRegistrations)) {
      const checkEvents = () => {
        const now = Date.now();
        console.log(`[Reminder Check] Running check at ${new Date().toLocaleTimeString()}`)

        upcomingRegistrations.forEach(reg => {
          // Ensure event data exists and has necessary fields
          if(!reg?.event?._id || !reg?.event?.startTime || !reg?.event?.title) {
            console.warn("[Reminder Check] Skipping registration with missing event data:", reg);
            return;
          }

          const eventId = reg.event._id;
          const eventTitle = reg.event.title;

          // Skip if already notified in this session
          if(shownNotifications.has(eventId)) {
            return;
          }

          try {
            const startTime = new Date(reg.event.startTime).getTime();
            const timeUntilStart = startTime - now;

            // Check if event starts within the window and reminder time is positive
            if(timeUntilStart > 0 && timeUntilStart <= NOTIFICATION_WINDOW_MS) {
              console.log(`[Reminder Check] Event "${eventTitle}" starting soon!`);
              // Show toast notification
              toast((t) => (
                <div className="flex items-start space-x-3">
                  <span className="text-xl mt-1">🔔</span>
                  <div>
                    <p className="font-semibold">Event Starting Soon!</p>
                    <p className="text-sm">"{eventTitle}" is starting in about {Math.round(timeUntilStart / 60000)} minutes.</p>
                    <Link
                      to={`/events/${eventId}/live`}
                      onClick={() => toast.dismiss(t.id)} // Dismiss toast on click
                      className="mt-2 inline-block text-sm text-indigo-600 hover:underline font-medium"
                    >
                      Go to Event &rarr;
                    </Link>
                  </div>
                  {/* Simple close button */}
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="ml-auto p-1 -mr-1 text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full"
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>
              ), {
                duration: TOAST_DURATION_MS, // Show for longer
                id: `reminder-${eventId}`, // Use unique ID to prevent duplicates if check runs fast
              });

              // Add event ID to shown notifications set for this session
              setShownNotifications((prev) => new Set(prev).add(eventId));
            }
          } catch (e) {
            console.error("[Reminder Check] Error processing event time for reminder:", eventTitle, e);
          }
        });
      };
      // Run the check immediately when the effect runs
      checkEvents();

      // Set up interval to check periodically
      intervalRef.current = setInterval(checkEvents, CHECK_INTERVAL_MS);
      console.log(`[Reminder Check] Interval set with ID: ${intervalRef.current}`);
    } else {
      console.log("[Reminder Check] No user or registration data, skipping interval setup.");
    }
    
    // Cleanup function: clear interval when component unmounts or dependencies change
    return () => {
      if(intervalRef.current) {
        clearInterval(intervalRef.current);
        console.log(`[Reminder Check] Interval ${intervalRef.current} cleared.`);
        intervalRef.current = null;
      }
    };
  // Rerun effect if user logs in/out or registration data changes
  // Adding location.pathname might cause too frequent checks if not needed, remove if causing issues
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, registrationData]);
  

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-grow container mx-auto my-1">
        <Outlet />
      </main>
      <Footer />
      {/* Toast container for notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Define default options
          className: "border border-gray-200 shadow-lg rounded-lg p-4",
          duration: 5000,
          style: {
            background: "#ffffff", // Light bg
            color: "#1f2937", // Dark text
          },
          // Default options for specific types
          success: {
            duration: 3000,
            // theme: {
            //   primary: "green",
            //   secondary: "black",
            // },
          },
          error: {
            duration: 5000,
          },
        }}
      />
    </div>
  );
}

export default MainLayout;
