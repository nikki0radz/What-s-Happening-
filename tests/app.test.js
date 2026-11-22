import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {events,days,byId,byDate,monthDays} from '../calendar-data.js';
import {eventDetails} from '../event-details.js';
import {createHash} from 'node:crypto';
import {makeCalendar,dueAlerts} from '../reminders.js';

test('every date in November and December 2026 has multiple distinct events and usable assets',async()=>{
  assert.equal(days.length,61);assert.equal(monthDays('2026-11').length,30);assert.equal(monthDays('2026-12').length,31);
  assert.equal(new Set(events.map(event=>event.id)).size,events.length);
  for(const day of days){assert.ok(day.events.length>=2);assert.equal(new Set(day.events.map(event=>event.title)).size,day.events.length);}
  for(const event of events){assert.ok(event.title&&event.description&&event.idea&&event.scope&&event.category);assert.match(event.source,/^https:\/\//);assert.equal(byId(event.id),event);await access(new URL('../'+event.image,import.meta.url));}
});
test('original December bookmarks survive; festivals are only listed once at their start',()=>{
  assert.equal(byId('2026-12-13').title,'National Cocoa Day');
  assert.equal(events.filter(event=>event.title.includes('Hanukkah')).length,1);
  assert.equal(events.find(event=>event.title.includes('Hanukkah')).date,'2026-12-04');
  assert.equal(events.filter(event=>event.title.includes('Kwanzaa')).length,1);
  assert.equal(events.find(event=>event.title==='Loy Krathong').date,'2026-11-24');
});
const settings={daily:true,extra:true,dailyTime:'09:00',extraTime:'08:00'};
test('two saved events on one date get separate reminders without duplicates',()=>{
  const day=byDate('2026-11-22'),saved=day.events.slice(0,2).map(event=>event.id);
  const now=new Date(2026,10,22,8,30),alerts=dueAlerts({now,day,saved,settings,sent:[]});
  assert.equal(alerts.length,2);assert.notEqual(alerts[0].key,alerts[1].key);
  assert.deepEqual(dueAlerts({now,day,saved,settings,sent:alerts.map(alert=>alert.key)}),[]);
  const later=dueAlerts({now:new Date(2026,10,22,10),day,saved,settings,sent:alerts.map(alert=>alert.key)});
  assert.equal(later.length,1);assert.equal(later[0].type,'daily');
});
test('alarms respect actual date and disabled preferences',()=>{
  const day=byDate('2026-12-13');
  assert.deepEqual(dueAlerts({now:new Date(2026,10,22,12),day,saved:[],settings,sent:[]}),[]);
  assert.deepEqual(dueAlerts({now:new Date(2026,11,13,12),day,saved:day.events.map(event=>event.id),settings:{...settings,daily:false,extra:false},sent:[]}),[]);
  assert.deepEqual(dueAlerts({day:undefined,saved:[],settings,sent:[]}),[]);
});
test('calendar export uses event date, separate UIDs and a same-day morning alarm',()=>{
  const items=byDate('2026-12-31').events,file=makeCalendar(items,'08:30');
  assert.equal(file.match(/BEGIN:VEVENT/g).length,items.length);
  assert.equal(file.match(/DTSTART;VALUE=DATE:20261231/g).length,items.length);
  assert.equal(file.match(/DTEND;VALUE=DATE:20270101/g).length,items.length);
  assert.equal(new Set([...file.matchAll(/^UID:(.*)$/gm)].map(match=>match[1])).size,items.length);
  assert.match(file,/TRIGGER:PT8H30M/);
});
test('ICS escaping and line folding preserve long Unicode event titles',()=>{
  const event={...events[0],title:'é'.repeat(100)+', one; two',description:'First\nsecond'};
  const file=makeCalendar([event]);
  for(const line of file.split('\r\n'))assert.ok(new TextEncoder().encode(line).length<=75);
  const unfolded=file.replace(/\r\n /g,'');assert.ok(unfolded.includes('é'.repeat(100)));assert.match(unfolded,/\\, one\\; two/);assert.match(unfolded,/First\\nsecond/);
});
test('offline manifest contains the new catalogue, fonts and every listed file',async()=>{
  const source=await readFile(new URL('../cache-files.js',import.meta.url),'utf8');
  const files=JSON.parse(source.match(/HAPPENING_FILES=(.*);/)[1]);
  assert.ok(files.includes('./calendar-data.js'));assert.ok(files.some(file=>file.endsWith('.ttf')));
  for(const file of files)if(file!=='./')await access(new URL('../'+file,import.meta.url));
});

test('every visible event has an original in-app information sheet and independently sourced date',()=>{
  assert.equal(Object.keys(eventDetails).length,216);
  assert.equal(events.length,215);
  for(const event of events){
    const sheet=event.details;assert.ok(sheet,event.id);assert.ok(sheet.sections.length>=2,event.id);
    assert.ok(sheet.sections.every(section=>section.heading&&section.body.split(/\s+/).length>=35),event.id);
    assert.ok(sheet.activity.text&&sheet.activity.label&&sheet.activity.url,event.id);
    assert.ok(sheet.sources.some(source=>source.dateEvidence),event.id);
    for(const source of sheet.sources){assert.match(source.url,/^https?:\/\//);assert.ok(!source.url.includes('daysoftheyear.com'),event.id);}
  }
  assert.equal(eventDetails['2026-11-27:national-illustration-day'].date,'2027-01-22');
  assert.ok(!byId('2026-11-27:national-illustration-day'));
  assert.equal(byId('2026-12-17:national-re-gifting-day').date,'2026-12-24');
});
test('events use distinct photographs with source and licence credits',async()=>{
  const hashes=new Set(),sources=new Set();
  for(const event of events){
    assert.ok(event.imageAlt&&event.photoCredit?.artist&&event.photoCredit?.license,event.id);
    assert.match(event.photoCredit.sourceUrl,/^https:\/\//);assert.match(event.photoCredit.licenseUrl,/^https?:\/\//);
    assert.ok(!sources.has(event.photoCredit.sourceUrl),'repeated photo source: '+event.id);sources.add(event.photoCredit.sourceUrl);
    const bytes=await readFile(new URL('../'+event.image,import.meta.url)),hash=createHash('sha256').update(bytes).digest('hex');
    assert.ok(!hashes.has(hash),'repeated photo pixels: '+event.id);hashes.add(hash);
  }
});

test('correcting a date preserves its saved ID and schedules the real day',()=>{
  const id='2026-12-17:national-re-gifting-day',event=byId(id);
  assert.equal(event.date,'2026-12-24');
  const oldDate=byDate('2026-12-17'),newDate=byDate('2026-12-24');
  const previous=dueAlerts({now:new Date(2026,11,17,8,30),day:oldDate,saved:[id],settings:{...settings,daily:false},sent:[]});
  assert.deepEqual(previous,[]);
  const correct=dueAlerts({now:new Date(2026,11,24,8,30),day:newDate,saved:[id],settings:{...settings,daily:false},sent:[]});
  assert.equal(correct.length,1);assert.equal(correct[0].id,id);
});
