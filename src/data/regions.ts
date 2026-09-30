import { RegionDefinition } from '../types';

export const REGIONS: RegionDefinition[] = [
  {
    id: 'tokyo',
    label: '東京・首都圏（関東）',
    shortName: '東京',
    description: 'TOKYO MX, テレ東, フジ, 日テレ, TBS, テレ朝, tvk, チバテレ, テレ玉, とちぎ, 群馬, NHK',
    gids: ['1', '11'], // 1: テレビ 関東, 11: テレビ 全国
  },
  {
    id: 'osaka',
    label: '大阪・近畿（関西）',
    shortName: '大阪',
    description: '読売テレビ, 毎日放送, 関西テレビ, 朝日放送, テレビ大阪, サンテレビ, KBS京都, NHK',
    gids: ['8', '11'], // 8: テレビ 近畿, 11: テレビ 全国
  },
  {
    id: 'nagoya',
    label: '名古屋・中京（東海）',
    shortName: '名古屋',
    description: '東海テレビ, 中京テレビ, CBCテレビ, メ～テレ, テレビ愛知, 三重テレビ, ぎふチャン, NHK',
    gids: ['13', '11'], // 13: テレビ 東海, 11: テレビ 全国
  },
  {
    id: 'bs',
    label: 'BSデジタル',
    shortName: 'BS',
    description: 'BS11, BS日テレ, BS朝日, BS-TBS, BSテレ東, BSフジ, BS12 トゥエルビ, WOWOW, NHK BS',
    gids: ['2', '9', '28'], // 2: BSデジタル, 9: BSアナログ/デジタル, 28: BS4K/8K
  },
  {
    id: 'cs',
    label: 'CS・アニメ専門（AT-X等）',
    shortName: 'CS / AT-X',
    description: 'AT-X, アニマックス, キッズステーション',
    gids: ['6'], // 6: スカパー / CS
  },
  {
    id: 'net',
    label: 'ネット配信（ABEMA・YouTube）',
    shortName: '配信',
    description: 'ABEMA アニメ, YouTube, ニコニコ生放送 等',
    gids: ['7', '23'], // 7: ネット配信, 23: AbemaTV
  },
  {
    id: 'all',
    label: 'すべての地域・チャンネル',
    shortName: '全チャンネル',
    description: '全国すべての地上波・BS・CS・配信チャンネル',
    gids: [], // empty means all
  },
];

export const POPULAR_VOICE_ACTORS = [
  '花澤香菜',
  '中村悠一',
  '早見沙織',
  '水瀬いのり',
  '高橋李依',
  '杉田智和',
  '悠木碧',
  '内田真礼',
  '神谷浩史',
  '小林裕介',
  '岡本信彦',
  '佐倉綾音',
  '江口拓也',
  '種﨑敦美',
  '釘宮理恵',
  '子安武人',
];
