import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,relative} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const files=['index.html','styles.css','app.js','appearance.js','appearance.css','event-details.js','event-photos.js','design-review.js','design-review.css','updates.js','calendar-data.js','december-base.js','icons.js','reminders.js','manifest.webmanifest','sw.js'];
async function collect(directory){for(const entry of await readdir(directory,{withFileTypes:true})){const path=resolve(directory,entry.name);if(entry.isDirectory())await collect(path);else if(!entry.name.endsWith('.txt'))files.push(relative(root,path));}}
await collect(resolve(root,'assets'));files.sort();
const hash=createHash('sha256');for(const file of files)hash.update(await readFile(resolve(root,file)));
await writeFile(resolve(root,'cache-files.js'),`self.HAPPENING_VERSION=${JSON.stringify('wh-calendar-'+hash.digest('hex').slice(0,16))};\nself.HAPPENING_FILES=${JSON.stringify(['./',...files.map(file=>'./'+file),'./cache-files.js'])};\n`);
console.log(`Prepared ${files.length} offline files.`);
