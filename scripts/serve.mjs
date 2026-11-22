import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root = resolve(import.meta.dirname,'..');
const args=process.argv.slice(2);
const flag=name=>args[args.indexOf(name)+1];
const port=Number(args.includes('--port')?flag('--port'):process.env.PORT)||3000;
const host=args.includes('--host')?flag('--host'):'0.0.0.0';
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.apk':'application/vnd.android.package-archive','.woff2':'font/woff2','.ttf':'font/ttf'};
createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname.split('/').some(part=>part.startsWith('.')))throw new Error('private');
    let path=resolve(root,'.'+pathname);
    if(path!==root&&!path.startsWith(root+sep))throw new Error('invalid path');
    if((await stat(path)).isDirectory())path=resolve(path,'index.html');
    const body=await readFile(path);
    res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    res.end(body);
  } catch {res.writeHead(404);res.end('Not found');}
}).listen(port,host,()=>console.log('What’s Happening preview is ready.'));
