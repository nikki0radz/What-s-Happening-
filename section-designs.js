const key='wh-section-designs-v1';
const defaults={join:1,also:1,upcoming:1};
let preferences={...defaults};
try{const stored=JSON.parse(localStorage.getItem(key));for(const name of Object.keys(defaults))if(Number.isInteger(stored?.[name])&&stored[name]>=1&&stored[name]<=10)preferences[name]=stored[name];}catch{}

export const sectionStyle=name=>preferences[name]||1;
export function sectionChoices(name,label){
  return `<fieldset class="section-choices"><legend>${label} · try a look</legend><div class="style-numbers">${Array.from({length:10},(_,index)=>{const value=index+1;return `<button type="button" data-style-choice="${name}" data-style-value="${value}" aria-label="${label}, option ${value}" aria-pressed="${sectionStyle(name)===value}">${value}</button>`;}).join('')}</div></fieldset>`;
}
export function chooseSectionStyle(name,value){
  if(!Object.hasOwn(defaults,name)||!Number.isInteger(value)||value<1||value>10)return false;
  const next={...preferences,[name]:value};
  try{localStorage.setItem(key,JSON.stringify(next));}catch{return false;}
  preferences=next;
  for(const section of document.querySelectorAll('[data-style-section]'))section.dataset.style=sectionStyle(section.dataset.styleSection);
  for(const button of document.querySelectorAll('[data-style-choice]'))button.setAttribute('aria-pressed',String(sectionStyle(button.dataset.styleChoice)===Number(button.dataset.styleValue)));
  return true;
}
