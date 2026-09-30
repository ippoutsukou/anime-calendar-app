import React from 'react';
import { Star, CalendarPlus, Radio, Info, ExternalLink } from 'lucide-react';
import { EnrichedProgram } from '../types';
import { formatJapaneseDate, formatTimeRange, createGoogleCalendarUrl } from '../utils/dateUtils';

interface AnimeCardProps {
  program: EnrichedProgram;
  useMidnightTime: boolean;
  searchVoiceActor: string;
  isFavorite: boolean;
  onToggleFavorite: (pid: string) => void;
  onSelectVoiceActor: (actor: string) => void;
  onOpenDetail: (program: EnrichedProgram) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  program,
  useMidnightTime,
  searchVoiceActor,
  isFavorite,
  onToggleFavorite,
  onSelectVoiceActor,
  onOpenDetail,
}) => {
  const timeString = formatTimeRange(program.startDate, program.endDate, useMidnightTime);
  const dateString = formatJapaneseDate(program.startDate);

  // Filter or limit casts to display in card
  const displayCasts = program.casts.slice(0, 5);
  const remainingCount = Math.max(0, program.casts.length - 5);

  const googleCalUrl = createGoogleCalendarUrl(
    program.title,
    program.channelName,
    program.startDate,
    program.endDate,
    `話数: ${program.count ? `第${program.count}話` : ''} ${program.subTitle}\n出演: ${program.casts
      .map((c) => `${c.character}: ${c.actor}`)
      .join(', ')}`
  );

  return (
    <article className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* Top Metadata Line (Zero-Pill Discipline: unboxed text with subtle typographic separators) */}
      <div>
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2.5 font-medium">
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
            {program.isLive && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                放送中
              </span>
            )}
            <span>{dateString}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300 font-semibold">
              {timeString}
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
              {program.channelName}
            </span>
            {program.count && (
              <>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span className="font-mono tabular-nums">第{program.count}話</span>
              </>
            )}
          </div>

          {/* Star Favorite Button */}
          <button
            onClick={() => onToggleFavorite(program.pid)}
            title={isFavorite ? 'お気に入り解除' : 'お気に入りに追加'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isFavorite
                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
          </button>
        </div>

        {/* Anime Title */}
        <h3
          onClick={() => onOpenDetail(program)}
          className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug tracking-tight hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
        >
          {program.title}
        </h3>

        {/* Subtitle / Episode Title */}
        {program.subTitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            {program.subTitle}
          </p>
        )}

        {/* Episode Notes / Warning */}
        {program.comment && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400/90 mt-1.5 line-clamp-1">
            {program.comment}
          </p>
        )}

        {/* Voice Actor & Cast List */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1.5 flex items-center justify-between">
            <span>出演声優・キャスト</span>
            {program.casts.length > 0 && (
              <span className="font-mono tabular-nums">全{program.casts.length}名</span>
            )}
          </div>

          {program.casts.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              キャスト情報登録なし
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {displayCasts.map((cast, idx) => {
                const query = searchVoiceActor.trim().toLowerCase();
                const isMatch =
                  query.length > 0 &&
                  (cast.actor.toLowerCase().includes(query) ||
                    cast.character.toLowerCase().includes(query));

                return (
                  <button
                    key={`${cast.actor}-${idx}`}
                    onClick={() => onSelectVoiceActor(cast.actor)}
                    title={`${cast.actor} で絞り込み`}
                    className={`text-xs px-2 py-0.5 rounded transition-all text-left flex items-center gap-1 cursor-pointer ${
                      isMatch
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-semibold ring-1 ring-amber-400/40'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                  >
                    {cast.character && cast.character !== '出演' && (
                      <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                        {cast.character}:
                      </span>
                    )}
                    <span>{cast.actor}</span>
                  </button>
                );
              })}

              {remainingCount > 0 && (
                <button
                  onClick={() => onOpenDetail(program)}
                  className="text-[11px] text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 self-center px-1 font-mono"
                >
                  他{remainingCount}名
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        <button
          onClick={() => onOpenDetail(program)}
          className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          <span>詳細情報</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Add to Google Calendar */}
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Googleカレンダーに登録"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">カレンダー</span>
          </a>
        </div>
      </div>
    </article>
  );
};
