import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { AnimeCard } from './components/AnimeCard';
import { ProgramDetailModal } from './components/ProgramDetailModal';
import { VoiceActorDirectory } from './components/VoiceActorDirectory';
import { EmptyState } from './components/EmptyState';
import { loadEnrichedPrograms } from './services/syoboi';
import { EnrichedProgram, RegionKey } from './types';
import { REGIONS } from './data/regions';
import { formatJapaneseDate, isToday, isTomorrow } from './utils/dateUtils';
import heroBackdrop from './assets/images/anime_broadcast_hero_1790770352408.jpg';
import { Radio, Calendar, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [programs, setPrograms] = useState<EnrichedProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'schedule' | 'voice-actors' | 'favorites'>('schedule');

  // Filters
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>(() => {
    return (localStorage.getItem('anime_nav_region') as RegionKey) || 'tokyo';
  });
  const [voiceActorQuery, setVoiceActorQuery] = useState('');
  const [titleQuery, setTitleQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow'>('all');
  const [timeSlotFilter, setTimeSlotFilter] = useState<'all' | 'night' | 'day'>('all');

  // Display Preferences
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('anime_nav_theme');
    if (saved) return saved === 'dark';
    return true; // default dark mode
  });
  const [useMidnightTime, setUseMidnightTime] = useState<boolean>(() => {
    return localStorage.getItem('anime_nav_midnight') === 'true';
  });

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('anime_nav_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Selected program for modal
  const [selectedProgram, setSelectedProgram] = useState<EnrichedProgram | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Handle theme change
  useEffect(() => {
    localStorage.setItem('anime_nav_theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Handle region persistence
  useEffect(() => {
    localStorage.setItem('anime_nav_region', selectedRegion);
  }, [selectedRegion]);

  // Handle midnight time format persistence
  useEffect(() => {
    localStorage.setItem('anime_nav_midnight', String(useMidnightTime));
  }, [useMidnightTime]);

  // Handle favorites persistence
  useEffect(() => {
    localStorage.setItem('anime_nav_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Fetch Syoboi Data
  const loadData = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const result = await loadEnrichedPrograms();
      setPrograms(result.programs);
      setLastUpdated(new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }));
    } catch (err: any) {
      console.error(err);
      setApiError('しょぼいカレンダーからのデータ取得中にエラーが発生しました。初期データで表示しています。');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleFavorite = (pid: string) => {
    setFavorites((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]
    );
  };

  const handleSelectVoiceActorFromCard = (actor: string) => {
    setVoiceActorQuery(actor);
    setActiveTab('schedule');
    window.scrollTo({ top: 220, behavior: 'smooth' });
  };

  const currentRegionDef = useMemo(() => {
    return REGIONS.find((r) => r.id === selectedRegion) || REGIONS[0];
  }, [selectedRegion]);

  // Filtered Programs Logic
  const filteredPrograms = useMemo(() => {
    const vaQuery = voiceActorQuery.trim().toLowerCase();
    const tQuery = titleQuery.trim().toLowerCase();
    const regionGids = currentRegionDef.gids;

    return programs.filter((prog) => {
      // 1. Favorites Tab check
      if (activeTab === 'favorites') {
        if (!favorites.includes(prog.pid)) return false;
      }

      // 2. Region check (match channel ChGID)
      if (regionGids.length > 0) {
        if (!regionGids.includes(prog.channelGid)) {
          return false;
        }
      }

      // 3. Voice Actor real-time search
      if (vaQuery.length > 0) {
        const matchesCast = prog.casts.some(
          (c) =>
            c.actor.toLowerCase().includes(vaQuery) ||
            c.character.toLowerCase().includes(vaQuery)
        );
        if (!matchesCast) return false;
      }

      // 4. Title search
      if (tQuery.length > 0) {
        const matchesTitle =
          prog.title.toLowerCase().includes(tQuery) ||
          prog.shortTitle.toLowerCase().includes(tQuery) ||
          prog.titleYomi.toLowerCase().includes(tQuery) ||
          prog.titleEn.toLowerCase().includes(tQuery);
        if (!matchesTitle) return false;
      }

      // 5. Date filter
      if (dateFilter === 'today') {
        if (!isToday(prog.startDate)) return false;
      } else if (dateFilter === 'tomorrow') {
        if (!isTomorrow(prog.startDate)) return false;
      }

      // 6. Time slot filter
      if (timeSlotFilter === 'night') {
        const h = prog.startDate.getHours();
        if (h < 22 && h >= 5) return false;
      } else if (timeSlotFilter === 'day') {
        const h = prog.startDate.getHours();
        if (h >= 22 || h < 5) return false;
      }

      return true;
    });
  }, [
    programs,
    activeTab,
    favorites,
    currentRegionDef,
    voiceActorQuery,
    titleQuery,
    dateFilter,
    timeSlotFilter,
  ]);

  // Group filtered programs by Date
  const groupedPrograms = useMemo(() => {
    const groups: { [key: string]: { label: string; date: Date; items: EnrichedProgram[] } } = {};

    filteredPrograms.forEach((prog) => {
      const dateKey = `${prog.startDate.getFullYear()}-${prog.startDate.getMonth()}-${prog.startDate.getDate()}`;
      if (!groups[dateKey]) {
        groups[dateKey] = {
          label: formatJapaneseDate(prog.startDate),
          date: prog.startDate,
          items: [],
        };
      }
      groups[dateKey].items.push(prog);
    });

    return Object.values(groups).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [filteredPrograms]);

  const handleResetFilters = () => {
    setSelectedRegion('tokyo');
    setVoiceActorQuery('');
    setTitleQuery('');
    setDateFilter('all');
    setTimeSlotFilter('all');
  };

  const handleSwitchToAllRegions = () => {
    setSelectedRegion('all');
    setDateFilter('all');
    setTimeSlotFilter('all');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans pb-16 md:pb-0">
      {/* 1. Header (Top Bar Contract) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        setIsDark={setIsDark}
        useMidnightTime={useMidnightTime}
        setUseMidnightTime={setUseMidnightTime}
        onRefresh={loadData}
        isLoading={isLoading}
        favoriteCount={favorites.length}
      />

      {/* 2. Atmospheric Hero Section (Cleanly bounded with Makoto Shinkai-styled Tokyo skyline) */}
      <section className="relative w-full overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-slate-900">
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-30">
          <img
            src={heroBackdrop}
            alt="東京の夜景と放送アンテナ"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-2">
              <Radio className="w-3.5 h-3.5" />
              <span>SYOBOI CALENDAR API REALTIME INTEGRATION</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              地域別アニメ放送スケジュール＆<br className="hidden sm:inline" />声優絞り込み検索
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
              東京・大阪・名古屋・BSなど各地域の最新放送局（ChID）に対応。
              お気に入りの声優名を入力して、出演アニメの放送枠をリアルタイムに検索できます。
            </p>
          </div>
        </div>
      </section>

      {/* 3. API Error Warning Banner (if any) */}
      {apiError && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-600 dark:text-amber-400 flex items-center justify-between">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        </div>
      )}

      {/* 4. Filter Controls Bar */}
      <FilterBar
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        voiceActorQuery={voiceActorQuery}
        setVoiceActorQuery={setVoiceActorQuery}
        titleQuery={titleQuery}
        setTitleQuery={setTitleQuery}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        timeSlotFilter={timeSlotFilter}
        setTimeSlotFilter={setTimeSlotFilter}
        totalCount={programs.length}
        filteredCount={filteredPrograms.length}
        onReset={handleResetFilters}
      />

      {/* 5. Main Content Area */}
      <main className="flex-1">
        {activeTab === 'voice-actors' ? (
          <VoiceActorDirectory
            programs={programs}
            onSelectActor={(actor) => {
              setVoiceActorQuery(actor);
              setActiveTab('schedule');
            }}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* View Mode Title Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {activeTab === 'favorites' ? (
                    <span>お気に入り登録したアニメ番組</span>
                  ) : (
                    <span>{currentRegionDef.label} の番組表</span>
                  )}
                  {voiceActorQuery && (
                    <span className="text-xs font-normal text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                      「{voiceActorQuery}」出演作
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  放送局 {currentRegionDef.description}
                  {lastUpdated && ` · 最終更新 ${lastUpdated}`}
                </p>
              </div>
            </div>

            {/* Loading Skeleton */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 animate-pulse"
                  >
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
                    <div className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : filteredPrograms.length === 0 ? (
              <EmptyState
                voiceActorQuery={voiceActorQuery}
                regionLabel={currentRegionDef.shortName}
                onResetFilters={handleResetFilters}
                onSwitchToAllRegions={handleSwitchToAllRegions}
              />
            ) : (
              /* Grouped Date Sections */
              <div className="space-y-10">
                {groupedPrograms.map((group) => (
                  <section key={group.label} className="space-y-4">
                    {/* Section Date Anchor Header */}
                    <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5 text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <span>{group.label}</span>
                        {isToday(group.date) && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ml-1">
                            本日
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-mono tabular-nums">
                        ({group.items.length}番組)
                      </span>
                    </div>

                    {/* Anime Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.items.map((program) => (
                        <AnimeCard
                          key={`${program.pid}-${program.chid}`}
                          program={program}
                          useMidnightTime={useMidnightTime}
                          searchVoiceActor={voiceActorQuery}
                          isFavorite={favorites.includes(program.pid)}
                          onToggleFavorite={toggleFavorite}
                          onSelectVoiceActor={handleSelectVoiceActorFromCard}
                          onOpenDetail={(prog) => setSelectedProgram(prog)}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 6. Program Detail Modal */}
      {selectedProgram && (
        <ProgramDetailModal
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
          isFavorite={favorites.includes(selectedProgram.pid)}
          onToggleFavorite={toggleFavorite}
          onSelectVoiceActor={handleSelectVoiceActorFromCard}
          useMidnightTime={useMidnightTime}
        />
      )}

      {/* 7. Subtle Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            データ提供:{' '}
            <a
              href="https://cal.syoboi.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              しょぼいカレンダー
            </a>{' '}
            (ProgLookup / TitleLookup API)
          </p>
          <p className="text-slate-400 dark:text-slate-600">
            アニメ番組ナビ · 地域別地上波＆BS放送スケジュール
          </p>
        </div>
      </footer>
    </div>
  );
}
