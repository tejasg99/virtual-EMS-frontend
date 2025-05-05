import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import { selectCurrentUser } from "../slices/authSlice.js"; // auth selector
import { useGetEventByIdQuery } from "../api/eventApiSlice.js"; // RTK query hook to fetch event data
import { useCheckRegistrationStatusQuery } from "../api/registrationApiSlice.js"; // reg status check hook
import JitsiMeet from "../components/liveEvent/JitsiMeet.jsx"; // Jitsi component
import ChatWindow from "../components/liveEvent/ChatWindow.jsx"; // ChatWindow component
import QnaList from '../components/liveEvent/QnaList.jsx'; // QnaList component 
import socketService from "../services/socketService.js"; // socket handler service

// Reusable Loading/Error components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-10 min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

const ErrorDisplay = ({ message, showHomeLink = false }) => (
  <div
    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center min-h-[50vh] flex flex-col justify-center items-center"
    role="alert"
  >
    <div>
      <strong className="font-bold">Error:</strong>
      <span className="block sm:inline">
        {" "}
        {message || "Could not load event data."}
      </span>
    </div>
    {showHomeLink && (
      <Link
        to="/"
        className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Go Home
      </Link>
    )}
  </div>
);

function EventLivePage() {
  const { eventId } = useParams();
  const currentUser = useSelector(selectCurrentUser);

  // --- State for Chat and Qna---
  const [chatMessages, setChatMessages] = useState([]);
  const [qnaItems, setQnaItems] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(true); // Loading state for chat history
  const [isQnaLoading, setIsQnaLoading] = useState(true); // Loading state for qna
  const [isSocketConnected, setIsSocketConnected] = useState(
    socketService.socket?.connected || false
  );

  // Fetch event detailes including populated speakers
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
    // isError: isErrorStatus
  } = useCheckRegistrationStatusQuery(eventId, {
    skip: !currentUser || !eventId, // Skip if not logged in or invalid eventId
  });

  const event = eventData?.data;
  const isRegistered = registrationStatusData?.data?.isRegistered;
  const isLoading = isLoadingEvent || (currentUser && isLoadingStatus);

  // Determine if current user can answer Q&A
  // Ensure event and event.organizer/speakers are loaded before checking
  const canAnswerQna = useMemo(() => {
    if(!currentUser || !event?.organizer) return false; // Need user and event organizer data
    return(
      currentUser._id === event.organizer._id || currentUser.role === 'admin' || event.speakers?.some(s => s._id === currentUser._id) // Check if the user is in the speaker array
    );
  }, [currentUser, event]);

  // Socket io setup
  useEffect(() => {
    if (!eventId || !currentUser || !event) return; // Dont proceed without eventId or user

    // Define callback functions for socket events
    const handleNewMessage = (newMessage) => {
      setChatMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    const handleChatHistory = (history) => {
      setChatMessages(history);
      setIsChatLoading(false); // Stop loading history
    };

    const handleNewQuestion = (newQuestion) => {
      setQnaItems((prevQuestions) => [...prevQuestions, newQuestion]);
    }

    const handleQnaHistory = (history) => {
      setQnaItems(history);
      setIsQnaLoading(false);
    }

    // Handler for updates to existing Q&A items(answer)
    const handleQuestionUpdate = (updatedQuestion) => {
      setQnaItems((prev) => prev.map(q => q._id === updatedQuestion._id ? updatedQuestion : q));
    }

    const handleSocketError = (error) => {
      console.error("Socket Error received: ", error.message);
      toast.error(error.message || "Chat connection error");
    };

    const handleConnect = () => setIsSocketConnected(true);
    const handleDisconnect = () => setIsSocketConnected(false);

    // Connect and set up listeners
    socketService.connect();
    // Join chat room
    socketService.joinEventRoom(eventId, (ack) => {
      if (ack.success) {
        console.log(`Successfully joined chat room for event ${eventId}`);
        // History might be sent automatically or requested here if needed
      } else {
        console.error(`Failed to join chat room: ${ack.message}`);
        toast.error(`Chat Error: ${ack.message}`);
        setIsChatLoading(false); // Stop loading if join fails
      }
    });

    // Join Q&A room
    socketService.joinEventQnaRoom(eventId, (ack) => {
      if(ack.success) {
        console.log(`Joined Q&A room for event ${eventId}`);
      } else {
        console.error(`Failed to join Q&A room: ${ack.message}`);
        toast.error(`Q&A Error: ${ack.message}`);
        setIsQnaLoading(false);
      }
    });

    // Register listeners
    socketService.on("connect", handleConnect);
    socketService.on("disconnect", handleDisconnect);
    socketService.on("newChatMessage", handleNewMessage);
    socketService.on("chatHistory", handleChatHistory);
    socketService.on("newQuestion", handleNewQuestion);
    socketService.on("qnaHistory", handleQnaHistory);
    socketService.on("questionAnswered", handleQuestionUpdate);
    socketService.on("socketError", handleSocketError);

    // Cleanup function: Leave room and remove listeners
    return () => {
      console.log(
        `Cleaning up chat listeners and leaving room for event ${eventId}`
      );
      socketService.leaveEventRoom(eventId);
      socketService.leaveEventQnaRoom(eventId);
      socketService.off("connect", handleConnect);
      socketService.off("disconnect", handleDisconnect);
      socketService.off("newChatMessage", handleNewMessage);
      socketService.off("chatHistory", handleChatHistory);
      socketService.off("newQuestion", handleNewQuestion);
      socketService.off("qnaHistory", handleQnaHistory);
      socketService.off("questionAnswered", handleQuestionUpdate);
      socketService.off("socketError", handleSocketError);
      // Don't disconnect globally here, only when user leaves the app/logs out
    };
  }, [eventId, currentUser, event]); // Depend on eventId, currentUser and event to re run on changes

  // Send message handler
  const handleSendMessage = useCallback(
    (message) => {
      // Wrap the emitWithAck in a promise for the ChatInput component
      return new Promise((resolve, reject) => {
        if (!eventId || !message) {
          reject(new Error("Missing event ID or message"));
          return;
        }
        socketService.sendChatMessage(eventId, message, (ack) => {
          if (ack.success) {
            resolve(); // Resolve promise on success
          } else {
            toast.error(ack.message || "Failed to send message");
            reject(new Error(ack.message || "Failed to send message")); // Reject promise on failure
          }
        });
      });
    },
    [eventId]
  );

  const handleSubmitQuestion = useCallback(
    (question) => {
      return new Promise((resolve, reject) => {
        if(!eventId || !question) {
          reject(new Error("Missing event ID or question"));
          return;
        }
        socketService.submitQuestion(eventId, question, (ack) => {
          if(ack.success) {
            resolve();
          } else {
            toast.error(ack.message || "Failed to submit question.");
            reject(new Error(ack.message || "Failed to submit question"));
          }
        });
      });
    }, [eventId]
  );

  const handleAnswerQuestion = useCallback(
    (questionId, answer) => {
      socketService.answerQuestion(eventId, questionId, answer, (ack) => {
        if(!ack.success) {
          toast.error(ack.message || "Failed to submit answer.");
        }
      });
    }, [eventId]
  );

  // Check Access
  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Error fetching event
  if (isErrorEvent || !event) {
    return (
      <ErrorDisplay
        message={errorEvent?.data?.message || "Event not found."}
        showHomeLink
      />
    );
  }

  // Check if user is logged in (double-check)
  if (!currentUser) {
    console.warn(
      "EventLivePage accessed without user. Redirecting via Navigate."
    );
    // Redirect to login, preserving intended destination
    return (
      <Navigate
        to="/login"
        state={{ from: `/events/${eventId}/live` }}
        replace
      />
    );
  }

  // Check if the user is registered for the event
  if (!isRegistered) {
    // Require registration unless they are admin/organizer
    const canAccessAsStaff =
      currentUser &&
      event.organizer &&
      (currentUser._id === event.organizer._id || currentUser.role === "admin");
    if (!canAccessAsStaff) {
      return (
        <ErrorDisplay
          message="You are not registered for this event"
          showHomeLink
        />
      );
    }
    console.log("User is staff, allowing access without registration");
  }

  // Check if event status allows joining
  const now = new Date();
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  const isCurrentlyLive =
    now >= startTime && now < endTime && event.status === "live";

  // Allow joining for live events only
  if (!isCurrentlyLive) {
    return (
      <ErrorDisplay
        message={`This event is not currently live (Status: ${event.status}).`}
        showHomeLink
      />
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 mx-8 my-1">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {event.title}
        </h1>
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
          {/* Chat component */}
          <ChatWindow
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoadingHistory={isChatLoading}
            disabled={!isSocketConnected} // Disable input if socket is not connected
          />

          {/* Q&A Component */}
          <QnaList
            questions={qnaItems}
            onAnswer={handleAnswerQuestion}
            onSubmitQuestion={handleSubmitQuestion}
            canAnswer={canAnswerQna} // Permission flag
            isLoadingHistory={isQnaLoading}
            disabled={!isSocketConnected} 
          />
        </div>
      </div>
    </div>
  );
}

export default EventLivePage;
