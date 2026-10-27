import {readdir,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';

export const basePath=(process.env.SITE_BASE_PATH||'').replace(/^\/+|\/+$/g,'');

export async function prepareDeployment(directory){
 if(!basePath)return;
 if(!/^[\w.-]+(?:\/[\w.-]+)*$/.test(basePath))throw new Error('Invalid SITE_BASE_PATH');
 async function visit(folder){
  for(const file of await readdir(folder,{withFileTypes:true})){
   const path=join(folder,file.name);
   if(file.isDirectory()){if(file.name!=='vendor')await visit(path);continue;}
   if(!/\.(html|css|js)$/.test(file.name))continue;
   const source=await readFile(path,'utf8');
   // Local HTML URLs, CSS imports, runtime asset loads and entrance route checks.
   // Relative module imports and external URLs remain intact.
   const adjusted=source.replace(/(["'`(])\/(?=assets\/|en\/|es\/|index\.html|[\w-]+\.(?:css|js)(?:["'`)?#]|$)|["'`])/g,`$1/${basePath}/`);
   if(adjusted!==source)await writeFile(path,adjusted);
  }
 }
 await visit(directory);
}
