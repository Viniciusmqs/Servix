import { api } from './api';

export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  type: 'TEXT' | 'PROPOSAL';
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  requestId: string;
  requestTitle: string;
  otherPartyId: string;
  otherPartyName: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

function extractList(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data?.content && Array.isArray(data.content)) return data.content;
  return [];
}

export const chatService = {
  getMessages: async (requestId: string): Promise<ChatMessage[]> => {
    const { data } = await api.get<any>(`/chat/requests/${requestId}/messages`);
    return extractList(data);
  },

  sendMessage: async (requestId: string, content: string, receiverId: string): Promise<ChatMessage> => {
    const { data } = await api.post<ChatMessage>(`/chat/requests/${requestId}/messages`, {
      content,
      type: 'TEXT',
      receiverId,
    });
    return data;
  },

  getConversations: async (): Promise<Conversation[]> => {
    const { data } = await api.get<any>('/chat/conversations');
    return extractList(data);
  },

  markAsRead: async (requestId: string): Promise<void> => {
    await api.patch(`/chat/requests/${requestId}/read`);
  },
};
