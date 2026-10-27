import {readdir,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';

export const basePath=(process.env.SITE_BASE_PATH||'').replace(/^\/+|\/+$/g,'');

export async function prepareDeployment(directory){
 if(basePath&&!/^[\w.-]+(?:\/[\w.-]+)*$/.test(basePath))throw new Error('Invalid SITE_BASE_PATH');
 const files=[];
 async function visit(folder){
  for(const file of await readdir(folder,{withFileTypes:true})){
   const path=join(folder,file.name);
   if(file.isDirectory()){if(file.name!=='vendor')await visit(path);continue;}
   if(!/\.(html|css|js)$/.test(file.name))continue;
   const source=await readFile(path,'utf8');
   // Local HTML URLs, CSS imports, runtime asset loads and entrance route checks.
   // Relative module imports and external URLs remain intact.
   const adjusted=basePath?source.replace(/(["'`(])\/(?=assets\/|en\/|es\/|index\.html|[\w-]+\.(?:css|js)(?:["'`)?#]|$)|["'`])/g,`$1/${basePath}/`):source;
   files.push({path,source,adjusted});
  }
 }
 await visit(directory);
 // Version the whole first-party module graph, including lazy imports and CSS
 // imports. Changing only app.js would leave its cached dependencies unchanged.
 files.sort((a,b)=>a.path.localeCompare(b.path));
 const hash=createHash('sha256');
 for(const {adjusted} of files)hash.update(adjusted).update('\0');
 const version=hash.digest('hex').slice(0,12);
 for(const {path,source,adjusted} of files){
  const versioned=adjusted.replace(/(["'(])((?:\.{1,2}\/|\/)[^"'()\s?#]+\.(?:js|css))(?=["')])/g,(match,quote,url)=>
   url.includes('/assets/vendor/')?match:`${quote}${url}?v=${version}`);
  if(versioned!==source)await writeFile(path,versioned);
 }
}
