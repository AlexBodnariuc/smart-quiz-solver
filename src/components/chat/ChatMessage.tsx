
import { Bot, User } from 'lucide-react';
import { Message } from '@/types/chat';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div
      className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {message.sender === 'ai' && (
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-1.5 rounded-lg h-fit mt-1">
          <Bot className="h-3 w-3 text-white" />
        </div>
      )}
      <div
        className={`max-w-[85%] p-3 rounded-xl text-sm ${
          message.sender === 'user'
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
            : 'bg-white/10 text-white border border-white/20'
        }`}
      >
        <p className="leading-relaxed">{message.content}</p>
        <p className="text-xs opacity-70 mt-1">
          {message.timestamp.toLocaleTimeString('ro-RO', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
      {message.sender === 'user' && (
        <div className="bg-white/10 p-1.5 rounded-lg h-fit mt-1">
          <User className="h-3 w-3 text-white" />
        </div>
      )}
    </div>
  );
};
