import test from 'node:test';
import assert from 'node:assert/strict';
import {days} from '../calendar-data.js';
import {factsByDate} from '../daily-facts.js';

let instance=0;
const fresh=()=>import(`../daily-facts.js?test=${++instance}`);

test('every supported date has two sourced facts linked to events on that date',()=>{
  assert.equal(Object.keys(factsByDate).length,days.length);
  for(const day of days){
    const facts=factsByDate[day.date];
    assert.equal(facts.length,2,day.date);
    for(const fact of facts){
      assert.ok(day.events.some(event=>event.id===fact.eventId),`${day.date}: ${fact.eventId}`);
      assert.equal(new URL(fact.sourceUrl).protocol,'https:');
      assert.ok(fact.sourceLabel.length>3);
      assert.ok(fact.text.length>60&&fact.text.length<450);
    }
  }
});

test('saved daily choice is restored and stays fixed during the page session',async()=>{
  const {factOfDay,factsByDate}=await fresh();
  const calls=[];
  const storage={getItem(key){calls.push(key);return '1';},setItem(){throw Error('should not rewrite a valid selection');}};
  const first=factOfDay(days[0],storage);
  assert.equal(first,factsByDate[days[0].date][1]);
  assert.equal(factOfDay(days[0],null),first);
  assert.deepEqual(calls,['wh-fact-'+days[0].date]);
});

test('missing or corrupt choice is chosen once, persisted, and survives a fresh session',async()=>{
  const {factOfDay}=await fresh();
  const data=new Map([['wh-fact-'+days[1].date,'999']]);
  const storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
  const first=factOfDay(days[1],storage);
  assert.match(data.get('wh-fact-'+days[1].date),/^[01]$/);
  const later=await fresh();
  assert.deepEqual(later.factOfDay(days[1],storage),first);
});

test('blocked storage and unsupported dates do not break the day page',async()=>{
  const {factOfDay}=await fresh();
  const blocked={getItem(){throw Error('blocked');}};
  const fact=factOfDay(days[2],blocked);
  assert.ok(fact?.text);
  assert.equal(factOfDay(days[2],blocked),fact);
  assert.equal(factOfDay('2027-01-01',blocked),null);
  assert.equal(factOfDay(null,blocked),null);
});

test('a throwing localStorage getter is caught',async()=>{
  const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw Error('privacy setting');}});
  try{const {factOfDay}=await fresh();assert.ok(factOfDay(days[3])?.text);}
  finally{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;}
});
