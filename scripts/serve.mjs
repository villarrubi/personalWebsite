import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
const base=resolve(import.meta.dirname,'../dist');
const port=Number(process.env.PORT||4173);
const url=`http://127.0.0.1:${port}/en/`;
const shouldOpen=process.argv.includes('--open');
function openBrowser(){
 const previewUrl=url;
 const windowsBrowser=process.platform==='win32'?[
  `${process.env.PROGRAMFILES}/Google/Chrome/Application/chrome.exe`,
  `${process.env['PROGRAMFILES(X86)']}/Google/Chrome/Application/chrome.exe`,
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  `${process.env['PROGRAMFILES(X86)']}/Microsoft/Edge/Application/msedge.exe`,
  `${process.env.PROGRAMFILES}/Microsoft/Edge/Application/msedge.exe`,
 ].find(path=>existsSync(path)):null;
 const command=windowsBrowser||(process.platform==='win32'?'rundll32.exe':process.platform==='darwin'?'open':'xdg-open');
 const args=process.platform==='win32'&&!windowsBrowser?['url.dll,FileProtocolHandler',previewUrl]:[previewUrl];
 console.log(`Abriendo navegador: ${previewUrl}`);
 const child=spawn(command,args,{windowsHide:true,stdio:'ignore',detached:true});
 child.on('error',error=>console.error(`No se pudo abrir el navegador: ${error.message}\nAbre esta direccion: ${previewUrl}`));
 child.unref();
}
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.pdf':'application/pdf','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};
const server=createServer(async(req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 let path=resolve(base,'.'+pathname);
 if(path!==base&&!path.startsWith(base+sep)){res.writeHead(403).end();return;}
 try{if((await stat(path)).isDirectory())path=resolve(path,'index.html');}catch{res.writeHead(404,{'Content-Type':mime['.html']});res.end(await readFile(resolve(base,'404.html')));return;}
 const data=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(data);
 }catch{res.writeHead(400).end('Bad request');}});
server.on('error',async error=>{
 if(error.code==='EADDRINUSE'&&shouldOpen){
  try{
   const response=await fetch(url,{signal:AbortSignal.timeout(3000)});
   const html=await response.text();
   if(response.ok&&html.includes('Alejandro Villarrubia')&&html.includes('/app.js')){
    console.log(`La web ya esta abierta. Reutilizando el servidor: ${url}`);
    openBrowser();
    return;
   }
  }catch{}
 }
 console.error(error.code==='EADDRINUSE'?`El puerto ${port} esta ocupado por otra aplicacion.`:error.message);
 process.exitCode=1;
});
server.listen(port,'127.0.0.1',()=>{
 console.log(`Local: ${url}`);
 if(shouldOpen)openBrowser();
});
