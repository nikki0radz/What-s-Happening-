export function localDateId(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function dueAlerts({now = new Date(), day, saved, settings, sent}) {
  if (!day) return [];
  const date = localDateId(now);
  if (date !== day.date) return [];
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const daily={type:'daily',key:`${date}:daily`,enabled:settings.daily,time:settings.dailyTime};
  const extra=day.events.filter(event=>saved.includes(event.id)).map(event=>({type:'saved',id:event.id,key:`${date}:saved:${event.id}`,enabled:settings.extra,time:settings.extraTime}));
  return [daily,...extra].filter(item=>item.enabled&&time>=item.time&&!sent.includes(item.key));
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
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Whats Happening//Calendar//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
  for (const event of events) {
    const date=event.date||event.id;
    const next = new Date(`${date}T12:00:00Z`); next.setUTCDate(next.getUTCDate()+1);
    lines.push('BEGIN:VEVENT',`UID:${event.id}@whats-happening.local`,`DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${date.replaceAll('-','')}`,`DTEND;VALUE=DATE:${next.toISOString().slice(0,10).replaceAll('-','')}`,
      `SUMMARY:${escapeICS(event.title)}`,`DESCRIPTION:${escapeICS(event.description+'\n'+event.idea)}`,
      `URL:${event.source}`,'BEGIN:VALARM','ACTION:DISPLAY',`DESCRIPTION:${escapeICS(event.title)}`,
      `TRIGGER:PT${hours}H${minutes}M`,'END:VALARM','END:VEVENT');
  }
  lines.push('END:VCALENDAR'); return lines.map(foldLine).join('\r\n')+'\r\n';
}
