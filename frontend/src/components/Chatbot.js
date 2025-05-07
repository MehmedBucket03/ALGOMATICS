// frontend/src/components/Chatbot.js
import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

/**
 * AI Chatbot component with Mistral-7B-Instruct-v0.2 integration
 */
const Chatbot = ({
                     apiUrl = 'http://localhost:5000/api/chat',
                     initialMessage = 'Hello! How can I help you today?',
                     position = 'bottom-right',
                     theme = 'light'
                 }) => {
    // State
    const [messages, setMessages] = useState([
        { role: 'assistant', content: initialMessage }
    ]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Refs
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const chatWindowRef = useRef(null);

    // Auto scroll to bottom of messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when chat is opened
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setError(null); // Clear any errors when opening
        }
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!input.trim()) return;

        // Add user message to chat
        const userMessage = { role: 'user', content: input };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            // Format messages for API
            const apiMessages = updatedMessages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Add a system message if not present
            if (!apiMessages.some(msg => msg.role === 'system')) {
                apiMessages.unshift({
                    role: 'system',
                    content: 'You are a helpful AI assistant that provides accurate and concise information.'
                });
            }

            // Send to backend
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages: apiMessages }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error communicating with the chatbot');
            }

            const data = await response.json();

            // Add assistant response to chat
            setMessages([...updatedMessages, data.message]);
        } catch (error) {
            console.error('Error sending message:', error);
            setError(error.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e) => {
        // Close chat with Escape key
        if (e.key === 'Escape' && isOpen) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    // Creates a message bubble component
    const MessageBubble = ({ message, index }) => {
        const isUser = message.role === 'user';

        return (
            <div
                className={`message ${isUser ? 'user-message' : 'assistant-message'}`}
                key={index}
            >
                <div className="message-content">
                    {message.content}
                </div>
            </div>
        );
    };

    // The chatbot layout
    return (
        <div className={`chatbot-container ${position} ${theme}`}>
            {/* Chat button */}
            <button
                className="chatbot-button"
                onClick={toggleChat}
                aria-label={isOpen ? "Close chat" : "Open chat"}
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                )}
            </button>

            {/* Chat window */}
            {isOpen && (
                <div className="chatbot-window" ref={chatWindowRef}>
                    <div className="chatbot-header">
                        <h3>AI Assistant</h3>
                        <button
                            className="close-button"
                            onClick={toggleChat}
                            aria-label="Close chat"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((message, index) => (
                            <MessageBubble message={message} key={index} index={index} />
                        ))}

                        {isLoading && (
                            <div className="message assistant-message">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className="chatbot-input-form">
                        <input
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type your message..."
                            disabled={isLoading}
                            ref={inputRef}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            aria-label="Send message"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;