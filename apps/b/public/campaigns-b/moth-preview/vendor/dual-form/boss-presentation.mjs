/** Isolated presentation candidate. No game-state, dispatch, save or renderer dependency. */
export const BOSS_PRESENTATION_SCHEMA = 'forest-boss-presentation/v1';
export const BOSS_ENTITY_ID = 'b06.sideTender';
export const BOSS_DESIGN_ID = 'BBOSS-001';
export const IDENTITY_REVISION = 2;
export const FORM_IDS = Object.freeze({anthro:'BBOSS-001-ANTHRO',beast:'BBOSS-001-BEAST'});
const object = x => Boolean(x) && typeof x === 'object' && !Array.isArray(x);
const own = (o,k) => object(o) && typeof k === 'string' && Object.hasOwn(o,k);
const text = x => typeof x === 'string' && x.trim().length > 0;
const id = x => text(x) && /^[A-Za-z][A-Za-z0-9._-]*$/.test(x);
const integer = x => Number.isInteger(x) && x >= 0;
const positive = x => typeof x === 'number' && Number.isFinite(x) && x > 0;
const file = x => text(x) && /^[A-Za-z0-9][A-Za-z0-9._/-]*\.(png|webp)$/.test(x) && !x.split('/').some(p=>['..','.',''].includes(p));
const rect = x => object(x) && integer(x.x) && integer(x.y) && Number.isInteger(x.width) && x.width>0 && Number.isInteger(x.height) && x.height>0;
const inside = (outer,inner) => inner.x>=outer.x && inner.y>=outer.y && inner.x+inner.width<=outer.x+outer.width && inner.y+inner.height<=outer.y+outer.height;
const freeze = x => {if(object(x)||Array.isArray(x)){for(const v of Object.values(x))freeze(v);Object.freeze(x);}return x;};
const reason = e => {try{return String(e?.message??e);}catch{return 'Presentation dependency threw an unreadable error';}};
const fields = (value,required,optional=[]) => object(value) && required.every(k=>own(value,k)) && Object.keys(value).every(k=>required.includes(k)||optional.includes(k));
const contextKey = c => `${c.role}:${c.view}:${c.phase}`;
const rules = Object.freeze({
 'portrait:neutral:before':'anthro', 'portrait:neutral:after':'anthro',
 'dialogue-standing:neutral:before':'anthro','dialogue-standing:neutral:after':'anthro',
 'world-sprite:neutral:before':'beast','world-sprite:neutral:resolution':'beast','world-sprite:neutral:after':'beast',
 'combat-sprite:neutral:resolution':'beast',
});
export const SUPPORTED_PRESENTATION_CONTEXTS = freeze(Object.entries(rules).map(([key,form])=>{const [role,view,phase]=key.split(':');return {enemyId:BOSS_ENTITY_ID,role,view,phase,formId:FORM_IDS[form]};}));
const identityValid = (ref,formId) => fields(ref,['designId','formId','revision']) && ref.designId===BOSS_DESIGN_ID && ref.formId===formId && ref.revision===IDENTITY_REVISION;
const sameRef = (a,b) => a.designId===b.designId && a.formId===b.formId && a.revision===b.revision;
const requestValid = request => fields(request,['enemyId','role','view','phase']) && request.enemyId===BOSS_ENTITY_ID && ['role','view','phase'].every(k=>text(request[k]));
const hold = (why,selection) => freeze({status:'HOLD',reason:why,...(selection?{selection}:{}),mayRender:false,mayUseLegacyPlaceholder:false});

