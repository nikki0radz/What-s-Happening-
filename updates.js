import {esc} from './icons.js';

const supported=typeof window.AndroidBridge?.getUpdateStatus==='function';
const version='0.4.0';
function state(){try{return JSON.parse(AndroidBridge.getUpdateStatus());}catch{return {};}}
function checkedAt(value){return value?`Last checked ${new Date(value).toLocaleString(undefined,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}.`:'';}
function contents(){
  if(!supported)return `<h3>Android app ${version}</h3><p>Download the latest app. Future versions check for updates automatically when opened.</p><a class="primary-button" href="./downloads/Whats-Happening-${version}.apk" download>Download Android app</a>`;
  const value=state();
  const message=value.checking?'Checking for updates…':value.available?`Version ${value.latestVersion} is ready.`:value.status==='current'?'You’re up to date.':value.status==='error'?'Couldn’t check. Connect to the internet and try again.':value.status==='unsupported'?'The latest update needs a newer Android version.':'Checks automatically when you open the app.';
  return `<h3>App updates</h3><p class="update-version">Installed version ${esc(value.installedVersion||version)}</p><p role="status">${esc(message)}</p>${value.available&&value.releaseNotes?`<p class="update-release-notes">${esc(value.releaseNotes)}</p>`:''}<div class="update-buttons">${value.available?'<button class="primary-button" data-update-action="download">Download update</button>':''}<button class="secondary-button" data-update-action="check" ${value.checking?'disabled':''}>${value.checking?'Checking…':'Check for updates'}</button></div><small>${esc(checkedAt(value.lastChecked))} ${value.available?'Download the APK, then approve the update in Android.':''}</small>`;
}
export function updatePanel(){return `<section class="update-panel" data-update-panel>${contents()}</section>`;}
function renderUpdates(){
  if(window.DesignReview?.active)return;
  for(const panel of document.querySelectorAll('[data-update-panel]'))panel.innerHTML=contents();
  if(!supported)return;
  const value=state();let banner=document.querySelector('#app-update-banner');
  if(value.available&&!banner){banner=document.createElement('section');banner.id='app-update-banner';banner.className='app-update-banner';banner.setAttribute('aria-label','App update available');document.querySelector('.app-header').after(banner);}
  if(banner){banner.hidden=!value.available;if(value.available)banner.innerHTML=`<div><strong>An update is ready.</strong><p>Version ${esc(value.latestVersion)} · yours is ${esc(value.installedVersion)}</p></div><button class="primary-button" data-update-action="download">Download update</button>`;}
}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-update-action]');if(!button||!supported)return;
  if(button.dataset.updateAction==='check')AndroidBridge.checkForUpdates();
  if(button.dataset.updateAction==='download')AndroidBridge.downloadUpdate();
});
document.addEventListener('designmodechange',event=>{if(!event.detail.enabled)renderUpdates();});
window.onNativeUpdate=renderUpdates;
renderUpdates();
