import React from 'react'
import { useSelector } from 'react-redux'
import { formatDistanceToNowStrict } from 'date-fns'; // For relative timestamps
import { selectCurrentUser } from '../../slices/authSlice.js'

function ChatMessage({ message }) {
    const currentUser = useSelector(selectCurrentUser);

    if(!message || !message.user) {
        return null; // dont render if message or user is missing
    }

    const isCurrentUser = currentUser?._id === message.user._id;
    const timestamp = message?.createdAt ? formatDistanceToNowStrict(new Date(message.createdAt), { addSuffix: true }) : '';

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}>
        <div className={`max-w-[75%] p-3 rounded-lg shadow-sm ${isCurrentUser ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
            {/* Show sender name only if it's not the current user */}
            {!currentUser && (
                <p className="text-xs font-semibold mb-1 text-indigo-700">{message.user.name || 'User'}</p>
            )}
            <p className="text-sm break-words">{message.message}</p>
            {/* Timestamp */}
            <p className={`text-xs mt-1 ${isCurrentUser ? 'text-indigo-200' : 'text-gray-500'} text-right`}>
                {timestamp}
            </p>
        </div>
    </div>
  )
}

export default ChatMessage;