function validateAsset(asset,key,manifest,binding,errors) {
 const fail = detail => errors.push(`${key}: ${detail}`);
 const required=['assetId','enemyId','identityRef','role','view','file','sha256','mime','width','height','safeCrop','alpha','review','provenance'];
 if(!fields(asset,required,['groundAnchor','drawScale','worldHeightM','zOrder'])) {fail('invalid own asset fields');return;}
 if(!id(key)||asset.assetId!==key||asset.enemyId!==BOSS_ENTITY_ID||!identityValid(asset.identityRef,binding.identityRef.formId)||!sameRef(asset.identityRef,binding.identityRef)) fail('asset ownership/identity mismatch');
 if(asset.role!==binding.role||asset.view!==binding.view) fail('role/view substitution is prohibited');
 if(!file(asset.file)||!/^[a-f0-9]{64}$/.test(asset.sha256??'')) fail('safe file and SHA-256 required');
 if(!['image/png','image/webp'].includes(asset.mime)||!String(asset.file).endsWith(asset.mime==='image/png'?'.png':'.webp')) fail('MIME/extension mismatch');
 if(!Number.isInteger(asset.width)||asset.width<=0||!Number.isInteger(asset.height)||asset.height<=0||(!manifest.testOnly&&(asset.width<256||asset.height<256))) fail('invalid dimensions');
 const canvas={x:0,y:0,width:asset.width,height:asset.height},alpha=asset.alpha;
 if(!rect(asset.safeCrop)||!inside(canvas,asset.safeCrop)) fail('safe crop out of bounds');
 if(!fields(alpha,['required','hasTransparency','min','max','transparentFraction','bounds'])||typeof alpha.required!=='boolean'||typeof alpha.hasTransparency!=='boolean'||!integer(alpha.min)||!integer(alpha.max)||alpha.max>255||alpha.min>alpha.max||!Number.isFinite(alpha.transparentFraction)||alpha.transparentFraction<0||alpha.transparentFraction>=1||!rect(alpha.bounds)||!inside(canvas,alpha.bounds)) fail('invalid alpha metadata');
 else {
  if(rect(asset.safeCrop)&&!inside(asset.safeCrop,alpha.bounds))fail('crop clips nontransparent pixels');
  if(alpha.hasTransparency!==(alpha.min<255)||alpha.max===0)fail('inconsistent/empty alpha');
  if(alpha.required&&(!alpha.hasTransparency||alpha.min!==0||alpha.transparentFraction<=0))fail('transparent background required');
 }
 if(!fields(asset.review,['status','evidence'])||asset.review.status!=='approved'||!text(asset.review.evidence))fail('visual acceptance evidence required');
 if(!fields(asset.provenance,['method','source','testOnly'])||!text(asset.provenance.source)||!['imagegen','authored-raster','synthetic-test'].includes(asset.provenance.method)||asset.provenance.testOnly!==manifest.testOnly||(asset.provenance.method==='synthetic-test')!==manifest.testOnly)fail('provenance mismatch');
 if(['world-sprite','combat-sprite','dialogue-standing'].includes(asset.role)&&alpha?.required!==true)fail('transparent cutout required for this role');
 if(asset.role==='world-sprite') {
  const anchor=asset.groundAnchor,crop=asset.safeCrop;
  if(!fields(anchor,['x','y'])||!Number.isFinite(anchor.x)||!Number.isFinite(anchor.y)||!rect(crop)||anchor.x<crop.x||anchor.x>crop.x+crop.width||anchor.y<=crop.y||anchor.y>crop.y+crop.height)fail('authored ground anchor required');
  if(!positive(asset.drawScale)||asset.drawScale>4||!positive(asset.worldHeightM)||asset.worldHeightM>20)fail('authored world scale required');
  if(!fields(asset.zOrder,['mode','tieBreak','occlusion'])||asset.zOrder.mode!=='native-foot-depth'||asset.zOrder.occlusion!=='existing-per-pixel-native-depth'||!Number.isInteger(asset.zOrder.tieBreak)||Math.abs(asset.zOrder.tieBreak)>100)fail('existing depth contract required');
 } else if(['groundAnchor','drawScale','worldHeightM','zOrder'].some(k=>own(asset,k))) fail('non-world role cannot borrow world geometry');
}

