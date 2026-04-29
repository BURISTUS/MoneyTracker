export type PresetType = 'SPENDING_REPORT' | 'BUDGET_ANALYSIS' | 'SAVINGS_TIPS' | 'DYNAMICS';

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  presetType: PresetType | null;
  createdAt: string;
}

export interface SendMessageRequest {
  content: string;
  presetType?: PresetType;
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}
