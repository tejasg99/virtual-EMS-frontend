import React from 'react';
import EventForm from '../components/events/EventForm.jsx';

function CreateEventPage() {
  return (
    <div className="max-w-3xl mx-auto my-2">
        <div className="bg-white p-6 md:pd-8 rounded-lg shadow-md border border-gray-200">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Create a new Event
            </h1>
            <EventForm />
        </div>
    </div>
  )
}

export default CreateEventPage