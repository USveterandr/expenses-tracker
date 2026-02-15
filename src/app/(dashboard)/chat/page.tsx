'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, Search, Phone, Video, MoreVertical, Smile } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/stores/authStore';
import { createClient } from '@/lib/supabase/client-browser';
import styles from './page.module.css';

const supabase = createClient();

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  unreadCount: number;
  participant: {
    name: string;
    avatar?: string;
    isOnline: boolean;
  };
  updatedAt: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  sentAt: string;
  isRead: boolean;
}

export default function ChatPage() {
  const { user } = useAuthStore();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChats = useCallback(async () => {
    try {
      // Fetch chats from Supabase
      const { error } = await supabase
        .from('chats')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform data or use mock for now
      const mockChats: Chat[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          lastMessage: 'Can you review the Q4 expense report?',
          unreadCount: 2,
          participant: { name: 'Sarah Johnson', isOnline: true },
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Q4 Travel Report',
          lastMessage: 'Approved! Great work on the documentation.',
          unreadCount: 0,
          participant: { name: 'Mike Williams', isOnline: false },
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '3',
          name: 'Finance Team',
          lastMessage: 'Reminder: Submit expense reports by Friday',
          unreadCount: 5,
          participant: { name: 'Finance Team', isOnline: true },
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ];

      setChats(mockChats);
      if (mockChats.length > 0 && !activeChat) {
        setActiveChat(mockChats[0]);
        loadMessages(mockChats[0].id);
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat, user?.uid]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user, fetchChats]);

  const loadMessages = useCallback(async (chatId: string) => {


    // Mock messages for now
    const mockMessages: Message[] = [
      {
        id: '1',
        text: 'Hey! Can you help me with the expense report?',
        senderId: 'other',
        senderName: 'Sarah Johnson',
        sentAt: new Date(Date.now() - 3600000).toISOString(),
        isRead: true,
      },
      {
        id: '2',
        text: 'Sure! What do you need help with?',
        senderId: user?.uid || 'me',
        senderName: 'You',
        sentAt: new Date(Date.now() - 3500000).toISOString(),
        isRead: true,
      },
      {
        id: '3',
        text: 'I need to add receipts for the NYC trip but not sure which category to use.',
        senderId: 'other',
        senderName: 'Sarah Johnson',
        sentAt: new Date(Date.now() - 3400000).toISOString(),
        isRead: true,
      },
      {
        id: '4',
        text: 'For travel expenses like flights and hotels, use "Transportation" and "Lodging" categories. Meals go under "Meals & Entertainment".',
        senderId: user?.uid || 'me',
        senderName: 'You',
        sentAt: new Date(Date.now() - 3300000).toISOString(),
        isRead: true,
      },
    ];
    setMessages(mockMessages);
  }, [user?.uid]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      senderId: user.uid,
      senderName: 'You',
      sentAt: new Date().toISOString(),
      isRead: false,
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // In real implementation, save to Supabase
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* Sidebar - Chat List */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.title}>Messages</h1>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.chatList}>
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`${styles.chatItem} ${activeChat?.id === chat.id ? styles.activeChat : ''}`}
              onClick={() => {
                setActiveChat(chat);
                loadMessages(chat.id);
              }}
            >
              <div className={styles.chatAvatar}>
                {chat.participant.name.charAt(0)}
                {chat.participant.isOnline && <span className={styles.onlineIndicator} />}
              </div>
              <div className={styles.chatInfo}>
                <div className={styles.chatHeader}>
                  <span className={styles.chatName}>{chat.name}</span>
                  <span className={styles.chatTime}>{formatTime(chat.updatedAt)}</span>
                </div>
                <p className={styles.chatPreview}>{chat.lastMessage}</p>
              </div>
              {chat.unreadCount > 0 && (
                <span className={styles.unreadBadge}>{chat.unreadCount}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeChat ? (
        <div className={styles.chatArea}>
          {/* Chat Header */}
          <div className={styles.chatAreaHeader}>
            <div className={styles.chatHeaderInfo}>
              <div className={styles.chatHeaderAvatar}>
                {activeChat.participant.name.charAt(0)}
                {activeChat.participant.isOnline && <span className={styles.onlineIndicator} />}
              </div>
              <div>
                <h2 className={styles.chatHeaderName}>{activeChat.name}</h2>
                <span className={styles.chatHeaderStatus}>
                  {activeChat.participant.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <div className={styles.chatHeaderActions}>
              <button className={styles.headerButton}>
                <Phone size={20} />
              </button>
              <button className={styles.headerButton}>
                <Video size={20} />
              </button>
              <button className={styles.headerButton}>
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className={styles.messagesContainer}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${message.senderId === user?.uid ? styles.ownMessage : ''}`}
              >
                <div className={styles.messageContent}>
                  <p className={styles.messageText}>{message.text}</p>
                  <span className={styles.messageTime}>{formatTime(message.sentAt)}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className={styles.messageInputContainer}>
            <div className={styles.messageInputWrapper}>
              <button className={styles.inputButton}>
                <Paperclip size={20} />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className={styles.messageInput}
              />
              <button className={styles.inputButton}>
                <Smile size={20} />
              </button>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className={styles.sendButton}
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.emptyChat}>
          <div className={styles.emptyChatContent}>
            <div className={styles.emptyChatIcon}>💬</div>
            <h2 className={styles.emptyChatTitle}>Select a conversation</h2>
            <p className={styles.emptyChatText}>Choose a chat from the sidebar to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
