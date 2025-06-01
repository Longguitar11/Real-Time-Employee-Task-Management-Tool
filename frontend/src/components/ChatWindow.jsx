import { useState, useEffect, useRef } from 'react';
import { Send, Circle } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import useUserStore from '../stores/useUserStore';

const ChatWindow = ({ selectedUser, currentUserId, onNewMessage }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { socket, onlineUsers } = useSocket();

    const { user } = useUserStore();

    // Check if selected user is online
    const isUserOnline = onlineUsers.some(user => user.userId === selectedUser.id);

    useEffect(() => {
        if (selectedUser) {
            fetchChatHistory();
            // Mark messages as read when opening chat
            markMessagesAsRead();
        }
    }, [selectedUser]);

    useEffect(() => {
        if (socket) {
            socket.on('receiveMessage', (message) => {
                if (message.senderId === selectedUser.id) {
                    setMessages(prev => [...prev, message]);
                    // Mark as read immediately if chat is open
                    markMessagesAsRead();
                    // Refresh conversations list
                    if (onNewMessage) onNewMessage();
                }
            });

            socket.on('messageConfirmed', (message) => {
                // Message was sent successfully
                console.log('Message confirmed:', message.id);

                // Add the sent message to current chat if it's for this conversation
                if (message.senderId === currentUserId && message.receiverId === selectedUser.id) {
                    setMessages(prev => [...prev, message]);
                }

                // Refresh conversations list
                if (onNewMessage) onNewMessage();
            });

            socket.on('userTyping', (data) => {
                if (data.senderId === selectedUser.id) {
                    setIsTyping(true);
                }
            });

            socket.on('userStoppedTyping', (data) => {
                if (data.senderId === selectedUser.id) {
                    setIsTyping(false);
                }
            });

            socket.on('messageError', (error) => {
                console.error('Message error:', error);
                alert('Failed to send message. Please try again.');
            });

            return () => {
                socket.off('receiveMessage');
                socket.off('messageConfirmed');
                socket.off('userTyping');
                socket.off('userStoppedTyping');
                socket.off('messageError');
            };
        }
    }, [socket, selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchChatHistory = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:5000/api/messages/history/${currentUserId}/${selectedUser?.id}`
            );
            const data = await response.json();
            console.log({ data })
            setMessages(data);
        } catch (error) {
            console.error('Error fetching chat history:', error);
        } finally {
            setLoading(false);
        }
    };

    const markMessagesAsRead = async () => {
        try {
            await fetch('http://localhost:5000/api/messages/mark-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    senderId: selectedUser.id,
                    receiverId: currentUserId
                })
            });
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !socket) return;

        const messageData = {
            senderId: currentUserId,
            receiverId: selectedUser?.id,
            message: newMessage.trim(),
            senderName: user?.name,
            senderRole: user?.role
        };

        socket.emit('sendMessage', messageData);
        setNewMessage('');

        // Stop typing indicator
        if (typing) {
            socket.emit('stopTyping', {
                senderId: currentUserId,
                receiverId: selectedUser.id
            });

            setTyping(false);
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!typing && socket && e.target.value.trim()) {
            setTyping(true);
            socket.emit('typing', {
                senderId: currentUserId,
                receiverId: selectedUser.id,
                senderName: user?.name
            });
        }

        // Clear typing after 3 seconds of no typing
        clearTimeout(window.typingTimer);
        window.typingTimer = setTimeout(() => {
            if (typing && socket) {
                socket.emit('stopTyping', {
                    senderId: currentUserId,
                    receiverId: selectedUser.id
                });
                setTyping(false);
            }
        }, 3000);
    };

    if (loading) {
        return (
            <div className='bg-white rounded shadow h-full flex items-center justify-center'>
                <div className='text-gray-500'>Loading chat history...</div>
            </div>
        );
    }

    return (
        <div className='bg-white rounded shadow h-full flex flex-col'>
            {/* Chat Header */}
            <div className='bg-gray-100 p-4 rounded-t border-b'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h2 className='text-xl font-semibold'>{selectedUser.name}</h2>
                        <div className='flex items-center gap-2'>
                            <Circle
                                className={`w-3 h-3 ${isUserOnline ? 'text-green-500 fill-current' : 'text-gray-400'}`}
                            />
                            <span className='text-sm text-gray-600'>
                                {isUserOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    </div>
                    <div className='text-sm text-gray-500'>
                        {selectedUser.role && (
                            <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs'>
                                {selectedUser.role}
                            </span>
                        )}
                    </div>
                </div>
                {isTyping && (
                    <p className='text-sm text-gray-500 italic mt-2'>
                        {selectedUser.name} is typing...
                    </p>
                )}
            </div>

            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-4 space-y-4'>
                {messages?.length === 0 ? (
                    <div className='text-center text-gray-500 mt-10'>
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages?.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.senderId === currentUserId
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-800'
                                    }`}
                            >
                                <p className='break-words'>{message.message}</p>
                                <p className={`text-xs mt-1 ${message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'
                                    }`}>
                                    {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : 'Sending...'}
                                </p>
                            </div>
                        </div>
                    ))
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className='p-4 border-t flex gap-2'>
                <input
                    type='text'
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder={`Message ${selectedUser.name}...`}
                    className='flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    disabled={!socket}
                />
                <button
                    type='submit'
                    disabled={!newMessage.trim() || !socket}
                    className='bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                    <Send className='w-5 h-5' />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;