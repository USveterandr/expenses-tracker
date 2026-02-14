# 08 — Chat & Collaboration

---

## 🎯 Overview

Expensify uses a "chat-first" approach where every expense, report, and invoice has a conversation thread. This document covers the real-time chat system, threading, @mentions, task management, and workspace communication channels.

---

## 💬 Chat Types

| Type | Description | Auto-created? |
|------|-------------|---------------|
| **Direct** | 1-on-1 private conversation | On first message |
| **Group** | Multi-person conversation | Manually |
| **Expense** | Thread attached to an expense | When commenting on expense |
| **Report** | Thread attached to a report | When report is submitted |
| **Invoice** | Thread between issuer and payer | When invoice is sent |
| **Workspace** | #announce and #admins channels | When workspace is created |

---

## 📱 Screens

### 8.1 Chat List Page
**Route:** `/chat`

```
┌─────────────────────────────────────────┐
│ 💬 Messages                    [+ New]  │
├─────────────────────────────────────────┤
│ 🔍 Search conversations...              │
│                                         │
│ ─── Pinned ───                          │
│ ┌───────────────────────────────────┐  │
│ │ 📌 #announce (Marketing Team)     │  │
│ │  Company retreat is next Friday...│  │
│ │  Admin • 2h ago                   │  │
│ └───────────────────────────────────┘  │
│                                         │
│ ─── Recent ───                          │
│ ┌───────────────────────────────────┐  │
│ │ 👤 Sarah Johnson                  │  │
│ │  Can you add the receipt for...   │  │
│ │  3:45 PM • 🔵                     │  │
│ ├───────────────────────────────────┤  │
│ │ 📋 Q4 Travel Report               │  │
│ │  Approved! Great work on the...   │  │
│ │  Yesterday                        │  │
│ ├───────────────────────────────────┤  │
│ │ 👥 Project Alpha Team             │  │
│ │  Mike: Updated the budget...      │  │
│ │  Yesterday • 2 unread             │  │
│ ├───────────────────────────────────┤  │
│ │ 🧾 Invoice #1042                  │  │
│ │  Payment received! Thank you.     │  │
│ │  Jan 15                           │  │
│ └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### 8.2 Chat Thread Page
**Route:** `/chat/[chatId]`

```
┌─────────────────────────────────────────────┐
│ ← Sarah Johnson                       ℹ️   │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────┐       │
│  │ 👤 Sarah Johnson    3:45 PM     │       │
│  │ Can you add the receipt for     │       │
│  │ the client dinner on Tuesday?   │       │
│  │ It's missing from the report.   │       │
│  │                                 │       │
│  │ 💬 2 replies  👍 1              │       │
│  └─────────────────────────────────┘       │
│                                             │
│  ┌─────────────────────────────────┐       │
│  │ 👤 You              4:12 PM     │       │
│  │ Sure! Let me scan it now        │       │
│  └─────────────────────────────────┘       │
│                                             │
│  ┌─────────────────────────────────┐       │
│  │ 👤 You              4:15 PM     │       │
│  │ Here it is 👇                   │       │
│  │ ┌───────────┐                   │       │
│  │ │ 📷 Receipt │                  │       │
│  │ │ $145.00    │                  │       │
│  │ └───────────┘                   │       │
│  └─────────────────────────────────┘       │
│                                             │
│  ┌─────────────────────────────────┐       │
│  │ 👤 Sarah Johnson    4:20 PM     │       │
│  │ Perfect, approved! ✅            │       │
│  └─────────────────────────────────┘       │
│                                             │
│  ───── System Message ─────                │
│  ✅ Report "Client Dinner" approved        │
│  ─────────────────────────                  │
│                                             │
├─────────────────────────────────────────────┤
│ ➕ 📎                                      │
│ [Type a message...          ]  [Send →]    │
│                                             │
│ @mention  📷 Photo  📎 File  ✓ Task       │
└─────────────────────────────────────────────┘
```

---

## 🛠 Real-Time Implementation

### Firestore Real-Time Listeners

```typescript
// src/lib/hooks/useChat.ts
'use client';

