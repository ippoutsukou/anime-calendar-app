import React, { useState } from 'react';
import { SearchX, RotateCcw, Globe } from 'lucide-react';
import emptyIllustration from '../assets/images/anime_empty_placeholder_1790770368504.jpg';

interface EmptyStateProps {
  voiceActorQuery: string;
  regionLabel: string;
  onResetFilters: () => void;
  onSwitchToAllRegions: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  voiceActorQuery,
  regionLabel,
  onResetFilters,
  onSwitchToAllRegions,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
      {/* Illustration with robust fallback */}
      <div className="w-48 h-36 mx-auto mb-6 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
        {!imageError ? (
          <img
            src={emptyIllustration}
            alt="アニメ放送・声優検索の該当なしイラスト"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <SearchX className="w-10 h-10 mb-2" />
            <span className="text-xs">データなし</span>
          </div>
        )}
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        該当するアニメ番組が見つかりませんでした
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
        {voiceActorQuery ? (
          <>
            声優「<strong className="text-slate-900 dark:text-white">{voiceActorQuery}</strong>」が出演する番組は、
            現在の地域（{regionLabel}）の放送予定にありません。
          </>
        ) : (
          <>選択された地域や時間帯の条件に合致するアニメ放送が見つかりませんでした。</>
        )}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onResetFilters}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>検索条件をすべてクリア</span>
        </button>

        <button
          onClick={onSwitchToAllRegions}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>全地域のチャンネルで探す</span>
        </button>
      </div>
    </div>
  );
};
