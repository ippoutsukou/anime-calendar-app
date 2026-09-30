import {
  RawProgItem,
  RawTitleItem,
  ChannelItem,
  EnrichedProgram,
  ParsedTitleDetails,
} from '../types';
import { parseSyoboiTitle } from '../utils/castParser';
import { parseSyoboiDate } from '../utils/dateUtils';
import channelsData from '../data/channels.json';
import initialSnapshot from '../data/initialData.json';

// Channel Map lookup by ChID
export const CHANNELS_MAP: Map<string, ChannelItem> = new Map(
  (channelsData as ChannelItem[]).map((c) => [c.id, c])
);

// Title cache in memory
const titleCache = new Map<string, ParsedTitleDetails>();

// Pre-fill cache from initial snapshot
if (initialSnapshot && initialSnapshot.titles) {
  Object.values(initialSnapshot.titles).forEach((raw: any) => {
    titleCache.set(raw.tid, parseSyoboiTitle(raw));
  });
}

/**
 * Perform fetch with multiple fallbacks for Syoboi Calendar
 */
async function fetchSyoboiXml(queryString: string): Promise<Document | null> {
  const targetUrl = `https://cal.syoboi.jp/db.php?${queryString}`;
  const endpoints = [
    `/api/syoboi?${queryString}`,
    targetUrl,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(endpoint, {
        signal: controller.signal,
        headers: {
          Accept: 'text/xml, application/xml, */*',
        },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        if (text && text.includes('<Result>')) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/xml');
          const code = doc.querySelector('Result > Code')?.textContent;
          if (code === '200' || doc.querySelector('ProgItem, TitleItem')) {
            return doc;
          }
        }
      }
    } catch {
      // Continue to next fallback
    }
  }

  return null;
}

/**
 * Fetch program schedules from Syoboi Calendar (Command=ProgLookup)
 */
export async function fetchPrograms(range?: string): Promise<RawProgItem[]> {
  // If no range specified, fetch today and next 2 days
  let rangeParam = range;
  if (!rangeParam) {
    const now = new Date();
    const startStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}_000000`;
    const end = new Date(now);
    end.setDate(end.getDate() + 3);
    const endStr = `${end.getFullYear()}${String(end.getMonth() + 1).padStart(2, '0')}${String(
      end.getDate()
    ).padStart(2, '0')}_235959`;
    rangeParam = `${startStr}-${endStr}`;
  }

  const query = `Command=ProgLookup&Range=${rangeParam}&JOIN=SubTitles`;
  const doc = await fetchSyoboiXml(query);

  if (!doc) {
    // Graceful fallback to initial snapshot
    return (initialSnapshot.programs as RawProgItem[]) || [];
  }

  const progItems = doc.querySelectorAll('ProgItem');
  const results: RawProgItem[] = [];

  progItems.forEach((item) => {
    const deleted = item.querySelector('Deleted')?.textContent;
    if (deleted === '1') return;

    results.push({
      pid: item.querySelector('PID')?.textContent || '',
      tid: item.querySelector('TID')?.textContent || '',
      chid: item.querySelector('ChID')?.textContent || '',
      stTime: item.querySelector('StTime')?.textContent || '',
      edTime: item.querySelector('EdTime')?.textContent || '',
      count: item.querySelector('Count')?.textContent || '',
      subTitle: item.querySelector('SubTitle')?.textContent || '',
      comment: item.querySelector('ProgComment')?.textContent || '',
    });
  });

  return results.length > 0 ? results : (initialSnapshot.programs as RawProgItem[]) || [];
}

/**
 * Fetch title & cast information (Command=TitleLookup)
 */
export async function fetchTitles(tids: string[]): Promise<Map<string, ParsedTitleDetails>> {
  // Filter out already cached TIDs
  const missingTids = tids.filter((id) => !titleCache.has(id));

  if (missingTids.length > 0) {
    // Syoboi allows comma-separated TIDs in chunks of ~40
    const chunkSize = 40;
    for (let i = 0; i < missingTids.length; i += chunkSize) {
      const chunk = missingTids.slice(i, i + chunkSize);
      const query = `Command=TitleLookup&TID=${chunk.join(',')}`;
      const doc = await fetchSyoboiXml(query);

      if (doc) {
        const titleNodes = doc.querySelectorAll('TitleItem');
        titleNodes.forEach((node) => {
          const tid = node.querySelector('TID')?.textContent || '';
          if (!tid) return;

          const rawItem: RawTitleItem = {
            tid,
            title: node.querySelector('Title')?.textContent || '',
            shortTitle: node.querySelector('ShortTitle')?.textContent || '',
            titleYomi: node.querySelector('TitleYomi')?.textContent || '',
            titleEn: node.querySelector('TitleEN')?.textContent || '',
            cat: node.querySelector('Cat')?.textContent || '',
            comment: node.querySelector('Comment')?.textContent || '',
          };

          titleCache.set(tid, parseSyoboiTitle(rawItem));
        });
      }
    }
  }

  return titleCache;
}

/**
 * Fetch and merge complete broadcasting dataset
 */
export async function loadEnrichedPrograms(range?: string): Promise<{
  programs: EnrichedProgram[];
  fromCache: boolean;
}> {
  try {
    const rawPrograms = await fetchPrograms(range);
    const uniqueTids = Array.from(new Set(rawPrograms.map((p) => p.tid).filter(Boolean)));

    // Fetch missing title & cast details
    await fetchTitles(uniqueTids);

    const now = new Date();

    const enriched: EnrichedProgram[] = rawPrograms.map((prog) => {
      const channel = CHANNELS_MAP.get(prog.chid);
      const channelName = channel ? channel.name : `Ch.${prog.chid}`;
      const channelGid = channel ? channel.gid : '';

      const titleDetail = titleCache.get(prog.tid) || {
        tid: prog.tid,
        title: '（タイトル未取得）',
        shortTitle: '',
        titleYomi: '',
        titleEn: '',
        cat: '',
        casts: [],
        staffs: [],
        links: [],
        rawComment: '',
      };

      const startDate = parseSyoboiDate(prog.stTime);
      const endDate = parseSyoboiDate(prog.edTime);

      const isLive = now >= startDate && now <= endDate;
      const isUpcoming = now < startDate;
      const isPast = now > endDate;

      return {
        pid: prog.pid,
        tid: prog.tid,
        chid: prog.chid,
        channelName,
        channelGid,
        stTime: prog.stTime,
        edTime: prog.edTime,
        startDate,
        endDate,
        count: prog.count || '',
        subTitle: prog.subTitle || '',
        comment: prog.comment || '',
        title: titleDetail.title,
        shortTitle: titleDetail.shortTitle,
        titleYomi: titleDetail.titleYomi,
        titleEn: titleDetail.titleEn,
        casts: titleDetail.casts,
        staffs: titleDetail.staffs,
        links: titleDetail.links,
        isLive,
        isUpcoming,
        isPast,
      };
    });

    // Sort by broadcast start time ascending
    enriched.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    return {
      programs: enriched,
      fromCache: false,
    };
  } catch (err) {
    console.error('Failed to load enriched programs:', err);
    // Fallback to snapshot
    return {
      programs: [],
      fromCache: true,
    };
  }
}
