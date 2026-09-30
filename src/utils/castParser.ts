import { CastItem, StaffItem, LinkItem, ParsedTitleDetails, RawTitleItem } from '../types';

/**
 * Parses the raw Comment field from Syoboi Calendar db.php TitleLookup.
 * The Syoboi Comment format uses wiki-like syntax:
 * *キャスト
 * :キャラクター名:声優名
 * :キャラクター名:声優名
 * 
 * *スタッフ
 * :監督:氏名
 * :アニメーション制作:制作会社
 * 
 * *リンク
 * -[[公式サイトURL]]
 */
export function parseSyoboiTitle(titleItem: RawTitleItem): ParsedTitleDetails {
  const comment = titleItem.comment || '';
  const casts = parseCasts(comment);
  const staffs = parseStaffs(comment);
  const links = parseLinks(comment);

  return {
    tid: titleItem.tid,
    title: titleItem.title || '（タイトル未定）',
    shortTitle: titleItem.shortTitle || '',
    titleYomi: titleItem.titleYomi || '',
    titleEn: titleItem.titleEn || '',
    cat: titleItem.cat || '',
    casts,
    staffs,
    links,
    rawComment: comment,
  };
}

/**
 * Extract cast list from comment string
 */
export function parseCasts(comment: string): CastItem[] {
  if (!comment) return [];

  const castMatch = comment.match(/\*キャスト([\s\S]*?)(?=(\n\*|\r\n\*|$))/);
  if (!castMatch) return [];

  const castSection = castMatch[1];
  const results: CastItem[] = [];

  // Syoboi can have lines like:
  // :役名:声優名
  // or a single line separated by colons: :ナツキ・スバル:小林裕介:エミリア:高橋李依
  const lines = castSection.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith(':')) {
      // Split tokens by ':'
      const parts = trimmed.split(':').map((s) => s.trim());
      // parts[0] is empty because trimmed starts with ':'
      const validTokens = parts.slice(1);

      // Group in pairs (character, actor)
      for (let i = 0; i < validTokens.length; i += 2) {
        const charName = validTokens[i] || '';
        const actorName = validTokens[i + 1] || '';

        if (actorName) {
          results.push({
            character: charName,
            actor: actorName,
          });
        } else if (charName) {
          // If only 1 token (e.g. ::声優名 or :声優名)
          results.push({
            character: '出演',
            actor: charName,
          });
        }
      }
    } else if (trimmed.includes('：') || trimmed.includes(':')) {
      const sep = trimmed.includes('：') ? '：' : ':';
      const [charName, actorName] = trimmed.split(sep).map((s) => s.trim());
      if (actorName) {
        results.push({
          character: charName.replace(/^[-*•\s]+/, ''),
          actor: actorName,
        });
      }
    }
  }

  return results;
}

/**
 * Extract staff list from comment string
 */
export function parseStaffs(comment: string): StaffItem[] {
  if (!comment) return [];

  const staffMatch = comment.match(/\*スタッフ([\s\S]*?)(?=(\n\*|\r\n\*|$))/);
  if (!staffMatch) return [];

  const staffSection = staffMatch[1];
  const results: StaffItem[] = [];
  const lines = staffSection.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith(':')) {
      const parts = trimmed.split(':').map((s) => s.trim()).filter(Boolean);
      for (let i = 0; i < parts.length; i += 2) {
        const role = parts[i] || '';
        const name = parts[i + 1] || '';
        if (role && name) {
          results.push({ role, name });
        }
      }
    }
  }

  return results;
}

/**
 * Extract links from comment string
 */
export function parseLinks(comment: string): LinkItem[] {
  if (!comment) return [];

  const linkMatch = comment.match(/\*リンク([\s\S]*?)(?=(\n\*|\r\n\*|$))/);
  if (!linkMatch) return [];

  const linkSection = linkMatch[1];
  const results: LinkItem[] = [];

  // Syoboi links format: -[[Label https://example.com/]] or [[https://...]]
  const bracketRegex = /\[\[(?:([^\]\s]+)\s+)?(https?:\/\/[^\]\s]+)\]\]/g;
  let match: RegExpExecArray | null;

  while ((match = bracketRegex.exec(linkSection)) !== null) {
    const title = match[1] || '外部リンク';
    const url = match[2];
    results.push({ title, url });
  }

  return results;
}
