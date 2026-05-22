import { apiGet, apiPost, apiDelete } from './api';

export interface SendMessageRequest {
  content: string;
  presetType?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  presetType: string | null;
  createdAt: string;
}

export const chatService = {
  async getMessages(): Promise<ChatMessage[]> {
    return apiGet('/chat/messages');
  },

  async sendMessage(data: SendMessageRequest): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
    return apiPost('/chat/message', data);
  },

  async clearMessages(): Promise<void> {
    return apiDelete('/chat/messages');
  },
};
