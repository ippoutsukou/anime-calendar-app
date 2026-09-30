import React from 'react';
import { RefreshCw, Moon, Sun, Clock, Calendar, Mic, Star } from 'lucide-react';

interface HeaderProps {
  activeTab: 'schedule' | 'voice-actors' | 'favorites';
  setActiveTab: (tab: 'schedule' | 'voice-actors' | 'favorites') => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  useMidnightTime: boolean;
  setUseMidnightTime: (val: boolean) => void;
  onRefresh: () => void;
  isLoading: boolean;
  favoriteCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  useMidnightTime,
  setUseMidnightTime,
  onRefresh,
  isLoading,
  favoriteCount,
}) => {
  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Zone 1: Wordmark Brand Title */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-sm shadow-indigo-500/20 shrink-0">
              SY
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('schedule');
              }}
              className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2 hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <span>アニメ番組ナビ</span>
              <span className="text-[10px] sm:text-[11px] font-normal text-slate-400 dark:text-slate-500 hidden lg:inline">
                しょぼいカレンダー連携
              </span>
            </a>
          </div>

          {/* Zone 2: Desktop Navigation Links (Hidden on mobile to prevent cramming) */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-4 text-sm font-medium">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'schedule'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              番組表
            </button>
            <button
              onClick={() => setActiveTab('voice-actors')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'voice-actors'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              声優一覧
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'favorites'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>お気に入り</span>
              {favoriteCount > 0 && (
                <span className="text-xs font-mono px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  {favoriteCount}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Refresh, 24+ toggle, Dark mode) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Midnight 25:00 Time Toggle */}
            <button
              onClick={() => setUseMidnightTime(!useMidnightTime)}
              title={useMidnightTime ? '24時以降を通常表記（翌日1時等）に変更' : '深夜アニメ表記（25時等）に変更'}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-mono rounded-md border transition-colors whitespace-nowrap cursor-pointer ${
                useMidnightTime
                  ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{useMidnightTime ? '25:00' : '標準'}</span>
            </button>

            {/* Sync Syoboi API */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="最新の番組スケジュールを取得"
              className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
            </button>

            {/* Theme Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              title={isDark ? 'ライトモードに切替' : 'ダークモードに切替'}
              className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Native App Style: Thumb-Friendly & Never Wraps) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe shadow-lg">
        <div className="grid grid-cols-3 h-14 max-w-md mx-auto">
          {/* Schedule Tab */}
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'schedule'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className={`w-4 h-4 ${activeTab === 'schedule' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[11px] tracking-tight leading-none whitespace-nowrap">番組表</span>
          </button>

          {/* Voice Actors Tab */}
          <button
            onClick={() => setActiveTab('voice-actors')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'voice-actors'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Mic className={`w-4 h-4 ${activeTab === 'voice-actors' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[11px] tracking-tight leading-none whitespace-nowrap">声優一覧</span>
          </button>

          {/* Favorites Tab */}
          <button
            onClick={() => setActiveTab('favorites')}
            className={`relative flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'favorites'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Star
                className={`w-4 h-4 ${
                  activeTab === 'favorites'
                    ? 'stroke-[2.5] fill-amber-400 text-amber-500'
                    : ''
                }`}
              />
              {favoriteCount > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1 min-w-[14px] h-3.5 flex items-center justify-center text-[9px] font-mono font-bold rounded-full bg-indigo-600 text-white">
                  {favoriteCount}
                </span>
              )}
            </div>
            <span className="text-[11px] tracking-tight leading-none whitespace-nowrap">お気に入り</span>
          </button>
        </div>
      </nav>
    </>
  );
};
