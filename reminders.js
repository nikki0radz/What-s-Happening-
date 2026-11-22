export function localDateId(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function dueAlerts({now = new Date(), event, saved, settings, sent}) {
  if (!event) return [];
  const date = localDateId(now);
  if (date !== event.id) return [];
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  return [
    {type:'daily', enabled:settings.daily, time:settings.dailyTime},
    {type:'saved', enabled:settings.extra && saved.includes(event.id), time:settings.extraTime}
  ].filter(item => item.enabled && time >= item.time && !sent.includes(`${date}:${item.type}`))
    .map(item => ({...item,key:`${date}:${item.type}`}));
}
const escapeICS = value => value.replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;');
// Fold by UTF-8 octets (RFC 5545), including non-ASCII event titles.
function foldLine(line) {
  const chunks = []; let chunk = ''; let bytes = 0;
  for (const char of line) {
    const length = new TextEncoder().encode(char).length;
    if (bytes + length > 74) { chunks.push(chunk); chunk = ' '; bytes = 1; }
    chunk += char; bytes += length;
  }
  chunks.push(chunk); return chunks.join('\r\n');
}
export function makeCalendar(events, time = '08:00', now = new Date()) {
  const stamp = now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const [hours,minutes] = time.split(':').map(Number);
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Whats Happening//December Draft//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
  for (const event of events) {
    const next = new Date(`${event.id}T12:00:00Z`); next.setUTCDate(next.getUTCDate()+1);
    lines.push('BEGIN:VEVENT',`UID:${event.id}@whats-happening.local`,`DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${event.id.replaceAll('-','')}`,`DTEND;VALUE=DATE:${next.toISOString().slice(0,10).replaceAll('-','')}`,
      `SUMMARY:${escapeICS(event.title)}`,`DESCRIPTION:${escapeICS(event.description+'\n'+event.idea)}`,
      `URL:${event.source}`,'BEGIN:VALARM','ACTION:DISPLAY',`DESCRIPTION:${escapeICS(event.title)}`,
      `TRIGGER:PT${hours}H${minutes}M`,'END:VALARM','END:VEVENT');
  }
  lines.push('END:VCALENDAR'); return lines.map(foldLine).join('\r\n')+'\r\n';
}