import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  limit,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export function useChatMessages(chatId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(
      messagesRef, 
      orderBy('sentAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      
      setMessages(newMessages.reverse());
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  return { messages, isLoading };
}

export function useChatList(userId: string) {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participantIds', 'array-contains', userId),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Chat[];
      
      setChats(chatList);
    });

    return () => unsubscribe();
  }, [userId]);

  return { chats };
}
```

### Send Message

```typescript
export async function sendMessage(
  chatId: string, 
  userId: string, 
  text: string,
  attachments?: File[]
) {
  const messagesRef = collection(db, `chats/${chatId}/messages`);
  
  // Parse @mentions
  const mentions = parseMentions(text);
  
  // Upload attachments if any
  const uploadedAttachments = attachments 
    ? await Promise.all(attachments.map(uploadChatAttachment))
    : null;
  
  const message = {
    chatId,
    senderId: userId,
    senderName: getCurrentUser().displayName,
    senderAvatarUrl: getCurrentUser().avatarUrl,
    type: 'text',
    text,
    mentions,
    attachments: uploadedAttachments,
    parentMessageId: null,
    threadMessageCount: 0,
    reactions: {},
    isEdited: false,
    isDeleted: false,
    sentAt: serverTimestamp()
  };
  
  await addDoc(messagesRef, message);
  
  // Update chat's last message (denormalized for chat list)
  await updateChatLastMessage(chatId, {
    text: text.substring(0, 100),
    senderId: userId,
    senderName: getCurrentUser().displayName,
    sentAt: serverTimestamp(),
    type: 'text'
  });
  
  // Send push notifications to mentioned users
  if (mentions.length > 0) {
    await notifyMentionedUsers(chatId, mentions, text);
  }
}
```

---

## 🏷 @Mentions

### Mention Picker UI
When user types `@`, show a dropdown:
```
┌──────────────────────────┐
│ 🔍 @sar                  │
├──────────────────────────┤
│ 👤 Sarah Johnson         │
│ 👤 Samuel Roberts        │
│ 👤 Sara Williams         │
└──────────────────────────┘
```

### Mention Rendering
- In input: `@Sarah Johnson` shown as blue highlighted chip
- In sent message: `@Sarah Johnson` rendered as clickable blue text
- Triggers notification to mentioned user

---

## ✅ Task Management in Chat

Users can create tasks within chat threads (like Expensify's task feature):

```
┌─────────────────────────────────┐
│ ✅ Task                         │
│                                 │
│ Upload receipt for dinner       │
│ Assigned to: @John Doe          │
│ Status: ⬜ Pending              │
│                                 │
│ [Mark Complete]                 │
└─────────────────────────────────┘
```

### Task Creation
- Type `/task` in chat or click task button
- Fill: Title, Assignee, Description (optional)
- Task appears as a special message in the chat
- Assignee gets notification
- Task completion triggers system message

---

## 🏢 Workspace Channels

### Auto-created channels per workspace:
1. **#announce** — Company-wide announcements (admins post, all read)
2. **#admins** — Admin-only channel for workspace management

### Custom channels:
- Workspace admins can create custom group channels
- Examples: #engineering, #marketing, #finance
- Channel settings: Name, description, member access, posting permissions

---

## 📱 API Endpoints

```
GET    /api/chat                       # List user's chats
POST   /api/chat                       # Create new chat
GET    /api/chat/:chatId               # Get chat details
PUT    /api/chat/:chatId               # Update chat settings
DELETE /api/chat/:chatId               # Delete/leave chat

GET    /api/chat/:chatId/messages      # Get messages (paginated)
POST   /api/chat/:chatId/messages      # Send message
PUT    /api/chat/:chatId/messages/:id  # Edit message
DELETE /api/chat/:chatId/messages/:id  # Delete message

POST   /api/chat/:chatId/messages/:id/reactions  # Add reaction
POST   /api/chat/:chatId/messages/:id/thread     # Reply in thread

POST   /api/chat/:chatId/tasks         # Create task in chat
PUT    /api/chat/:chatId/tasks/:id     # Update task status

PUT    /api/chat/:chatId/read          # Mark chat as read
PUT    /api/chat/:chatId/mute          # Mute/unmute chat
PUT    /api/chat/:chatId/pin           # Pin/unpin chat
```
