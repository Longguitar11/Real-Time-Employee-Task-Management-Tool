import React, { useState, useEffect } from 'react';
import { CircleUserIcon, Circle, MessageCircle } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';
import { userEmployeeStore } from '../stores/useEmployeeStore'; // Updated import
import { useSocket } from '../hooks/useSocket';
import useUserStore from '../stores/useUserStore';

const MessagePage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  
  // Use your store
  const { employees, loading: employeesLoading, getAllEmployees, getAllUsers } = userEmployeeStore();
  const { user: { id: currentUserId, role: currentUserRole } } = useUserStore();
  const { onlineUsers, isConnected } = useSocket();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load employees based on user role
        if (currentUserRole === 'owner') {
          await getAllEmployees(); // Get employees only
        } else {
          await getAllUsers(); // Get all users (owners + employees)
        }
        
        if (currentUserId) {
          await fetchConversations();
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setConversationsLoading(false);
      }
    };

    loadData();
  }, [currentUserRole, currentUserId]);

  const fetchConversations = async () => {
    if (!currentUserId) {
      setConversationsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/messages/conversations/${currentUserId}`);
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data || []);
      } else {
        console.error('Failed to fetch conversations:', response.status);
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setConversationsLoading(false);
    }
  };

  // Get available users to chat with - with proper null checks
  const getAvailableUsers = () => {
    // Return empty array if employees is null or not an array
    if (!employees || !Array.isArray(employees)) {
      return [];
    }

    if (currentUserRole === 'owner') {
      // Owner can chat with all employees
      return employees.filter(emp => emp.id !== currentUserId);
    } else {
      // Employee can chat with owners and other employees
      return employees.filter(user => user.id !== currentUserId);
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.some(user => user.userId === userId);
  };

  // Get users who have had conversations - with proper null checks
  const getConversationPartners = () => {
    if (!employees || !Array.isArray(employees) || !conversations || !Array.isArray(conversations)) {
      return [];
    }

    return conversations.map(conv => {
      const partner = employees.find(emp => emp.id === conv.partnerId);
      return partner ? { ...partner, conversation: conv } : null;
    }).filter(Boolean);
  };

  // Get users who haven't had conversations yet - with proper null checks
  const getNewChatUsers = () => {
    if (!employees || !Array.isArray(employees) || !conversations || !Array.isArray(conversations)) {
      return [];
    }

    const conversationPartnerIds = conversations.map(conv => conv.partnerId);
    return getAvailableUsers().filter(user => !conversationPartnerIds.includes(user.id));
  };

  // Show loading if either employees or conversations are loading
  const isLoading = employeesLoading || conversationsLoading;

  return (
    <div className='flex gap-4 h-[calc(100vh-100px)]'>
      {/* Conversations List */}
      <div className='w-1/3 space-y-4 overflow-y-auto'>
        <div className='text-2xl rounded p-4 bg-gray-100 shadow'>
          <div className='flex items-center justify-between'>
            <span>Messages</span>
            <div className='flex items-center gap-2'>
              <Circle className={`w-3 h-3 ${isConnected ? 'text-green-500 fill-current' : 'text-red-500'}`} />
              <span className='text-sm text-gray-600'>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className='text-center py-8 text-gray-500'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4'></div>
            <p>Loading...</p>
            <p className='text-xs mt-1'>
              {employeesLoading ? 'Loading team members...' : 'Loading conversations...'}
            </p>
          </div>
        ) : (
          <>
            {/* Recent Conversations */}
            {conversations.length > 0 && getConversationPartners().length > 0 && (
              <div className='space-y-2'>
                <h3 className='font-semibold text-gray-700 flex items-center gap-2'>
                  <MessageCircle className='w-4 h-4' />
                  Recent Conversations ({getConversationPartners().length})
                </h3>
                {getConversationPartners().map((partner) => (
                  <div
                    key={partner.id}
                    onClick={() => setSelectedUser(partner)}
                    className={`flex items-center gap-4 p-4 bg-white rounded shadow hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedUser?.id === partner.id ? 'bg-blue-50 border-blue-200 border' : ''
                    }`}
                  >
                    <div className='relative'>
                      <CircleUserIcon className='w-12 h-12 text-gray-500' />
                      <Circle 
                        className={`absolute -bottom-1 -right-1 w-4 h-4 ${
                          isUserOnline(partner.id) ? 'text-green-500 fill-current' : 'text-gray-400'
                        }`} 
                      />
                    </div>
                    <div className='flex-1'>
                      <span className='text-lg font-semibold'>{partner.name}</span>
                      <p className='text-sm text-gray-600 truncate'>{partner.conversation.lastMessage}</p>
                      <p className='text-xs text-gray-400'>
                        {partner.conversation.timestamp ? new Date(partner.conversation.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Available Users for New Chats */}
            <div className='space-y-2'>
              <h3 className='font-semibold text-gray-700 flex items-center gap-2'>
                <CircleUserIcon className='w-4 h-4' />
                {conversations.length > 0 ? 'Start New Chat' : 'Team Members'} ({getNewChatUsers().length})
              </h3>
              
              {getNewChatUsers().length > 0 ? (
                getNewChatUsers().map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`flex items-center gap-4 p-4 bg-white rounded shadow hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedUser?.id === user.id ? 'bg-blue-50 border-blue-200 border' : ''
                    }`}
                  >
                    <div className='relative'>
                      <CircleUserIcon className='w-12 h-12 text-gray-500' />
                      <Circle 
                        className={`absolute -bottom-1 -right-1 w-4 h-4 ${
                          isUserOnline(user.id) ? 'text-green-500 fill-current' : 'text-gray-400'
                        }`} 
                      />
                    </div>
                    <div className='flex-1'>
                      <span className='text-lg font-semibold'>{user.name}</span>
                      <p className='text-sm text-gray-600'>{user.email}</p>
                      <p className='text-xs text-gray-500'>{user.department || user.role}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-center py-8 text-gray-500'>
                  {currentUserRole === 'owner' ? (
                    (!employees || employees.length === 0) ? (
                      <div>
                        <CircleUserIcon className='w-12 h-12 text-gray-300 mx-auto mb-2' />
                        <p>No employees found</p>
                        <p className='text-xs'>Add employees to start chatting</p>
                      </div>
                    ) : (
                      <div>
                        <MessageCircle className='w-12 h-12 text-gray-300 mx-auto mb-2' />
                        <p>All conversations are shown above</p>
                      </div>
                    )
                  ) : (
                    <div>
                      <CircleUserIcon className='w-12 h-12 text-gray-300 mx-auto mb-2' />
                      <p>No team members available</p>
                      <p className='text-xs'>Contact your manager</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Empty State */}
            {conversations.length === 0 && getAvailableUsers().length === 0 && !isLoading && (
              <div className='text-center py-12 text-gray-500'>
                <MessageCircle className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                <p className='text-lg font-medium'>No conversations yet</p>
                <p className='text-sm'>
                  {currentUserRole === 'owner' 
                    ? 'Add employees to start messaging' 
                    : 'Wait for your manager to add team members'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Chat Window */}
      <div className='flex-1'>
        {selectedUser ? (
          <ChatWindow 
            selectedUser={selectedUser} 
            currentUserId={currentUserId}
            onNewMessage={fetchConversations} // Refresh conversations when new message is sent
          />
        ) : (
          <div className='bg-gray-100 p-4 rounded shadow h-full flex items-center justify-center'>
            <div className='text-center'>
              <MessageCircle className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-500 text-lg'>Select a team member to start chatting</p>
              <p className='text-gray-400 text-sm mt-2'>
                {isConnected ? 'You are connected and ready to chat' : 'Connecting...'}
              </p>
              {!isConnected && (
                <div className='mt-4'>
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto'></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagePage;