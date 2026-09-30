import React from 'react';
import { Search, MapPin, X, Calendar, Filter, Mic, ChevronDown } from 'lucide-react';
import { REGIONS, POPULAR_VOICE_ACTORS } from '../data/regions';
import { RegionKey } from '../types';

interface FilterBarProps {
  selectedRegion: RegionKey;
  setSelectedRegion: (region: RegionKey) => void;
  voiceActorQuery: string;
  setVoiceActorQuery: (query: string) => void;
  titleQuery: string;
  setTitleQuery: (query: string) => void;
  dateFilter: 'all' | 'today' | 'tomorrow';
  setDateFilter: (filter: 'all' | 'today' | 'tomorrow') => void;
  timeSlotFilter: 'all' | 'night' | 'day';
  setTimeSlotFilter: (slot: 'all' | 'night' | 'day') => void;
  totalCount: number;
  filteredCount: number;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedRegion,
  setSelectedRegion,
  voiceActorQuery,
  setVoiceActorQuery,
  titleQuery,
  setTitleQuery,
  dateFilter,
  setDateFilter,
  timeSlotFilter,
  setTimeSlotFilter,
  totalCount,
  filteredCount,
  onReset,
}) => {
  const currentRegion = REGIONS.find((r) => r.id === selectedRegion) || REGIONS[0];
  const hasActiveFilters =
    selectedRegion !== 'tokyo' ||
    voiceActorQuery.trim() !== '' ||
    titleQuery.trim() !== '' ||
    dateFilter !== 'all' ||
    timeSlotFilter !== 'all';

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm py-5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Main Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* 1. Region Selector Dropdown */}
          <div className="md:col-span-4 relative">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              <span>放送地域 (ChID)</span>
            </label>
            <div className="relative">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as RegionKey)}
                className="w-full appearance-none bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg py-2.5 pl-3.5 pr-10 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors cursor-pointer"
              >
                {REGIONS.map((region) => (
                  <option key={region.id} value={region.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {region.label} ({region.shortName})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
              {currentRegion.description}
            </p>
          </div>

          {/* 2. Voice Actor Search Input */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
              <Mic className="w-3.5 h-3.5 text-indigo-500" />
              <span>声優名でリアルタイム検索</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={voiceActorQuery}
                onChange={(e) => setVoiceActorQuery(e.target.value)}
                placeholder="例: 花澤香菜, 中村悠一, 早見沙織..."
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-9 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
              {voiceActorQuery && (
                <button
                  onClick={() => setVoiceActorQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              入力と同時に出演番組を即時フィルタリングします
            </p>
          </div>

          {/* 3. Title Search Input */}
          <div className="md:col-span-3 relative">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              作品タイトルで絞り込み
            </label>
            <div className="relative">
              <input
                type="text"
                value={titleQuery}
                onChange={(e) => setTitleQuery(e.target.value)}
                placeholder="作品名・略称..."
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg py-2.5 px-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
              {titleQuery && (
                <button
                  onClick={() => setTitleQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              ひらがな・英題でも検索可能
            </p>
          </div>
        </div>

        {/* Popular Voice Actors Quick-Select Bar */}
        <div className="pt-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0 flex items-center gap-1 font-medium">
            注目声優:
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {POPULAR_VOICE_ACTORS.map((actor) => {
              const isSelected = voiceActorQuery.trim() === actor;
              return (
                <button
                  key={actor}
                  onClick={() => setVoiceActorQuery(isSelected ? '' : actor)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 border ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white font-medium shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {actor}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date & Time Slot Segmented Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2 max-w-full overflow-x-auto no-scrollbar py-0.5">
            {/* Date filter buttons */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg shrink-0">
              <button
                onClick={() => setDateFilter('all')}
                className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  dateFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                全日程
              </button>
              <button
                onClick={() => setDateFilter('today')}
                className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  dateFilter === 'today'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                今日放送
              </button>
              <button
                onClick={() => setDateFilter('tomorrow')}
                className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  dateFilter === 'tomorrow'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                明日放送
              </button>
            </div>

            {/* Time Slot filter buttons */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg shrink-0">
              <button
                onClick={() => setTimeSlotFilter('all')}
                className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  timeSlotFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                全時間帯
              </button>
              <button
                onClick={() => setTimeSlotFilter('night')}
                className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  timeSlotFilter === 'night'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                深夜アニメ (23時~)
              </button>
              <button
                onClick={() => setTimeSlotFilter('day')}
                className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  timeSlotFilter === 'day'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                朝・昼アニメ
              </button>
            </div>
          </div>

          {/* Counts & Reset */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>
              該当 <strong className="text-slate-900 dark:text-white font-mono tabular-nums">{filteredCount}</strong> 件
              <span className="text-slate-400 dark:text-slate-500"> / 全 {totalCount} 件</span>
            </span>

            {hasActiveFilters && (
              <button
                onClick={onReset}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
              >
                絞り込み解除
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
