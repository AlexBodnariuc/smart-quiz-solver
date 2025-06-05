
import { useState } from 'react';
import { Question } from '@/pages/Index';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface QuestionChatProps {
  question: Question;
  isOpen: boolean;
  onClose: () => void;
}

export const QuestionChat = ({ question, isOpen, onClose }: QuestionChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendInitialMessage = async () => {
    const initialPrompt = `Întrebarea: ${question.text}

Variante de răspuns:
${question.variants.map((variant, index) => `${String.fromCharCode(65 + index)}. ${variant}`).join('\n')}

te rog ajuta-ma sa inteleg mai bine`;

    await sendMessage(initialPrompt, true);
  };

  const sendMessage = async (message: string, isInitial = false) => {
    if (!message.trim() && !isInitial) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: isInitial ? 'te rog ajuta-ma sa inteleg mai bine' : message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-with-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: isInitial ? message : message,
          aiId: 'resp_6841cc306930819cbee23d3a2efe2ebe0e06ca3050f39bc8'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Ne pare rău, a apărut o eroare. Te rugăm să încerci din nou.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    sendMessage(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-xl">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Asistent AI pentru Întrebări</h3>
              <p className="text-blue-100 text-sm">Întreabă orice despre această întrebare</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-cyan-300 mx-auto mb-4" />
              <p className="text-blue-100 mb-4">
                Bună! Sunt aici să te ajut să înțelegi mai bine această întrebare.
              </p>
              <Button
                onClick={sendInitialMessage}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
              >
                Începe conversația
              </Button>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'ai' && (
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-xl h-fit">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'bg-white/20 text-white border border-white/30'
                }`}
              >
                <p className="leading-relaxed">{message.content}</p>
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString('ro-RO', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              {message.sender === 'user' && (
                <div className="bg-white/20 p-2 rounded-xl h-fit">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-xl h-fit">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white/20 text-white border border-white/30 p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm">Scriu...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        {messages.length > 0 && (
          <div className="p-6 border-t border-white/20">
            <div className="flex gap-3">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Scrie mesajul tău aici..."
                className="flex-1 bg-white/10 border border-white/30 rounded-xl p-3 text-white placeholder-blue-200 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                rows={1}
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
