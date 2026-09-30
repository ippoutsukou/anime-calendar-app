import React, { useState, useMemo } from 'react';
import { Search, Mic, ArrowRight, Film } from 'lucide-react';
import { EnrichedProgram } from '../types';

interface VoiceActorDirectoryProps {
  programs: EnrichedProgram[];
  onSelectActor: (actorName: string) => void;
}

interface ActorStat {
  actor: string;
  count: number;
  roles: { character: string; animeTitle: string; channel: string }[];
}

export const VoiceActorDirectory: React.FC<VoiceActorDirectoryProps> = ({
  programs,
  onSelectActor,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  // Aggregate voice actors across all loaded programs
  const actorStats = useMemo(() => {
    const map = new Map<string, ActorStat>();

    programs.forEach((prog) => {
      prog.casts.forEach((cast) => {
        if (!cast.actor) return;
        const existing = map.get(cast.actor);
        const roleInfo = {
          character: cast.character || '出演',
          animeTitle: prog.title,
          channel: prog.channelName,
        };

        if (existing) {
          existing.count += 1;
          // Avoid duplicate same title
          if (!existing.roles.some((r) => r.animeTitle === prog.title)) {
            existing.roles.push(roleInfo);
          }
        } else {
          map.set(cast.actor, {
            actor: cast.actor,
            count: 1,
            roles: [roleInfo],
          });
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => b.roles.length - a.roles.length);
  }, [programs]);

  const filteredActors = useMemo(() => {
    if (!filterQuery.trim()) return actorStats;
    const q = filterQuery.toLowerCase().trim();
    return actorStats.filter(
      (item) =>
        item.actor.toLowerCase().includes(q) ||
        item.roles.some(
          (r) => r.animeTitle.toLowerCase().includes(q) || r.character.toLowerCase().includes(q)
        )
    );
  }, [actorStats, filterQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-indigo-500" />
            <span>出演声優インデックス</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            現在ロードされている番組表に出演している全 {actorStats.length} 名の声優リストです
          </p>
        </div>

        {/* Local Search */}
        <div className="w-full md:w-72 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="声優名・キャラクター名..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Grid of Voice Actors */}
      {filteredActors.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500">条件に一致する声優は見つかりませんでした。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredActors.map((stat) => (
            <div
              key={stat.actor}
              onClick={() => onSelectActor(stat.actor)}
              className="group bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm">
                    {stat.actor}
                  </h3>
                  <span className="text-xs font-mono tabular-nums px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    {stat.roles.length} 作品
                  </span>
                </div>

                {/* Roles sample */}
                <div className="space-y-1 mt-2">
                  {stat.roles.slice(0, 2).map((r, i) => (
                    <div key={i} className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium mr-1">
                        {r.character}:
                      </span>
                      <span>{r.animeTitle}</span>
                    </div>
                  ))}
                  {stat.roles.length > 2 && (
                    <p className="text-[11px] text-slate-400 italic">
                      他 {stat.roles.length - 2} 作品に出演
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                <span>番組表で見る</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
