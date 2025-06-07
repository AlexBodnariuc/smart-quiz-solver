
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  inputMessage: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
}

export const ChatInput = ({ 
  inputMessage, 
  onInputChange, 
  onSendMessage, 
  onKeyPress, 
  isLoading 
}: ChatInputProps) => {
  return (
    <div className="p-3 border-t border-blue-400/20 bg-blue-900/20">
      <div className="flex gap-2">
        <input
          value={inputMessage}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Întreabă ceva despre această întrebare..."
          className="flex-1 bg-white/10 border border-white/30 rounded-lg p-2 text-white placeholder-blue-200 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
          disabled={isLoading}
        />
        <Button
          onClick={onSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          size="sm"
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50"
        >
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
