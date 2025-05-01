import React, { useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage.jsx';
import ChatInput from './ChatInput.jsx';

function ChatWindow({ messages = [], onSendMessage, isLoadingHistory = false, disabled = false }) {
    const messagesEndRef = useRef(null); // Ref to scroll to the bottom

    // Function to scroll to bottom of the chat messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Scroll to bottom whenever message array changes to include new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col h-[60vh] md:h-[70vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Live Chat</h2>
        </div>

        {/* Message display area */}
        <div className="flex-grow p-4 space-y-4 overflow-y-auto">
            {isLoadingHistory && (
                <p className="text-center text-gray-500">Loading history...</p>
            )}
            {!isLoadingHistory && messages.length === 0 && (
                <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
            )}
            {messages.map((msg) => (
                // Ensure msg has a unique _id from the backend
                <ChatMessage key={msg._id || Math.random()} message={msg} />
            ))}
            {/* Dummy div to mark the end for scrolling */}
            <div ref={messagesEndRef} />
        </div>

        {/* Message Input area */}
        <ChatInput onSendMessage={onSendMessage} disabled={disabled} />
    </div>
  )
}

export default ChatWindow;