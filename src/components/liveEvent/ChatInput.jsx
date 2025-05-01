import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { HiOutlinePaperAirplane } from 'react-icons/hi'

function ChatInput({ onSendMessage, disabled = false }) {
    const { register, handleSubmit, reset, formState: { errors }} = useForm();
    const [isSending, setIsSending] = useState(false);

    const onSubmit = async (data) => {
        if(!data.message || data.message.trim() === '' || isSending) {
            return; // Prevent sending empty messages or multiple sends
        }

        setIsSending(true);
        try {
            // Call the passed in onSendMessage handler it should return a promise or handle async logic
            await onSendMessage(data.message.trim());
            reset(); // clear input field on successful send 
        } catch (error) {
            console.error("Error sending chat message:", error);
            // A error toast can be shown here
        } finally {
            setIsSending(false); // Re-enable send button
        }
    }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-center space-x-2 p-2 border-t border-gray-200 bg-gray-50">
        <input 
        type="text"
        placeholder="Type your message"
        autoComplete="off"
        {...register('message', {
            required: true,
            maxLength: { value: 500, message: 'Message is too long(max 500 chars)'}
        })}
        className={`flex-grow px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.message ? 'border-red-500' : 'border-gray-300'} disabled:bg-gray-100`}
        disabled={disabled || isSending}
        />
        <button
        type="submit"
        disabled={disabled || isSending}
        className={`inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label="Send message"
        >
            <HiOutlinePaperAirplane className={`h-5 w-5 ${isSending ? 'animate-pulse' : ''}`} />
        </button>
    </form>
  )
}

export default ChatInput;