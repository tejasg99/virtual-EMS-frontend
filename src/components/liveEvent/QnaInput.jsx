import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi";

function QnaInput({ onSubmitQuestion, disabled = false }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    if (!data.question || data.question.trim() === "" || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmitQuestion(data.question.trim());
      reset(); // Clear input on success
    } catch (error) {
      console.error("Error submitting question: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-3 border-t border-gray-200 bg-gray-50"
    >
      <label htmlFor="question-input" className="sr-only">
        Ask a question
      </label>
      <div className="flex items-center space-x-2">
        <input
          id="question-input"
          type="text"
          placeholder="Ask a question..."
          autoComplete="off"
          {...register("question", {
            required: true,
            maxLength: {
              value: 300,
              message: "Question too long (max 300 chars)",
            },
          })}
          className={`flex-grow px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                     focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500
                     sm:text-sm ${errors.question ? "border-red-500" : "border-gray-300"} disabled:bg-gray-100`}
          disabled={disabled || isSubmitting}
        />
        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className={`inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm
                     text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2
                     focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Submit question"
        >
          <HiOutlineQuestionMarkCircle
            className={`h-5 w-5 ${isSubmitting ? "animate-pulse" : ""}`}
          />
        </button>
      </div>
      {errors.question && (
        <p className="mt-1 text-xs text-red-600">Please enter a question.</p>
      )}
    </form>
  );
}

export default QnaInput;
