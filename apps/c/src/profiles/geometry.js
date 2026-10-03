import {PROFILES} from './registry.js';
import {VOYAGE_VESSEL_GEOMETRY} from '../campaigns/c/content.js';
import {hashValue,stableStringify} from '../solver/state.js';
const checked=new WeakSet();
function immutableDataTree(value,seen=new WeakSet()) {
  if(value===null||typeof value!=='object')return true;
  if(!Object.isFrozen(value))return false;
  if(seen.has(value))return true;
  seen.add(value);
  // A frozen accessor can still return different values later. Only immutable
  // data properties are eligible for the validation cache.
  return Reflect.ownKeys(value).every(key=>{
    const descriptor=Object.getOwnPropertyDescriptor(value,key);
    return Object.hasOwn(descriptor,'value')&&immutableDataTree(descriptor.value,seen);
  });
}
// Explicitly admit only the three frozen full identities sharing the same hull.
// No foreign/future balance hash can acquire the C geometry by campaign ID alone.
export function supportsVoyageGeometry(runtime) {
  if(checked.has(runtime))return true;
  if(!PROFILES.some(profile=>stableStringify(profile.identity)===stableStringify(runtime.identity)))return false;
  if(!runtime.spec||hashValue(runtime.spec)!==runtime.identity.contentHash)return false;
  if(stableStringify(runtime.spec.vesselGeometry)!==stableStringify(VOYAGE_VESSEL_GEOMETRY))return false;
  // Shallow freezing a facade does not freeze its identity or descendants.
  // Such objects may validate now, but must be fully rechecked on every call.
  const descriptors=Object.getOwnPropertyDescriptors(runtime);
  if(Object.isFrozen(runtime)&&Object.hasOwn(descriptors.identity??{},'value')&&Object.hasOwn(descriptors.spec??{},'value')&&immutableDataTree(runtime.identity)&&immutableDataTree(runtime.spec))checked.add(runtime);
  return true;
}
