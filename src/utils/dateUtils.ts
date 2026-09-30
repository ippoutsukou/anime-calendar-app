/**
 * Date and time utilities for anime broadcast scheduling
 */

const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土'];

export function parseSyoboiDate(dateStr: string): Date {
  // Expected: "2026-09-30 23:30:00"
  if (!dateStr) return new Date();
  const [datePart, timePart] = dateStr.split(' ');
  const [y, m, d] = (datePart || '').split('-').map(Number);
  const [hh, mm, ss] = (timePart || '00:00:00').split(':').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, ss || 0);
}

/**
 * Format date in Japanese style: "9月30日(水)"
 */
export function formatJapaneseDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = WEEKDAYS_JA[date.getDay()];
  return `${month}月${day}日(${dayOfWeek})`;
}

/**
 * Format broadcast time range: "23:30 - 24:00"
 * Also supports 24+ midnight format (e.g. 25:30)
 */
export function formatTimeRange(startDate: Date, endDate: Date, useMidnightFormat = false): string {
  const pad = (n: number) => n.toString().padStart(2, '0');

  let startHours = startDate.getHours();
  const startMins = pad(startDate.getMinutes());

  let endHours = endDate.getHours();
  const endMins = pad(endDate.getMinutes());

  if (useMidnightFormat && startHours < 5) {
    startHours += 24;
  }
  if (useMidnightFormat && endHours < 5) {
    endHours += 24;
  }

  return `${pad(startHours)}:${startMins} - ${pad(endHours)}:${endMins}`;
}

/**
 * Generate Google Calendar URL for one-click add
 */
export function createGoogleCalendarUrl(
  title: string,
  channel: string,
  startDate: Date,
  endDate: Date,
  details: string
): string {
  const formatUtc = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const text = encodeURIComponent(`【アニメ】${title} (${channel})`);
  const dates = `${formatUtc(startDate)}/${formatUtc(endDate)}`;
  const desc = encodeURIComponent(`${channel}にて放送\n\n${details}\n\n(しょぼいカレンダー連携)`);
  const location = encodeURIComponent(channel);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${desc}&location=${location}`;
}

/**
 * Export .ics file for Apple Calendar / Outlook
 */
export function downloadIcsFile(
  title: string,
  channel: string,
  startDate: Date,
  endDate: Date,
  details: string
) {
  const formatUtc = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Anime Nav//Syoboi Calendar//JA',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `SUMMARY:【アニメ】${title} (${channel})`,
    `DESCRIPTION:${details.replace(/\n/g, '\\n')}`,
    `LOCATION:${channel}`,
    `DTSTART:${formatUtc(startDate)}`,
    `DTEND:${formatUtc(endDate)}`,
    `DTSTAMP:${formatUtc(new Date())}`,
    `UID:animenav-${Date.now()}@syoboi.local`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[/\\?%*:|"<>]/g, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Helper to check if a date is today
 */
export function isToday(d: Date): boolean {
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/**
 * Helper to check if a date is tomorrow
 */
export function isTomorrow(d: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate()
  );
}