/** Pure structural validation. Never treats metadata as actual file/pixel acceptance. */
export function validateBossPresentationManifest(manifest,{allowTestFixtures=false}={}) {
 const errors=[],holds=[];let testOnly=true;
 try {
  if(!fields(manifest,['schema','revision','status','enemyId','designId','basePath','testOnly','forms','bindings','assets']))throw new TypeError('Manifest own fields do not match schema');
  if(manifest.schema!==BOSS_PRESENTATION_SCHEMA||!text(manifest.revision)||manifest.status!=='presentationcandidate')errors.push('unsupported schema/revision/status');
  if(manifest.enemyId!==BOSS_ENTITY_ID||manifest.designId!==BOSS_DESIGN_ID)errors.push('one existing logical enemy is required');
  if(manifest.basePath!=='assets/forest-enemies/'||typeof manifest.testOnly!=='boolean')errors.push('invalid basePath/testOnly');
  testOnly=manifest.testOnly;
  if(manifest.testOnly&&!allowTestFixtures)errors.push('synthetic fixtures forbidden outside tests');
  if(!object(manifest.forms)||!object(manifest.bindings)||!object(manifest.assets))throw new TypeError('forms/bindings/assets maps required');
  if(JSON.stringify(Object.keys(manifest.forms).sort())!==JSON.stringify(Object.values(FORM_IDS).sort()))errors.push('exactly the two versioned form identities are required');
  for(const [form,formId]of Object.entries(FORM_IDS)) {
   const entry=own(manifest.forms,formId)?manifest.forms[formId]:null;
   if(!fields(entry,['form','identityRef'])||entry.form!==form||!identityValid(entry.identityRef,formId))errors.push(`invalid form ${formId}`);
  }
  if(JSON.stringify(Object.keys(manifest.bindings).sort())!==JSON.stringify(Object.keys(rules).sort()))errors.push('exact supported presentation contexts required');
  const used=new Set(),files=new Map(),hashes=new Map();
  for(const [key,form]of Object.entries(rules)) {
   const b=own(manifest.bindings,key)?manifest.bindings[key]:null;
   if(!fields(b,['enemyId','role','view','phase','identityRef','asset'])||contextKey(b)!==key||b.enemyId!==BOSS_ENTITY_ID||!identityValid(b.identityRef,FORM_IDS[form])) {errors.push(`invalid binding ${key}`);continue;}
   const slot=b.asset;
   if(!object(slot)||!own(slot,'status')){errors.push(`${key}: explicit own asset status required`);continue;}
   if(slot.status==='HOLD') {
    if(!fields(slot,['status','reason'],['targetFile'])||!text(slot.reason)||(own(slot,'targetFile')&&!file(slot.targetFile)))errors.push(`${key}: HOLD cannot expose usable asset/url`);
    holds.push(key);continue;
   }
   if(slot.status!=='READY'||!fields(slot,['status','assetId'])||!id(slot.assetId)||!own(manifest.assets,slot.assetId)) {errors.push(`${key}: missing READY asset`);continue;}
   used.add(slot.assetId);validateAsset(manifest.assets[slot.assetId],slot.assetId,manifest,b,errors);
  }
  for(const [key,a]of Object.entries(manifest.assets)) {
   if(!used.has(key))errors.push(`${key}: orphan asset`);
   if(!object(a))continue;
   if(files.has(a.file))errors.push(`${key}: file reused by ${files.get(a.file)}`);files.set(a.file,key);
   if(!manifest.testOnly&&hashes.has(a.sha256))errors.push(`${key}: raster reused by ${hashes.get(a.sha256)}`);hashes.set(a.sha256,key);
  }
 } catch(e) {errors.push(reason(e));}
 return freeze({ok:errors.length===0,releaseReady:errors.length===0&&holds.length===0&&!testOnly,errors,holds});
}

function resolveValidated(manifest,request) {
 try {
  if(!requestValid(request))return hold('Explicit own enemyId, role, view and phase are required; form/gameplay overrides are unsupported');
  const key=contextKey(request);
  if(!own(rules,key)||!own(manifest.bindings,key))return hold('Unsupported presentation role/view/phase; no fallback or mirroring');
  const binding=manifest.bindings[key];
  const selection={...request,identityRef:{...binding.identityRef}};
  if(binding.asset.status==='HOLD')return hold(binding.asset.reason,selection);
  if(!own(manifest.assets,binding.asset.assetId))return hold('Missing owned presentation asset',selection);
  return freeze({status:'READY',selection,asset:manifest.assets[binding.asset.assetId],url:`${manifest.basePath}${manifest.assets[binding.asset.assetId].file}`,mayRender:false,mayUseLegacyPlaceholder:false});
 } catch(e){return hold(reason(e));}
}

/** Pure and immutable: explicit presentation context is the sole form-selection input. */
export function selectBossPresentation(manifest,request,options={}) {
 try {
  const copy=structuredClone(manifest),report=validateBossPresentationManifest(copy,options);
  if(!report.ok)return hold(`Invalid presentation manifest: ${report.errors.join('; ')}`);
  return resolveValidated(freeze(copy),request);
 } catch(e){return hold(reason(e));}
}
export function createBossPresentationRegistry(manifest,options={}) {
 const copy=structuredClone(manifest),report=validateBossPresentationManifest(copy,options);
 if(!report.ok)throw new Error(`Invalid presentation manifest: ${report.errors.join('; ')}`);
 freeze(copy);
 return Object.freeze({manifest:copy,report,resolve:request=>resolveValidated(copy,request)});
}

