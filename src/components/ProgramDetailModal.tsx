import React from 'react';
import { X, CalendarPlus, Download, ExternalLink, Star, Radio, Film, Users, Globe } from 'lucide-react';
import { EnrichedProgram } from '../types';
import {
  formatJapaneseDate,
  formatTimeRange,
  createGoogleCalendarUrl,
  downloadIcsFile,
} from '../utils/dateUtils';

interface ProgramDetailModalProps {
  program: EnrichedProgram | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (pid: string) => void;
  onSelectVoiceActor: (actor: string) => void;
  useMidnightTime: boolean;
}

export const ProgramDetailModal: React.FC<ProgramDetailModalProps> = ({
  program,
  onClose,
  isFavorite,
  onToggleFavorite,
  onSelectVoiceActor,
  useMidnightTime,
}) => {
  if (!program) return null;

  const timeString = formatTimeRange(program.startDate, program.endDate, useMidnightTime);
  const dateString = formatJapaneseDate(program.startDate);

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
              <span>{program.channelName}</span>
              <span aria-hidden="true">·</span>
              <span>{dateString}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{timeString}</span>
              {program.count && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">第{program.count}話</span>
                </>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {program.title}
            </h2>

            {program.titleYomi && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                {program.titleYomi}
              </p>
            )}
            {program.titleEn && (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-0.5">
                {program.titleEn}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleFavorite(program.pid)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isFavorite
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isFavorite ? 'お気に入り解除' : 'お気に入りに追加'}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm">
          {/* Subtitle / Episode Title & Comment */}
          {(program.subTitle || program.comment) && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              {program.subTitle && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mb-0.5">
                    サブタイトル
                  </span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {program.subTitle}
                  </p>
                </div>
              )}
              {program.comment && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mb-0.5">
                    放送注記・特記事項
                  </span>
                  <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed whitespace-pre-wrap">
                    {program.comment}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Casts Section */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>出演声優・キャスト ({program.casts.length}名)</span>
              </h3>
              <span className="text-xs text-slate-400">クリックで声優検索</span>
            </div>

            {program.casts.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                キャスト情報はしょぼいカレンダーにまだ登録されていません。
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {program.casts.map((cast, idx) => (
                  <div
                    key={`${cast.actor}-${idx}`}
                    onClick={() => {
                      onSelectVoiceActor(cast.actor);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all cursor-pointer group"
                  >
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                      {cast.character || '出演'}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {cast.actor}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Staffs Section */}
          {program.staffs.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2.5">
                <Film className="w-4 h-4 text-indigo-500" />
                <span>主要スタッフ</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                {program.staffs.map((staff, idx) => (
                  <div key={`${staff.role}-${idx}`} className="flex items-center justify-between py-0.5">
                    <span className="text-slate-400 dark:text-slate-500">{staff.role}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {staff.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Links & Syoboi Reference */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2.5">
              <Globe className="w-4 h-4 text-indigo-500" />
              <span>関連リンク・公式サイト</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {program.links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  <span>{link.title}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              ))}

              <a
                href={`https://cal.syoboi.jp/tid/${program.tid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <span>しょぼいカレンダー作品詳細 (TID: {program.tid})</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <a
              href={googleCalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Googleカレンダーに追加</span>
            </a>

            <button
              onClick={() =>
                downloadIcsFile(
                  program.title,
                  program.channelName,
                  program.startDate,
                  program.endDate,
                  `話数: ${program.count ? `第${program.count}話` : ''} ${program.subTitle}`
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>iCal (.ics)</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
