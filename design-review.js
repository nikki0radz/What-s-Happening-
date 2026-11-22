import {esc} from './icons.js';

const KEY='wh-design-comments-v1';
const SCHEMA='whats-happening.design-review/v1';
let notes=[];
try{const stored=JSON.parse(localStorage.getItem(KEY));if(Array.isArray(stored))notes=stored.filter(note=>note?.id&&typeof note.comment==='string'&&note.target&&note.context);}catch{}
let enabled=false,selected=null,editing=null,returnFocus=null;
const host=document.createElement('div');host.id='design-review';
const root=host.attachShadow({mode:'open'});
root.innerHTML=`<link rel="stylesheet" href="./design-review.css">
  <section class="toolbar" aria-label="Design review">
    <div class="bar"><label class="toggle"><input id="mode" type="checkbox" role="switch" aria-label="Design mode"><span class="track"></span><strong>Design mode</strong></label><button id="review" class="quiet">Notes <span id="count">0</span></button><button id="export">Export JSON</button></div>
    <p id="hint" class="hint" hidden>Tap anything to comment. Scroll to explore.</p>
    <section id="notes-panel" aria-label="Your design comments" hidden><div class="panel-title"><h2>Your notes</h2><button id="hide-notes" class="quiet" aria-label="Close notes">Close</button></div><p class="help">Saved on this device. Export them when you’re ready.</p><div id="notes-list"></div></section>
    <p id="status" role="status" aria-live="polite"></p>
  </section>
  <div id="selection" aria-hidden="true" hidden></div>
  <dialog id="comment-dialog" aria-labelledby="comment-title"><form id="comment-form"><h2 id="comment-title">Leave a design note</h2><p id="target-label" class="target"></p><label class="comment-label" for="comment">What would you change?</label><textarea id="comment" rows="5" maxlength="4000" placeholder="e.g. Make this title bigger and centre it." required></textarea><p id="form-error" role="alert"></p><div class="actions"><button type="button" id="cancel" class="quiet">Cancel</button><button type="submit">Save comment</button></div></form></dialog>`;
document.body.prepend(host);
const $=selector=>root.querySelector(selector);
const editor=$('#comment-dialog'),field=$('#comment'),ring=$('#selection');

