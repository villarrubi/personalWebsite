// Optional asset refresh; the regular website build uses the checked-in bundle.
// Usage: node scripts/prepare-atlas.mjs path/to/mapaCelulas
import {resolve, join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {mkdir, writeFile} from 'node:fs/promises';

const source = process.argv[2];
if (!source) throw new Error('Pass the local Atlas project directory.');
const atlas = resolve(source);
const output = resolve(import.meta.dirname, '../public/assets/atlas');
const {build} = await import(pathToFileURL(join(atlas, 'node_modules/esbuild/lib/main.js')));
await mkdir(output, {recursive:true});
await build({
  stdin:{contents:"export {createCell} from './models';",resolveDir:join(atlas,'src'),loader:'ts'},
  outfile:join(output,'models.js'), bundle:true, format:'esm', minify:true,
  plugins:[{name:'shared-three',setup(builder){
    builder.onResolve({filter:/^three$/},()=>({path:'../vendor/three.module.js',external:true}));
  }}],
  banner:{js:'// Original cell geometry from Alejandro Villarrubia’s Atlas celular.\n// Bundled Three.js helpers: MIT, see ../vendor/THREE-LICENSE.txt.'},
});
await writeFile(join(output,'ATTRIBUTION.txt'),
  'Original procedural cell models by Alejandro Villarrubia, adapted from the local Atlas celular project.\nPrepared with scripts/prepare-atlas.mjs. No remote models or textures.\nBundled Three.js geometry helpers are MIT licensed; see ../vendor/THREE-LICENSE.txt.\nThe portfolio preview shows a simplified interior view; it is not the complete educational application.\n');
console.log('Prepared original Atlas models.');
