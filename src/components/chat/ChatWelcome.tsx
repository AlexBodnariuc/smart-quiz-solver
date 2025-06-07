
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatWelcomeProps {
  onStartChat: () => void;
}

export const ChatWelcome = ({ onStartChat }: ChatWelcomeProps) => {
  return (
    <div className="text-center py-4">
      <Bot className="h-8 w-8 text-cyan-300 mx-auto mb-2" />
      <p className="text-blue-100 text-sm mb-3">
        Bună! Sunt aici să îți explic în detaliu această întrebare.
      </p>
      <Button
        onClick={onStartChat}
        size="sm"
        className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
      >
        Începe explicația
      </Button>
    </div>
  );
};
