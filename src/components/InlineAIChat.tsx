
import { useState } from 'react';
import { Question } from '@/pages/Index';
import { MessageCircle } from 'lucide-react';
import { Message } from '@/types/chat';
import { ChatHeader } from './chat/ChatHeader';
import { ChatMessage } from './chat/ChatMessage';
import { ChatInput } from './chat/ChatInput';
import { ChatWelcome } from './chat/ChatWelcome';
import { ChatLoadingMessage } from './chat/ChatLoadingMessage';
import { useChatService } from '@/hooks/useChatService';

interface InlineAIChatProps {
  question: Question;
  hasAnswered: boolean;
}

export const InlineAIChat = ({ question, hasAnswered }: InlineAIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const { sendMessage } = useChatService();

  const handleSendMessage = async (message: string, isInitial = false) => {
    if (!message.trim() && !isInitial) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: isInitial ? 'Explică-mi mai detaliat această întrebare' : message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await sendMessage(message, question, isInitial);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : 'Ne pare rău, a apărut o eroare. Te rugăm să încerci din nou.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputSendMessage = () => {
    handleSendMessage(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleInputSendMessage();
    }
  };

  const startChat = () => {
    setChatExpanded(true);
    if (messages.length === 0) {
      handleSendMessage('', true);
    }
  };

  if (!hasAnswered) return null;

  return (
    <div className="border-t border-white/20 pt-6">
      {/* Header Button */}
      {!chatExpanded && (
        <button
          onClick={startChat}
          className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200 font-semibold mb-4 transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          Întreabă AI-ul pentru explicații suplimentare
        </button>
      )}

      {/* Chat Interface */}
      {chatExpanded && (
        <div className="bg-blue-900/30 rounded-xl border border-blue-400/30 overflow-hidden">
          <ChatHeader />

          {/* Messages */}
          <div className="max-h-64 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && !isLoading && (
              <ChatWelcome onStartChat={startChat} />
            )}

            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && <ChatLoadingMessage />}
          </div>

          {/* Input */}
          {messages.length > 0 && (
            <ChatInput
              inputMessage={inputMessage}
              onInputChange={setInputMessage}
              onSendMessage={handleInputSendMessage}
              onKeyPress={handleKeyPress}
              isLoading={isLoading}
            />
          )}
        </div>
      )}
    </div>
  );
};
