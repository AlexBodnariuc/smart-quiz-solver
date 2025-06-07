
import { useState } from 'react';
import { Question } from '@/pages/Index';
import { MessageCircle, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface InlineAIChatProps {
  question: Question;
  hasAnswered: boolean;
}

export const InlineAIChat = ({ question, hasAnswered }: InlineAIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const [chatExpanded, setChatExpanded] = useState(false);

  const sendMessage = async (message: string, isInitial = false) => {
    if (!message.trim() && !isInitial) return;
    if (!apiKey.trim()) {
      alert('Te rugăm să introduci cheia API Respell mai întâi.');
      return;
    }

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
      const prompt = isInitial ? 
        `Întrebarea: ${question.text}

Variante de răspuns:
${question.variants.map((variant, index) => `${String.fromCharCode(65 + index)}. ${variant}`).join('\n')}

${question.explanation ? `Explicația existentă: ${question.explanation}` : ''}

Te rog explică-mi mai detaliat această întrebare și conceptele din spatele ei.` 
        : message;

      console.log('Sending message via Supabase edge function');

      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: prompt,
          apiKey: apiKey
        }
      });

      console.log('Supabase edge function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Eroare în comunicarea cu serviciul AI');
      }

      if (data?.error) {
        console.error('API error from edge function:', data.error);
        throw new Error(data.error);
      }

      const aiResponse = data?.response || 'Ne pare rău, nu am primit un răspuns valid de la AI.';

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

  const handleSendMessage = () => {
    sendMessage(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      setShowApiKeyInput(false);
      setChatExpanded(true);
    }
  };

  const startChat = () => {
    setChatExpanded(true);
    if (messages.length === 0) {
      sendMessage('', true);
    }
  };

  if (!hasAnswered) return null;

  return (
    <div className="border-t border-white/20 pt-6">
      {/* Header Button */}
      {!chatExpanded && (
        <button
          onClick={() => setShowApiKeyInput(true)}
          className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200 font-semibold mb-4 transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          Întreabă AI-ul pentru explicații suplimentare
        </button>
      )}

      {/* API Key Input */}
      {showApiKeyInput && (
        <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-400/30 mb-4">
          <div className="space-y-4">
            <div>
              <label className="text-cyan-300 font-semibold mb-2 block">
                Cheia API Respell
              </label>
              <p className="text-blue-100 text-sm mb-3">
                Pentru a folosi AI-ul, introdu cheia ta API de la Respell.
              </p>
              <div className="flex gap-3">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="resp_..."
                  className="flex-1 bg-white/10 border border-white/30 rounded-xl p-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <Button
                  onClick={handleApiKeySubmit}
                  disabled={!apiKey.trim()}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50"
                >
                  Începe Chat
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {chatExpanded && !showApiKeyInput && (
        <div className="bg-blue-900/30 rounded-xl border border-blue-400/30 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 p-4 border-b border-blue-400/20">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-xl">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="text-cyan-300 font-semibold">Asistent AI pentru Explicații</h4>
                <p className="text-blue-100 text-sm">Întreabă orice despre această întrebare</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="max-h-64 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-4">
                <Bot className="h-8 w-8 text-cyan-300 mx-auto mb-2" />
                <p className="text-blue-100 text-sm mb-3">
                  Bună! Sunt aici să îți explic în detaliu această întrebare.
                </p>
                <Button
                  onClick={startChat}
                  size="sm"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
                >
                  Începe explicația
                </Button>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
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
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-1.5 rounded-lg h-fit">
                  <Bot className="h-3 w-3 text-white" />
                </div>
                <div className="bg-white/10 text-white border border-white/20 p-3 rounded-xl text-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Scriu...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          {messages.length > 0 && (
            <div className="p-3 border-t border-blue-400/20 bg-blue-900/20">
              <div className="flex gap-2">
                <input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Întreabă ceva despre această întrebare..."
                  className="flex-1 bg-white/10 border border-white/30 rounded-lg p-2 text-white placeholder-blue-200 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
