import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,relative} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const files=['index.html','styles.css','app.js','appearance.js','appearance.css','section-designs.js','section-designs.css','daily-facts.js','event-details.js','event-photos.js','design-review.js','design-review.css','updates.js','calendar-data.js','december-base.js','icons.js','reminders.js','manifest.webmanifest','sw.js'];
const release=JSON.parse(await readFile(resolve(root,'package.json'),'utf8')).version;
// Version browser imports as well as the worker cache: a fresh HTML page must not use old HTTP-cached modules.
for(const file of files.filter(file=>file==='index.html'||(file.endsWith('.js')&&file!=='sw.js'))){
  const path=resolve(root,file),source=await readFile(path,'utf8');
  const stamped=source.replace(/(['"])(\.\/[^'"\s]+\.(?:js|css))(?:\?v=[^'"]*)?\1/g,(_,quote,url)=>`${quote}${url}?v=${release}${quote}`);
  if(stamped!==source)await writeFile(path,stamped);
}
async function collect(directory){for(const entry of await readdir(directory,{withFileTypes:true})){const path=resolve(directory,entry.name);if(entry.isDirectory())await collect(path);else if(!entry.name.endsWith('.txt'))files.push(relative(root,path));}}
await collect(resolve(root,'assets'));files.sort();
const hash=createHash('sha256');
for(const file of files){let bytes=await readFile(resolve(root,file));if(file==='sw.js')bytes=Buffer.from(bytes.toString().replace(/importScripts\('\.\/cache-files\.js(?:\?[^']*)?'\);/,"importScripts('./cache-files.js');"));hash.update(bytes);}
const version='wh-calendar-'+hash.digest('hex').slice(0,16);
const workerPath=resolve(root,'sw.js');
await writeFile(workerPath,(await readFile(workerPath,'utf8')).replace(/importScripts\('\.\/cache-files\.js(?:\?[^']*)?'\);/,`importScripts('./cache-files.js?v=${version}');`));
await writeFile(resolve(root,'cache-files.js'),`self.HAPPENING_VERSION=${JSON.stringify(version)};\nself.HAPPENING_FILES=${JSON.stringify(['./',...files.map(file=>'./'+file),...files.filter(file=>/\.(?:js|css)$/.test(file)&&file!=='sw.js').map(file=>'./'+file+'?v='+release),'./cache-files.js'])};\n`);
console.log(`Prepared ${files.length} offline files.`);
