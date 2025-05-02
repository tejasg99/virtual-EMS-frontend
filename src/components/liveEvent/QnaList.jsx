import React, { useState, useMemo } from "react";
import QnaItem from "./QnaItem.jsx";
import QnaInput from "./QnaInput.jsx";

function QnaList({
  questions = [],
  onAnswer,
  onSubmitQuestion,
  canAnswer = false, // Prop to determine if current user can answer
  isLoadingHistory = false,
  disabled = false, // Disable input/actions if socket disconnected
}) {
  // State for sorting/filtering
  const [sortBy, setSortBy] = useState("newest"); // 'newest'

  const sortedQuestions = useMemo(() => {
    const sorted = [...questions]; // Create a copy to sort
    if (sortBy === "newest") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    // Add more sorting options if needed
    return sorted;
  }, [questions, sortBy]);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col h-[60vh] md:h-[70vh]">
      {" "}
      {/* Adjust height */}
      {/* Header & Sort Controls */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Q&A</h2>
        {/* Basic Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          disabled={isLoadingHistory || questions.length === 0}
        >
          <option value="newest">Newest</option>
        </select>
      </div>
      {/* Question List Area */}
      <div className="flex-grow p-1 space-y-1 overflow-y-auto">
        {" "}
        {/* Reduced padding */}
        {isLoadingHistory && (
          <p className="text-center text-gray-500 p-4">Loading questions...</p>
        )}
        {!isLoadingHistory && sortedQuestions.length === 0 && (
          <p className="text-center text-gray-500 p-4">
            No questions asked yet.
          </p>
        )}
        {sortedQuestions.map((q) => (
          <QnaItem
            key={q._id}
            question={q}
            onAnswer={onAnswer}
            canAnswer={canAnswer}
          />
        ))}
      </div>
      {/* Input Area */}
      <QnaInput onSubmitQuestion={onSubmitQuestion} disabled={disabled} />
    </div>
  );
}

export default QnaList;
