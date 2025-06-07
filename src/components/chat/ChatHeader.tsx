
import { Bot } from 'lucide-react';

export const ChatHeader = () => {
  return (
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
  );
};
