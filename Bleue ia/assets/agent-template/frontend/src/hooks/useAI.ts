import { useState, useCallback, useRef } from 'react';
import { chatAPI } from '@/lib/api';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export function useAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      abortRef.current = new AbortController();
      
      const response = await chatAPI.send(content, conversationId, false);
      
      const assistantMsg: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);
      setConversationId(response.conversation_id);
    } catch (error) {
      const errorMsg: Message = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: `Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [conversationId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(undefined);
  }, []);

  const cancelRequest = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  return {
    messages,
    isLoading,
    conversationId,
    sendMessage,
    clearChat,
    cancelRequest,
  };
}
