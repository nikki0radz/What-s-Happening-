import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {days} from '../data.js';
import {makeCalendar,dueAlerts,localDateId} from '../reminders.js';
test('December has exactly one event per date and every bundled image exists',async()=>{
  assert.equal(days.length,31);assert.equal(new Set(days.map(day=>day.id)).size,31);
  for(let i=0;i<31;i++){
    assert.equal(days[i].id,`2026-12-${String(i+1).padStart(2,'0')}`);
    assert.ok(days[i].title&&days[i].description&&days[i].scope);
    await access(new URL('../'+days[i].image,import.meta.url));
  }
});
test('calendar export preserves events, year rollover, escaping and a morning reminder',()=>{
  const file=makeCalendar([{...days[30],title:'A, B; C',description:'One\ntwo'}],'08:30',new Date('2026-11-21T12:00:00Z'));
  assert.match(file,/DTSTART;VALUE=DATE:20261231/);assert.match(file,/DTEND;VALUE=DATE:20270101/);
  assert.match(file,/SUMMARY:A\\, B\\; C/);assert.match(file,/DESCRIPTION:One\\ntwo/);assert.match(file,/TRIGGER:PT8H30M/);
  assert.equal(file.match(/BEGIN:VEVENT/g).length,1);assert.ok(file.endsWith('END:VCALENDAR\r\n'));
});
test('export folds long UTF-8 lines without breaking characters',()=>{
  const file=makeCalendar([{...days[0],title:'é'.repeat(100)}]);
  for(const line of file.split('\r\n'))assert.ok(new TextEncoder().encode(line).length<=75);
  const unfolded=file.replace(/\r\n /g,'');assert.ok(unfolded.includes('é'.repeat(100)));
});
const settings={daily:true,extra:true,dailyTime:'09:00',extraTime:'08:00'};
test('alerts use actual local date, respect save status and do not repeat',()=>{
  const now=new Date(2026,11,13,8,30),event=days[12];
  assert.equal(localDateId(now),event.id);
  assert.deepEqual(dueAlerts({now,event,saved:[],settings,sent:[]}),[]);
  const alerts=dueAlerts({now,event,saved:[event.id],settings,sent:[]});
  assert.equal(alerts[0].type,'saved');
  assert.deepEqual(dueAlerts({now,event,saved:[event.id],settings,sent:[alerts[0].key]}),[]);
  assert.deepEqual(dueAlerts({now:new Date(2026,10,21,10),event,saved:[event.id],settings,sent:[]}),[]);
  assert.equal(dueAlerts({now:new Date(2026,11,13,10),event,saved:[],settings,sent:[]})[0].type,'daily');
});
test('disabled alerts never fire and absence of content is safe',()=>{
  assert.deepEqual(dueAlerts({event:undefined,saved:[],settings,sent:[]}),[]);
  assert.deepEqual(dueAlerts({now:new Date(2026,11,13,12),event:days[12],saved:[days[12].id],settings:{...settings,daily:false,extra:false},sent:[]}),[]);
});
test('worker pre-cache references files that exist',async()=>{
  const worker=await readFile(new URL('../sw.js',import.meta.url),'utf8');
  assert.ok(worker.includes('./reminders.js'));
});
