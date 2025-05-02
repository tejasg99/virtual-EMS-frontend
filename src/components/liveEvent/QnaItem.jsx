import React, { useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import {
  HiOutlineChatAlt,
  HiCheckCircle,
} from "react-icons/hi";

function QnaItem({ question, onAnswer, canAnswer }) {
  const [isAnswering, setIsAnswering] = useState(false);
  const [answerText, setAnswerText] = useState("");

  if (!question || !question.user) {
    return null;
  }

  const timestamp = question.createdAt
    ? formatDistanceToNowStrict(new Date(question.createdAt), {
        addSuffix: true,
      })
    : "";
  // const answerTimestamp = question.answeredAt ? formatDistanceToNowStrict(new Date(question.answeredAt), { addSuffix: true}) : ''; // Assuming answeredAt exists

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    if (answerText.trim()) {
      onAnswer(question._id, answerText.trim());
      setIsAnswering(false); // Close input after submitting
      setAnswerText(""); // Clear input
    }
  };

  return (
    <div className="p-4 border-b border-gray-200 last:border-b-0">
      {/* Question section */}
      <div className="flex items-start space-x-3">
        {/* Question content */}
        <div className="flex-1">
          <p className="text-sm text-gray-800 mb-1">{question.question}</p>
          <p className="text-xs text-gray-500">
            Asked by {question.user.name || "User"} • {timestamp}
          </p>
        </div>
      </div>

      {/* Answer section */}
      {question.isAnswered && question.answer ? (
        <div className="mt-3 pl-10 flex items-start space-x-3 bg-green-50 p-3 rounded-md border border-green-200">
          <HiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-800 mb-1">{question.answer}</p>
            <p className="text-xs text-gray-500">
              Answered by {question.answeredBy?.name || "Moderator"}
            </p>
          </div>
        </div>
      ) : (
        // Answer input / Button (conditional)
        canAnswer && (
          <div className="mt-3 pl-10">
            {!isAnswering ? (
              <button
                onClick={() => setIsAnswering(true)}
                className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                <HiOutlineChatAlt className="w-4 h-4 mr-1" />
                Answer
              </button>
            ) : (
              <form
                onSubmit={handleAnswerSubmit}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your answer..."
                  className="flex-grow px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnswering(false)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        )
      )}
    </div>
  );
}

export default QnaItem;
