import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { Button } from '@/components/ui/button';
import Toast from '@/components/ui/Toast';
import Navbar from './shared/Navbar';
import CreateGroupModal from './CreateGroupModal';
import { CHAT_API_END_POINT } from '@/constants';
import axios from 'axios';
import { 
    MessageCircle, 
    Send, 
    Paperclip, 
    Users, 
    Settings, 
    Plus,
    Search,
    Smile,
    MoreVertical
} from 'lucide-react';

const Chat = () => {
    const [chatGroups, setChatGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [typingUsers, setTypingUsers] = useState([]);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [showGroupSettings, setShowGroupSettings] = useState(false);

    const { user } = useSelector(store => store.auth);
    const { socket, isConnected } = useSocket();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
    }, [user, navigate]);

    // Fetch chat groups
    const fetchChatGroups = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${CHAT_API_END_POINT}/groups`, {
                headers: {
                    'Authorization': `Bearer ${user?.accessToken}`,
                },
                withCredentials: true
            });

            if (response.data.success) {
                setChatGroups(response.data.data || []);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error fetching chat groups';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Fetch messages for selected group
    const fetchMessages = async (groupId) => {
        try {
            const response = await axios.get(
                `${CHAT_API_END_POINT}/groups/${groupId}/messages`,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.accessToken}`,
                    },
                    withCredentials: true
                }
            );

            if (response.data.success) {
                setMessages(response.data.data.messages || []);
                scrollToBottom();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error fetching messages';
            setError(errorMessage);
        }
    };

    // Send message
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedGroup) return;

        const messageContent = newMessage.trim();
        setNewMessage('');

        try {
            // Send via socket for real-time delivery
            if (socket && isConnected) {
                socket.emit('send_message', {
                    groupId: selectedGroup._id,
                    content: messageContent,
                    messageType: 'text'
                });
            } else {
                // Fallback to HTTP if socket not available
                await axios.post(
                    `${CHAT_API_END_POINT}/groups/${selectedGroup._id}/messages`,
                    { content: messageContent },
                    {
                        headers: {
                            'Authorization': `Bearer ${user?.accessToken}`,
                        },
                        withCredentials: true
                    }
                );
                fetchMessages(selectedGroup._id);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error sending message';
            setError(errorMessage);
            setNewMessage(messageContent); // Restore message on error
        }
    };

    // Handle typing indicators
    const handleTyping = () => {
        if (socket && selectedGroup) {
            socket.emit('typing_start', { groupId: selectedGroup._id });
            
            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            
            // Stop typing after 2 seconds
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing_stop', { groupId: selectedGroup._id });
            }, 2000);
        }
    };

    // Add reaction to message
    const addReaction = async (messageId, emoji) => {
        try {
            if (socket && isConnected) {
                socket.emit('add_reaction', { messageId, emoji });
            } else {
                await axios.post(
                    `${CHAT_API_END_POINT}/messages/${messageId}/reactions`,
                    { emoji },
                    {
                        headers: {
                            'Authorization': `Bearer ${user?.accessToken}`,
                        },
                        withCredentials: true
                    }
                );
                fetchMessages(selectedGroup._id);
            }
        } catch (error) {
            setError('Error adding reaction');
        }
    };

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message) => {
            setMessages(prev => [...prev, message]);
            scrollToBottom();
        };

        const handleMessageUpdated = (updatedMessage) => {
            setMessages(prev => 
                prev.map(msg => 
                    msg._id === updatedMessage._id ? updatedMessage : msg
                )
            );
        };

        const handleUserTyping = (data) => {
            if (data.isTyping) {
                setTypingUsers(prev => {
                    if (!prev.includes(data.userName)) {
                        return [...prev, data.userName];
                    }
                    return prev;
                });
            } else {
                setTypingUsers(prev => prev.filter(user => user !== data.userName));
            }
        };

        socket.on('new_message', handleNewMessage);
        socket.on('message_updated', handleMessageUpdated);
        socket.on('user_typing', handleUserTyping);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('message_updated', handleMessageUpdated);
            socket.off('user_typing', handleUserTyping);
        };
    }, [socket]);

    // Join group on selection
    useEffect(() => {
        if (socket && selectedGroup) {
            socket.emit('join_group', { groupId: selectedGroup._id });
            fetchMessages(selectedGroup._id);
        }
    }, [socket, selectedGroup]);

    // Fetch groups on mount
    useEffect(() => {
        if (user) {
            fetchChatGroups();
        }
    }, [user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Filter groups based on search
    const filteredGroups = chatGroups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Format time
    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    const getCurrentUserId = () => {
        return user.role === 'subadmin' ? user.subAdminData?._id : user._id;
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            <Navbar />

            <Toast
                message={error}
                type="error"
                onClose={() => setError('')}
            />
            <Toast
                message={success}
                type="success"
                onClose={() => setSuccess('')}
            />

            <div className='flex h-[calc(100vh-64px)]'>
                {/* Chat Groups Sidebar */}
                <div className='w-1/3 bg-white border-r border-gray-200 flex flex-col'>
                    {/* Header */}
                    <div className='p-4 border-b border-gray-200'>
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-xl font-semibold text-gray-800'>Chats</h2>
                            <div className='flex items-center space-x-2'>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowCreateGroup(true)}
                                    className='p-2'
                                >
                                    <Plus className='h-4 w-4' />
                                </Button>
                            </div>
                        </div>
                        
                        {/* Search */}
                        <div className='relative'>
                            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                            <input
                                type="text"
                                placeholder="Search chats..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                        </div>
                    </div>

                    {/* Groups List */}
                    <div className='flex-1 overflow-y-auto'>
                        {loading ? (
                            <div className='p-4 text-center text-gray-500'>Loading...</div>
                        ) : filteredGroups.length === 0 ? (
                            <div className='p-4 text-center text-gray-500'>
                                {searchTerm ? 'No chats found' : 'No chat groups available'}
                            </div>
                        ) : (
                            filteredGroups.map(group => (
                                <div
                                    key={group._id}
                                    onClick={() => setSelectedGroup(group)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                                        selectedGroup?._id === group._id ? 'bg-blue-50 border-blue-200' : ''
                                    }`}
                                >
                                    <div className='flex items-center space-x-3'>
                                        <div className='bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center'>
                                            <MessageCircle className='h-5 w-5' />
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <div className='flex items-center justify-between'>
                                                <h3 className='font-medium text-gray-900 truncate'>
                                                    {group.name}
                                                </h3>
                                                <span className='text-xs text-gray-500'>
                                                    {group.lastActivity && formatTime(group.lastActivity)}
                                                </span>
                                            </div>
                                            <p className='text-sm text-gray-500 truncate'>
                                                {group.description || `${group.members?.length || 0} members`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Connection Status */}
                    <div className='p-3 border-t border-gray-200'>
                        <div className='flex items-center space-x-2 text-xs'>
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className='text-gray-500'>
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className='flex-1 flex flex-col'>
                    {selectedGroup ? (
                        <>
                            {/* Chat Header */}
                            <div className='p-4 bg-white border-b border-gray-200'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center space-x-3'>
                                        <div className='bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center'>
                                            <MessageCircle className='h-5 w-5' />
                                        </div>
                                        <div>
                                            <h3 className='font-semibold text-gray-900'>{selectedGroup.name}</h3>
                                            <p className='text-sm text-gray-500'>
                                                {selectedGroup.members?.length || 0} members
                                                {typingUsers.length > 0 && (
                                                    <span className='ml-2 text-blue-600'>
                                                        {typingUsers.join(', ')} typing...
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setShowGroupSettings(true)}
                                            className='p-2'
                                        >
                                            <Users className='h-4 w-4' />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className='p-2'
                                        >
                                            <MoreVertical className='h-4 w-4' />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className='flex-1 overflow-y-auto p-4 space-y-4'>
                                {messages.map((message, index) => {
                                    const isCurrentUser = message.sender?.user?._id === getCurrentUserId();
                                    const showDate = index === 0 || 
                                        formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);

                                    return (
                                        <div key={message._id}>
                                            {showDate && (
                                                <div className='text-center text-xs text-gray-500 my-4'>
                                                    {formatDate(message.createdAt)}
                                                </div>
                                            )}
                                            
                                            <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                    message.messageType === 'system' 
                                                        ? 'bg-gray-200 text-gray-600 text-sm text-center mx-auto'
                                                        : isCurrentUser 
                                                            ? 'bg-blue-500 text-white' 
                                                            : 'bg-gray-200 text-gray-900'
                                                }`}>
                                                    {message.messageType !== 'system' && !isCurrentUser && (
                                                        <div className='text-xs font-medium mb-1'>
                                                            {message.sender?.user?.name || 'Unknown'}
                                                        </div>
                                                    )}
                                                    
                                                    {message.messageType === 'text' || message.messageType === 'system' ? (
                                                        <div>{message.content}</div>
                                                    ) : message.messageType === 'image' ? (
                                                        <div>
                                                            <img 
                                                                src={message.fileUrl} 
                                                                alt="Shared image" 
                                                                className='max-w-full rounded'
                                                            />
                                                            {message.fileName && (
                                                                <div className='text-xs mt-1'>{message.fileName}</div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className='flex items-center space-x-2'>
                                                                <Paperclip className='h-4 w-4' />
                                                                <span>{message.fileName}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {message.messageType !== 'system' && (
                                                        <div className='flex items-center justify-between mt-1'>
                                                            <div className='text-xs opacity-70'>
                                                                {formatTime(message.createdAt)}
                                                            </div>
                                                            {message.reactions && Object.keys(message.reactionSummary || {}).length > 0 && (
                                                                <div className='flex items-center space-x-1'>
                                                                    {Object.entries(message.reactionSummary).map(([emoji, count]) => (
                                                                        <button
                                                                            key={emoji}
                                                                            onClick={() => addReaction(message._id, emoji)}
                                                                            className='text-xs bg-white bg-opacity-20 rounded px-1'
                                                                        >
                                                                            {emoji} {count}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className='p-4 bg-white border-t border-gray-200'>
                                <div className='flex items-center space-x-2'>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            handleTyping();
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                        placeholder="Type a message..."
                                        className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    />
                                    <Button
                                        onClick={() => addReaction(messages[messages.length - 1]?._id, '👍')}
                                        variant="outline"
                                        size="sm"
                                        className='p-2'
                                    >
                                        <Smile className='h-4 w-4' />
                                    </Button>
                                    <Button
                                        onClick={sendMessage}
                                        disabled={!newMessage.trim()}
                                        className='p-2'
                                    >
                                        <Send className='h-4 w-4' />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className='flex-1 flex items-center justify-center bg-gray-50'>
                            <div className='text-center'>
                                <MessageCircle className='mx-auto h-12 w-12 text-gray-400 mb-4' />
                                <h3 className='text-lg font-medium text-gray-900 mb-2'>Select a Chat</h3>
                                <p className='text-gray-500'>Choose a chat group to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Group Modal */}
            <CreateGroupModal
                isOpen={showCreateGroup}
                onClose={() => setShowCreateGroup(false)}
                onGroupCreated={(newGroup) => {
                    setChatGroups(prev => [newGroup, ...prev]);
                    setSuccess('Group created successfully');
                }}
            />
        </div>
    );
};

export default Chat; 