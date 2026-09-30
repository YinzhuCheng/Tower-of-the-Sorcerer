import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { within } from './config.mjs';
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.ico':'image/x-icon','.mp3':'audio/mpeg','.ogg':'audio/ogg'};
export function requestPath(url) {
  const path=decodeURIComponent(url.split('?')[0]);
  if(!path.startsWith('/') || path.includes('\\') || path.includes('\0') || path.split('/').includes('..'))throw Error('Invalid resource path');
  return `.${path}`;
}
export async function serve(output, requests) {
  const root=await realpath(output);
  const server=createServer(async(req,res)=>{
    let status=200;
    try {
      if(!['GET','HEAD'].includes(req.method)){status=405;throw Error('Read-only server');}
      let path=within(root,requestPath(req.url));
      if((await stat(path)).isDirectory())path=join(path,'index.html');
      path=await realpath(path);within(root,path);
      const bytes=await readFile(path);
      res.writeHead(200,{'Content-Type':MIME[extname(path)]??'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
      res.end(req.method==='HEAD'?undefined:bytes);
    }catch(e){if(status===200)status=e.code==='ENOENT'?404:403;res.writeHead(status,{'Content-Type':'text/plain'});res.end(`Resource unavailable (${status})`);}
    requests.push({method:req.method,url:req.url,status});
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  return {url:`http://127.0.0.1:${server.address().port}`,close:()=>new Promise(resolve=>{server.closeAllConnections();server.close(resolve);})};
}
