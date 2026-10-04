import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {FOREST_STORY_LOCATION_CONTRACT as contract} from '../src/rendering/forest-gal-story-location-contract.js';
import {FOREST_GAL_STORY_LOCATIONS as assets} from '../src/rendering/forest-gal-assets.js';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export function forestStoryLocationSourceErrors(bytes){return sha(bytes)===contract.sourceContentSha256?[]:['Story location source content SHA256 drift'];}
export function forestStoryLocationImageErrors(asset,bytes){
 const errors=[];
 if(!bytes)return [`Missing story location asset: ${asset.file}`];
 if(bytes.length!==asset.bytes)errors.push(`Story location byte size drift: ${asset.file}`);
 if(sha(bytes)!==asset.sha256)errors.push(`Story location SHA256 drift: ${asset.file}`);
 let dims=null;
 if(bytes.length>=30&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'){
  for(let i=12;i+8<=bytes.length;){const size=bytes.readUInt32LE(i+4),start=i+8,type=bytes.toString('ascii',i,i+4);if(start+size>bytes.length)break;
   if(type==='VP8 '&&size>=10&&bytes.readUIntLE(start+3,3)===0x2a019d)dims=[bytes.readUInt16LE(start+6)&0x3fff,bytes.readUInt16LE(start+8)&0x3fff];
   if(type==='VP8X'&&size>=10)dims=[1+bytes.readUIntLE(start+4,3),1+bytes.readUIntLE(start+7,3)];
   if(type==='VP8L'&&size>=5&&bytes[start]===0x2f){const v=bytes.readUInt32LE(start+1);dims=[(v&0x3fff)+1,((v>>>14)&0x3fff)+1];}
   if(dims)break;i=start+size+(size&1);
  }
 }
 if(!dims||dims[0]!==asset.width||dims[1]!==asset.height)errors.push(`Story location dimensions/container drift: ${asset.file}`);
 return errors;
}
export async function validateStoryLocationAssets(root,{built=false}={}){
 const errors=forestStoryLocationSourceErrors(await readFile(join(root,'src/campaigns/b/story/content.js')));
 for(const asset of Object.values(assets))errors.push(...forestStoryLocationImageErrors(asset,await readFile(join(root,built?'':'public',asset.file)).catch(()=>null)));
 return {errors,storyLocationAssets:Object.keys(assets).length,storyLocationBytes:Object.values(assets).reduce((n,a)=>n+a.bytes,0)};
}
