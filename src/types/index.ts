/**
 * Types for Syoboi Calendar Anime Broadcasting Application
 */

export interface RawProgItem {
  pid: string;
  tid: string;
  chid: string;
  stTime: string; // YYYY-MM-DD HH:mm:ss
  edTime: string; // YYYY-MM-DD HH:mm:ss
  count?: string;
  subTitle?: string;
  comment?: string;
}

export interface CastItem {
  character: string;
  actor: string;
}

export interface StaffItem {
  role: string;
  name: string;
}

export interface LinkItem {
  title: string;
  url: string;
}

export interface RawTitleItem {
  tid: string;
  title: string;
  shortTitle?: string;
  titleYomi?: string;
  titleEn?: string;
  cat?: string;
  comment?: string;
}

export interface ParsedTitleDetails {
  tid: string;
  title: string;
  shortTitle: string;
  titleYomi: string;
  titleEn: string;
  cat: string;
  casts: CastItem[];
  staffs: StaffItem[];
  links: LinkItem[];
  rawComment: string;
}

export interface ChannelItem {
  id: string;
  name: string;
  gid: string;
  epg?: string;
}

export interface EnrichedProgram {
  pid: string;
  tid: string;
  chid: string;
  channelName: string;
  channelGid: string;
  stTime: string; // e.g. "2026-09-30 23:30:00"
  edTime: string;
  startDate: Date;
  endDate: Date;
  count: string; // e.g. "12"
  subTitle: string;
  comment: string;
  title: string;
  shortTitle: string;
  titleYomi: string;
  titleEn: string;
  casts: CastItem[];
  staffs: StaffItem[];
  links: LinkItem[];
  isLive: boolean;
  isUpcoming: boolean;
  isPast: boolean;
}

export type RegionKey = 'tokyo' | 'osaka' | 'nagoya' | 'bs' | 'cs' | 'net' | 'all';

export interface RegionDefinition {
  id: RegionKey;
  label: string;
  shortName: string;
  description: string;
  gids: string[];
}
