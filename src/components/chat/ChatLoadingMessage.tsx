
import { Bot, Loader2 } from 'lucide-react';

export const ChatLoadingMessage = () => {
  return (
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
  );
};
