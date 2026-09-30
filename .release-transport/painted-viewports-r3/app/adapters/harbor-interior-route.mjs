/** r3 legal portal selection inside the UNCHANGED R7 centre domains.
 * All changed positions retain their cell/surface and come back through the
 * original kernel replay + advance. This is not a screen-space displacement. */
export const INTERIOR_X={lower:11.96,upper:13.35};
export const ANCHOR_SELECTIONS={
 west_entry:{x:-8.7,y:9},
 east_lower_stair:{x:INTERIOR_X.lower,y:-2.1},
 east_upper_stair:{x:INTERIOR_X.upper,y:-2.1},
};
const eq=(a,b)=>Math.abs(a-b)<1e-8;
function interiorPortalPosition(p){
 const lower=p.surfaceId==='east_lower_flight'||p.cellId==='east_middle.cell.29'||(p.cellId==='east_middle.cell.28'&&eq(p.y,.6))||(p.cellId==='low_public.cell.13'&&eq(p.y,-4.15));
 const upper=p.surfaceId==='east_upper_flight'||p.cellId==='east_middle.cell.30'||p.cellId==='upper_public.cell.25'||(p.cellId==='east_middle.cell.28'&&eq(p.y,.6))||(p.cellId==='upper_public.cell.26'&&eq(p.y,-4.1));
 return lower&&eq(p.x,11.7)?{...p,x:INTERIOR_X.lower}:upper&&eq(p.x,13.1)?{...p,x:INTERIOR_X.upper}:{...p};
}
const deepFreeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(deepFreeze);Object.freeze(o);}return o;};
export function selectInteriorPath(snapshot,path){
 if(!path)return null;
 const steps=path.steps.map((s,i)=>({...s,from:i===0?{...path.start}:interiorPortalPosition(s.from),to:i===path.steps.length-1?{...path.target}:interiorPortalPosition(s.to)}));
 // Adjacent walk/portal endpoints must stay identical, including exact cell ID.
 const length=steps.reduce((n,s)=>n+(s.kind==='walk'?Math.hypot(s.to.x-s.from.x,s.to.y-s.from.y):0),0);
 const selected=deepFreeze({...path,steps,length});snapshot.replay(selected,selected.start);return selected;
}