/** Atomic image gate; bytes must be hashed and decoded by the injected verified loader. */
export function createBossPresentationGate(registry,loadAndDecode) {
 let generation=0,committed=new Map();
 const newState=(status,requested=0,why=null)=>({status,generation,requested,reason:why,mayRender:status==='ready',mayUseLegacyPlaceholder:false});
 let state=newState('idle');
 const snapshot=()=>Object.freeze({...state});
 const invalidate=()=>{generation++;committed=new Map();state=newState('idle');};
 const superseded=(ticket,requested)=>Object.freeze({...newState('superseded',requested,'A newer presentation request owns the gate'),generation:ticket,mayRender:false});
 async function preload(requests) {
  const ticket=++generation;let phase='resolve',requested=0;committed=new Map();state=newState('loading');
  try {
   if(!Array.isArray(requests)||requests.length===0)throw new TypeError('At least one explicit presentation request required');
   if(!own(registry,'resolve')||typeof registry.resolve!=='function'||typeof loadAndDecode!=='function')throw new TypeError('Presentation registry/loader dependency missing');
   const unique=new Map();
   for(const request of requests){if(!requestValid(request))throw new TypeError('Malformed explicit presentation request');unique.set(contextKey(request),Object.freeze({...request}));}
   requested=unique.size;state={...state,requested};const work=[];
   for(const [key,request]of unique) {
    const resolution=registry.resolve(request);
    if(ticket!==generation)return superseded(ticket,requested);
    if(!object(resolution)||!own(resolution,'status'))throw new TypeError('Malformed presentation resolution');
    if(resolution.status==='HOLD'){if(!text(resolution.reason))throw new TypeError('HOLD reason missing');state=newState('HOLD',requested,resolution.reason);return snapshot();}
    const a=own(resolution,'asset')?resolution.asset:null,s=own(resolution,'selection')?resolution.selection:null;
    if(resolution.status!=='READY'||!own(resolution,'url')||!text(resolution.url)||!object(a)||!['assetId','enemyId','role','view','identityRef','width','height','sha256'].every(k=>own(a,k))||!fields(s,['enemyId','role','view','phase','identityRef'])||!own(rules,key)||!identityValid(a.identityRef,FORM_IDS[rules[key]])||!identityValid(s.identityRef,FORM_IDS[rules[key]])||a.enemyId!==request.enemyId||a.role!==request.role||a.view!==request.view||s.enemyId!==request.enemyId||s.role!==request.role||s.view!==request.view||s.phase!==request.phase||!id(a.assetId)||!Number.isInteger(a.width)||a.width<=0||!Number.isInteger(a.height)||a.height<=0||!/^[a-f0-9]{64}$/.test(a.sha256??''))throw new TypeError('Invalid READY ownership/context/hash metadata');
    // Snapshot dependency output before any asynchronous operation can mutate it.
    work.push({key,request,asset:freeze(structuredClone(a)),url:resolution.url});
   }
   phase='decode';
   const results=await Promise.all(work.map(async item=>{
    const loaded=await loadAndDecode(item.asset,item.url);
    if(!object(loaded)||!['image','width','height','sha256'].every(k=>own(loaded,k))||!loaded.image||loaded.width!==item.asset.width||loaded.height!==item.asset.height||loaded.sha256!==item.asset.sha256)throw new Error(`Decoded dimensions/hash mismatch: ${item.asset.assetId}`);
    const handle=Object.freeze({generation:ticket,key:item.key,assetId:item.asset.assetId,identityRef:item.asset.identityRef});
    return [item.key,Object.freeze({handle,asset:item.asset,image:loaded.image})];
   }));
   if(ticket!==generation)return superseded(ticket,requested);
   committed=new Map(results);state=newState('ready',requested);return snapshot();
  }catch(e){if(ticket!==generation)return superseded(ticket,requested);committed=new Map();state=newState(phase==='resolve'?'HOLD':'failed',requested,reason(e));return snapshot();}
 }
 return Object.freeze({preload,invalidate,snapshot,
  getHandle(request){try{return state.status==='ready'&&requestValid(request)?committed.get(contextKey(request))?.handle??null:null;}catch{return null;}},
  get(handle){try{if(state.status!=='ready'||!object(handle)||handle.generation!==generation)return null;const current=committed.get(handle.key);return current?.handle===handle?current:null;}catch{return null;}},
 });
}
