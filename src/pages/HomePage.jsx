import React from "react";
import { Link } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import { AiOutlineUserAdd } from "react-icons/ai";
import { IoVideocamOutline } from "react-icons/io5";

function HomePage() {
  return (
    <div className="space-y-12 md:space-y-16 lg:space-y-20">
      {/* --- Hero Section --- */}
      <section className="text-center pt-10 pb-16 md:pt-16 md:pb-20 bg-gradient-to-b from-white to-slate-50 rounded-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-8">
            Welcome to <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">EventMan</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-12">
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

      <section className="py-12 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="mx-auto mb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-10 md:mx-auto">
              Join our community and start experiencing events in a whole new
              way
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-5 md:mx-10">
            <div className="bg-white border-[0.5px] border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-30 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto p-10">
                <div className="text-blue-500">
                  <IoSearch size="40px" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Discover
              </h3>
              <p className="text-gray-600">
              Explore a wide range of events tailored to your interests. Our platform helps you find the perfect events, from tech talks to creative workshops.
              </p>
            </div>
            <div className="bg-white border-[0.5px] border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-30 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto p-10">
                <div className="text-blue-500">
                  <AiOutlineUserAdd size="40px" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Register
              </h3>
              <p className="text-gray-600">
              Sign up for events with just one click. No more lengthy forms or complicated processes. Secure your spot instantly and get ready for an amazing experience.
              </p>
            </div>
            <div className="bg-white border-[0.5px] border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-30 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto p-10">
                <div className="text-blue-500">
                  <IoVideocamOutline size="40px" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Participate
              </h3>
              <p className="text-gray-600">
              Engage in immersive live streams, interact with other participants through chat, and get your questions answered in real-time. Experience events like never before.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
