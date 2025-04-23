import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="space-y-12 md:space-y-16 lg:space-y-20">
      {/* --- Hero Section --- */}
      <section className="text-center pt-10 pb-16 md:pt-16 md:pb-20 bg-gradient-to-b from-white to-slate-50 rounded-lg">
        <div className="container mx-auto px-4">

          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4">
            Welcome to EventMan
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-8">
            Discover, host, and attend engaging virtual events, webinars,
            meetups, and more. All in one place.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/events"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Browse Events
            </Link>
            <Link
              to="/create-event" // Link to create event page (will be protected later)
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Host an Event
            </Link>
          </div>
        </div>
      </section>

      {/* --- Placeholder for Featured Events Section --- */}
      {/* To be added later once the EventCard component is built */}
      {/*
      <section>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Featured Events
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Placeholder for Event Cards */}
      {/* <div className="p-6 bg-white rounded-lg shadow border">Event Card 1</div> */}
      {/* <div className="p-6 bg-white rounded-lg shadow border">Event Card 2</div> */}
      {/* <div className="p-6 bg-white rounded-lg shadow border">Event Card 3</div> */}
      {/*</div>
      </section>
      */}

      {/* --- Placeholder for How it Works / Features Section --- */}
      {/*
      <section className="py-12 bg-white rounded-lg shadow-sm border border-gray-100">
         <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
         <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Discover</h3>
                <p className="text-gray-600">Find events that match your interests.</p>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Register</h3>
                <p className="text-gray-600">Easily sign up for events with one click.</p>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Participate</h3>
                <p className="text-gray-600">Join live streams, chat, and ask questions.</p>
            </div>
         </div>
      </section>
      */}
    </div>
  );
}

export default HomePage;
