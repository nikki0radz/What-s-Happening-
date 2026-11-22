import {esc,icon} from './icons.js';
import {dateLabel} from './calendar-data.js';

const key='wh-appearance';
const dateNames=['Sticker','Ticket','Desk calendar','Postmark','Luggage tag','Circle','Ribbon tab','Frosted glass','Pennant','Minimal'];
const countNames=['Solid pill','Outline','Glass','Stamp','Corner flag','Square','Dot','Ticket','Split label','Top tab'];
let preferences={dateBadge:1,eventCount:1};
try{const value=JSON.parse(localStorage.getItem(key));for(const name of Object.keys(preferences))if(Number.isInteger(value?.[name])&&value[name]>=1&&value[name]<=10)preferences[name]=value[name];}catch{}
export function dateBadge(day,style=preferences.dateBadge){return `<div class="date-stamp badge-${style}" aria-label="${dateLabel(day)}"><strong>${day.day}</strong><span>${dateLabel(day,{month:'short'})}</span></div>`;}
export function countBadge(count,style=preferences.eventCount){return `<span class="cell-total count-${style}" aria-label="${count} events"><span class="count-number">${count}</span><span class="count-word" aria-hidden="true">events</span></span>`;}
export const appearance=()=>({...preferences});
const dialog=document.createElement('dialog');dialog.id='appearance-dialog';dialog.setAttribute('aria-labelledby','appearance-title');document.body.append(dialog);
function render(){
  const position=dialog.scrollTop;
  dialog.innerHTML=`<div class="dialog-top"><h2 id="appearance-title">Design options</h2><button class="icon-button dialog-close" data-appearance-close aria-label="Close design options">${icon('close')}</button></div><div class="dialog-body appearance-body"><p>Tap an option to try it in the app. Your choices are saved on this device.</p><section class="appearance-section"><h3>Date badge</h3><p>Ten ways to dress up the date.</p><div class="appearance-grid">${dateNames.map((name,index)=>`<button class="appearance-choice ${preferences.dateBadge===index+1?'chosen':''}" data-appearance-key="dateBadge" data-appearance-value="${index+1}" aria-pressed="${preferences.dateBadge===index+1}"><span class="appearance-preview date-preview">${dateBadge({date:'2026-11-22',day:22},index+1)}</span><span class="appearance-label">${index+1}. ${esc(name)}</span>${preferences.dateBadge===index+1?'<span class="choice-selected">Selected</span>':''}</button>`).join('')}</div></section><section class="appearance-section"><h3>Calendar event count</h3><p>Always in the top right, clear of the event name.</p><div class="appearance-grid">${countNames.map((name,index)=>`<button class="appearance-choice ${preferences.eventCount===index+1?'chosen':''}" data-appearance-key="eventCount" data-appearance-value="${index+1}" aria-pressed="${preferences.eventCount===index+1}"><span class="appearance-preview count-preview"><span class="preview-cell-date">22</span>${countBadge(4,index+1)}<span class="preview-cell-title">Stir-Up Sunday</span></span><span class="appearance-label">${index+1}. ${esc(name)}</span>${preferences.eventCount===index+1?'<span class="choice-selected">Selected</span>':''}</button>`).join('')}</div></section></div>`;
  dialog.scrollTop=position;
}
export function openAppearance(){render();if(!dialog.open)dialog.showModal();}
export function closeAppearance(){if(dialog.open){dialog.close();return true;}return false;}
document.addEventListener('click',event=>{
  if(event.target.closest('[data-appearance-close]')){dialog.close();return;}
  const button=event.target.closest('[data-appearance-key]');if(!button)return;
  const name=button.dataset.appearanceKey,value=Number(button.dataset.appearanceValue);if(!Object.hasOwn(preferences,name)||value<1||value>10)return;
  const next={...preferences,[name]:value};
  try{localStorage.setItem(key,JSON.stringify(next));preferences=next;}catch{return;}
  render();dialog.querySelector(`[data-appearance-key="${name}"][data-appearance-value="${value}"]`)?.focus({preventScroll:true});
  document.dispatchEvent(new CustomEvent('appearancechange'));
});
