import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { spawn } from 'node:child_process';
const base=resolve(import.meta.dirname,'../dist');
const port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.pdf':'application/pdf','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};
createServer(async(req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 let path=resolve(base,'.'+pathname);
 if(path!==base&&!path.startsWith(base+sep)){res.writeHead(403).end();return;}
 try{if((await stat(path)).isDirectory())path=resolve(path,'index.html');}catch{res.writeHead(404,{'Content-Type':mime['.html']});res.end(await readFile(resolve(base,'404.html')));return;}
 const data=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(data);
 }catch{res.writeHead(400).end('Bad request');}}).listen(port,'127.0.0.1',()=>{
 const url=`http://127.0.0.1:${port}/es/`;console.log(`Local: ${url}`);
 if(process.argv.includes('--open'))spawn('rundll32.exe',['url.dll,FileProtocolHandler',url],{windowsHide:true,stdio:'ignore'}).unref();
});