function persist(next){try{localStorage.setItem(KEY,JSON.stringify(next));notes=next;renderNotes();return true;}catch{announce('Couldn’t save notes. Free some device storage, then try again.');return false;}}
function announce(message){$('#status').textContent=message;}
function renderNotes(){
  $('#count').textContent=notes.length;
  $('#export').disabled=!notes.length;
  $('#notes-list').innerHTML=notes.length?notes.map((note,index)=>`<article class="note"><div class="note-top"><strong>Note ${index+1}</strong><span>${esc(note.context.pageTitle||note.context.hash||'Today')}</span></div><p class="target">${esc(note.target.text||note.target.label||note.target.tag)}</p><p class="note-comment">${esc(note.comment)}</p><div class="note-actions"><button class="quiet" data-edit="${esc(note.id)}">Edit</button><button class="quiet" data-delete="${esc(note.id)}" aria-label="Delete note ${index+1}">Delete</button></div></article>`).join(''):'<p class="empty">No notes yet. Turn on Design mode, then tap something you’d like to change.</p>';
}
function setMode(value){
  enabled=value;$('#mode').checked=value;$('#hint').hidden=!value;
  document.documentElement.classList.toggle('design-mode',value);
  hideRing();announce(value?'Design mode on. Page controls are paused.':'Design mode off. Page controls work again.');
  document.dispatchEvent(new CustomEvent('designmodechange',{detail:{enabled:value}}));
}
function selectorFor(element){
  const parts=[];
  for(let node=element;node&&node!==document.body;node=node.parentElement){
    if(node.id){parts.unshift('#'+CSS.escape(node.id));break;}
    let part=node.localName;
    for(const key of ['data-action','data-id','data-date','data-tab'])if(node.hasAttribute(key))part+=`[${key}=${JSON.stringify(node.getAttribute(key))}]`;
    const classes=[...node.classList].filter(name=>!['active','selected','is-saved','saved'].includes(name));
    if(classes.length)part+='.'+classes.slice(0,3).map(name=>CSS.escape(name)).join('.');
    if(node.parentElement){const siblings=[...node.parentElement.children].filter(item=>item.localName===node.localName);if(siblings.length>1)part+=`:nth-of-type(${siblings.indexOf(node)+1})`;}
    parts.unshift(part);
  }
  return parts.join(' > ');
}
function targetFor(element){
  const style=getComputedStyle(element),rect=element.getBoundingClientRect();
  const action=element.closest('[data-action],[data-tab]');
  return {
    selector:selectorFor(element),tag:element.localName,
    text:(element.innerText||element.textContent||'').trim().replace(/\s+/g,' ').slice(0,600),
    label:element.getAttribute('aria-label')||element.getAttribute('alt')||element.getAttribute('placeholder')||'',
    image:element instanceof HTMLImageElement?element.getAttribute('src'):null,
    action:action?{...action.dataset}:null,
    styles:Object.fromEntries(['fontFamily','fontSize','fontWeight','lineHeight','textAlign','color','backgroundColor','borderRadius','padding','display'].map(key=>[key,style[key]])),
    bounds:{x:Math.round(rect.x),y:Math.round(rect.y),width:Math.round(rect.width),height:Math.round(rect.height)}
  };
}
function context(){return {
  url:location.origin+location.pathname+location.search+location.hash,hash:location.hash||'#today',
  pageTitle:document.querySelector('#main h1')?.textContent?.trim()||'',
  openDialogs:[...document.querySelectorAll('dialog[open]')].map(dialog=>({id:dialog.id,eventId:dialog.dataset.id||null,date:dialog.dataset.date||null,title:dialog.querySelector('h2')?.textContent?.trim()||''})),
  featuredEvent:document.querySelector('.event-picker .active')?.dataset.id||null,
  calendarMonth:document.querySelector('.month-navigation h2')?.textContent||null,
  viewport:{width:innerWidth,height:innerHeight,pixelRatio:devicePixelRatio},
  scroll:{x:Math.round(scrollX),y:Math.round(scrollY)},
  platform:typeof window.AndroidBridge==='object'?'android':'web',appVersion:'0.3.0'
};}
function candidate(target){
  if(!(target instanceof Element))return null;
  let element=target;
  if(element.closest('svg'))element=element.closest('button,a')||element.closest('svg');
  if(element===document.documentElement||element===document.body||element===host)return null;
  return element;
}
function showRing(element){
  const rect=element.getBoundingClientRect();
  if(!rect.width||!rect.height){hideRing();return;}
  Object.assign(ring.style,{left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`});ring.hidden=false;
}
function hideRing(){ring.hidden=true;}
function openEditor(target){
  selected={target:targetFor(target),context:context()};editing=null;field.value='';returnFocus=target;
  $('#target-label').textContent=selected.target.text||selected.target.label||selected.target.tag;
  $('#form-error').textContent='';hideRing();editor.showModal();field.focus();
}
function closeEditor(){editor.close();selected=null;editing=null;returnFocus?.focus?.({preventScroll:true});}
function owned(event){return event.composedPath().includes(host);}
function intercept(event){
  if(!enabled||owned(event))return;
  event.stopImmediatePropagation();
  if(event.type==='click'||event.type==='auxclick'||event.type==='contextmenu'){
    event.preventDefault();if(event.type!=='click')return;
    const target=candidate(event.target);if(target)openEditor(target);
  }
}
// Capture on window before app handlers; no transparent overlay hides the actual target.
for(const type of ['click','auxclick','dblclick','contextmenu','input','change','submit'])window.addEventListener(type,intercept,true);
window.addEventListener('pointerdown',event=>{if(enabled&&!owned(event)){event.stopImmediatePropagation();if(event.pointerType==='mouse')event.preventDefault();}},true);
window.addEventListener('focusin',event=>{if(enabled&&!owned(event)&&event.target.matches('input,textarea,select,[contenteditable]'))event.target.blur();},true);
window.addEventListener('keydown',event=>{
  if(!enabled||owned(event)||event.key==='Tab')return;
  if(event.ctrlKey||event.metaKey||event.altKey)return;
  if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(event.key))return;
  event.stopImmediatePropagation();event.preventDefault();
  if(event.key==='Escape'){setMode(false);return;}
  if(event.key==='Enter'||event.key===' '){const target=candidate(event.target);if(target)openEditor(target);}
},true);
window.addEventListener('pointermove',event=>{if(!enabled||editor.open||owned(event)){hideRing();return;}const target=candidate(event.target);if(target)showRing(target);},{passive:true});
window.addEventListener('scroll',hideRing,true);window.addEventListener('resize',hideRing);
$('#mode').addEventListener('change',event=>setMode(event.target.checked));
$('#review').addEventListener('click',()=>{$('#notes-panel').hidden=!$('#notes-panel').hidden;hideRing();});
$('#hide-notes').addEventListener('click',()=>$('#notes-panel').hidden=true);
$('#cancel').addEventListener('click',closeEditor);
editor.addEventListener('cancel',event=>{event.preventDefault();closeEditor();});
$('#comment-form').addEventListener('submit',event=>{
  event.preventDefault();const comment=field.value.trim();
  if(!comment){$('#form-error').textContent='Write a comment first.';field.focus();return;}
  const now=new Date().toISOString();
  const next=editing?notes.map(note=>note.id===editing?{...note,comment,updatedAt:now}:note):[...notes,{id:crypto.randomUUID(),comment,createdAt:now,...selected}];
  if(!persist(next)){$('#form-error').textContent='Couldn’t save. Keep this open and try again.';return;}
  closeEditor();announce('Comment saved. Tap another element to add a note.');
});
$('#notes-list').addEventListener('click',event=>{
  const edit=event.target.closest('[data-edit]'),remove=event.target.closest('[data-delete]');
  if(remove){if(persist(notes.filter(note=>note.id!==remove.dataset.delete)))announce('Comment deleted.');return;}
  if(edit){const note=notes.find(item=>item.id===edit.dataset.edit);if(!note)return;editing=note.id;selected=note;field.value=note.comment;returnFocus=edit;$('#target-label').textContent=note.target.text||note.target.label||note.target.tag;$('#form-error').textContent='';editor.showModal();field.focus();}
});
$('#export').addEventListener('click',()=>{
  const content=JSON.stringify({schema:SCHEMA,app:'What’s Happening?',exportedAt:new Date().toISOString(),commentCount:notes.length,comments:notes},null,2);
  const filename=`whats-happening-design-notes-${new Date().toISOString().slice(0,10)}.json`;
  if(typeof window.AndroidBridge?.exportDesignComments==='function'){
    try{AndroidBridge.exportDesignComments(content,filename);announce('Choose where to save your JSON file.');}catch{announce('Couldn’t open the file saver. Please try again.');}return;
  }
  const url=URL.createObjectURL(new Blob([content],{type:'application/json;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=filename;root.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  announce('JSON downloaded. Upload it in our chat when you’re ready.');
});
// Keep the toolbar usable inside the browser's top modal layer, too.
function dock(){const dialog=[...document.querySelectorAll('dialog[open]')].at(-1);const destination=dialog||document.body;if(host.parentElement!==destination)destination.prepend(host);host.toggleAttribute('in-dialog',Boolean(dialog));}
new MutationObserver(dock).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
window.DesignReview={get active(){return enabled;},handleBack(){if(editor.open){closeEditor();return true;}if(!$('#notes-panel').hidden){$('#notes-panel').hidden=true;return true;}if(enabled){setMode(false);return true;}return false;}};
renderNotes();dock();
