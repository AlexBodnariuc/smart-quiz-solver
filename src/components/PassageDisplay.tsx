
import { ProcessedChunk } from '@/utils/csvParser';

interface PassageDisplayProps {
  chunks: ProcessedChunk[];
}

export const PassageDisplay = ({ chunks }: PassageDisplayProps) => {
  const getRelevanceColor = (score?: number) => {
    if (!score) return 'border-blue-400/30 bg-blue-900/20';
    
    if (score >= 0.8) return 'border-green-400/50 bg-green-900/20';
    if (score >= 0.6) return 'border-yellow-400/50 bg-yellow-900/20';
    return 'border-red-400/50 bg-red-900/20';
  };

  const getTextColor = (score?: number) => {
    if (!score) return 'text-blue-100';
    
    if (score >= 0.8) return 'text-green-100';
    if (score >= 0.6) return 'text-yellow-100';
    return 'text-red-100';
  };

  // Sort chunks by score (highest first) and take top 3
  const topChunks = chunks
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 3);

  if (topChunks.length === 0) return null;

  return (
    <div className="mt-6 border-t border-white/20 pt-6">
      <h4 className="text-cyan-300 font-semibold mb-4">
        Revizuiește cunoștințele
      </h4>
      <div className="space-y-4">
        {topChunks.map((chunk, index) => (
          <div
            key={index}
            className={`rounded-xl p-4 border ${getRelevanceColor(chunk.score)}`}
          >
            <blockquote className={`${getTextColor(chunk.score)} leading-relaxed mb-3 italic`}>
              "{chunk.text}"
            </blockquote>
            <div className="text-sm text-gray-300">
              <div className="flex flex-wrap items-center gap-2">
                {chunk.source && (
                  <span className="font-medium text-cyan-300">
                    📚 {chunk.source}
                  </span>
                )}
                {chunk.page && (
                  <span className="text-blue-200">
                    📄 Pagina {chunk.page}
                  </span>
                )}
                {chunk.score && (
                  <span className="ml-auto text-xs opacity-70 bg-white/10 px-2 py-1 rounded">
                    Relevanță: {(chunk.score * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
