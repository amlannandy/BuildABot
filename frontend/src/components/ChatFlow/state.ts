import { create } from 'zustand';

interface ChatFlowState {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  removeMessage: (messageId: string) => void;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export const useChatFlowStore = create<ChatFlowState>((set) => ({
  messages: [],
  addMessage: (message: ChatMessage) => {
    set((state: ChatFlowState) => ({ messages: [...state.messages, message] }));
  },
  removeMessage: (messageId: string) => {
    set((state: ChatFlowState) => ({
      messages: state.messages.filter((msg) => msg.id !== messageId),
    }));
  },
}));
