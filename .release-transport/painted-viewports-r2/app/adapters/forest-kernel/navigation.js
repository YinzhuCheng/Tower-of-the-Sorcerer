import { EPS, distance, lerp, near, finitePoint, convexPolygon, inside, onSegment, segmentParameters, onBoundary, edges, unionBoundary, assertClearance, polygonDistance, interiorsOverlap, clipConvex, portalSupportCollar, stable, freeze, invariant } from './geometry.js';

export const CONTRACT_VERSION = 'continuous-navigation/1';
const PORTAL_KINDS = ['seam', 'doorway', 'stairs', 'ramp'];
const MODES = ['person', 'freight'];
const copy = value => structuredClone(value);
const pxy = p => [p.x, p.y];
const position = (cell, point) => ({ cellId: cell.id, surfaceId: cell.surfaceId, x: point[0], y: point[1] });
const samePosition = (a, b) => a?.cellId === b?.cellId && a?.surfaceId === b?.surfaceId && near(pxy(a), pxy(b));
const modes = entity => entity.modes === undefined ? ['person'] : entity.modes;
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value) && [Object.prototype,null].includes(Object.getPrototypeOf(value));
function jsonDocument(value, seen = new Set()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) return;
  invariant((Array.isArray(value) || record(value)) && !seen.has(value), 'NON_JSON_DOCUMENT');
  seen.add(value);
  const keys = Reflect.ownKeys(value);
  if (Array.isArray(value)) invariant(keys.length === value.length + 1 && Array.from({length:value.length},(_,i)=>Object.hasOwn(value,i)).every(Boolean), 'NON_JSON_DOCUMENT');
  for (const key of keys) {
    if (Array.isArray(value) && key === 'length') continue;
    const descriptor = Object.getOwnPropertyDescriptor(value,key);
    invariant(typeof key === 'string' && descriptor.enumerable && Object.hasOwn(descriptor,'value'), 'NON_JSON_DOCUMENT');
    jsonDocument(descriptor.value, seen);
  }
  seen.delete(value);
}
function index(items, kind) {
  invariant(Array.isArray(items), 'MISSING_ARRAY', kind);
  const map = new Map();
  for (const item of items) {
    invariant(record(item), 'INVALID_ENTITY', kind);
    invariant(typeof item.id === 'string' && item.id.length > 0 && !map.has(item.id), 'INVALID_OR_DUPLICATE_ID', `${kind}:${item.id}`);
    map.set(item.id, item);
  }
  return map;
}
function validateCondition(condition, schema) {
  if (condition === undefined) return;
  invariant(condition && typeof condition === 'object' && !Array.isArray(condition), 'INVALID_CONDITION');
  const keys = Object.keys(condition);
  if (keys.length === 1 && keys[0] === 'not') return validateCondition(condition.not, schema);
  if (keys.length === 1 && ['all', 'any'].includes(keys[0])) {
    invariant(Array.isArray(condition[keys[0]]) && condition[keys[0]].length > 0, 'INVALID_CONDITION');
    return condition[keys[0]].forEach(c => validateCondition(c, schema));
  }
  invariant(keys.length === 2 && keys.includes('key') && keys.includes('equals') && typeof condition.key === 'string' && Object.hasOwn(schema, condition.key), 'UNKNOWN_CONDITION');
  invariant(schema[condition.key].includes(condition.equals), 'INVALID_CONDITION_VALUE', condition.key);
}
function enabled(condition, state) {
  if (condition === undefined) return true;
  if ('not' in condition) return !enabled(condition.not, state);
  if ('all' in condition) return condition.all.every(c => enabled(c, state));
  if ('any' in condition) return condition.any.some(c => enabled(c, state));
  return state[condition.key] === condition.equals;
}
function reachable(start, adjacency) {
  const seen = new Set([start]), queue = [start];
  for (const id of queue) for (const next of adjacency.get(id) ?? []) if (!seen.has(next)) { seen.add(next); queue.push(next); }
  return seen;
}

/** Compile reviewed metre-space data. This does not import or mutate a game. */
export function compileWorld(source, actorProfile = { id: 'b-person', radius: 0.32, maxStep: 0.5, allowedModes: ['person'] }) {
  invariant(record(source), 'INVALID_WORLD');
  invariant(record(actorProfile), 'INVALID_ACTOR_PROFILE');
  jsonDocument(source); jsonDocument(actorProfile);
  invariant(Number.isFinite(actorProfile.radius) && actorProfile.radius > EPS, 'INVALID_ACTOR_RADIUS');
  invariant(Number.isFinite(actorProfile.maxStep) && actorProfile.maxStep > EPS, 'INVALID_MAX_STEP');
  invariant(typeof actorProfile.id === 'string' && actorProfile.id.length > 0, 'INVALID_ACTOR_PROFILE');
  invariant(Array.isArray(actorProfile.allowedModes) && actorProfile.allowedModes.length > 0 && actorProfile.allowedModes.every(m=>MODES.includes(m)) && new Set(actorProfile.allowedModes).size === actorProfile.allowedModes.length, 'INVALID_PROFILE_MODES');
  const spec = copy(source), profile = freeze(copy(actorProfile));
  invariant(typeof spec.geometryId === 'string' && spec.geometryId.length > 0 && typeof spec.version === 'string' && spec.version.length > 0, 'MISSING_GEOMETRY_IDENTITY');
  const schema = spec.stateSchema === undefined ? {} : spec.stateSchema;
  invariant(record(schema), 'INVALID_STATE_SCHEMA');
  invariant(spec.requiredConnections === undefined || Array.isArray(spec.requiredConnections), 'INVALID_REQUIRED_CONNECTIONS');
  for (const [key, values] of Object.entries(schema)) {
    invariant(Array.isArray(values) && values.length > 0 && values.every(v => ['boolean', 'string', 'number'].includes(typeof v) && (typeof v !== 'number' || Number.isFinite(v))), 'INVALID_STATE_SCHEMA', key);
    invariant(new Set(values).size === values.length, 'DUPLICATE_STATE_VALUE', key);
  }
  const surfaces = index(spec.surfaces, 'surfaces'), cells = index(spec.cells, 'cells'), floors = index(spec.floors, 'floors');
  const portals = index(spec.portals, 'portals'), anchors = index(spec.anchors ?? [], 'anchors'), blockers = index(spec.blockers ?? [], 'blockers');
  for (const surface of surfaces.values()) invariant(Array.isArray(surface.heightPlane) && surface.heightPlane.length === 3 && surface.heightPlane.every(Number.isFinite), 'INVALID_SURFACE_HEIGHT', surface.id);
  const height = (surfaceId, point) => { const [a,b,c] = surfaces.get(surfaceId).heightPlane; return a * point[0] + b * point[1] + c; };
  for (const entity of [...cells.values(), ...floors.values(), ...blockers.values()]) {
    invariant(surfaces.has(entity.surfaceId), 'UNKNOWN_SURFACE', entity.id);
    entity.polygon = convexPolygon(entity.polygon, entity.id);
  }
  for (const entity of [...cells.values(), ...floors.values(), ...portals.values(), ...anchors.values(), ...blockers.values()]) {
    validateCondition(entity.enabledWhen, schema);
    invariant(Array.isArray(modes(entity)) && modes(entity).length > 0 && modes(entity).every(m => MODES.includes(m)) && new Set(modes(entity)).size === modes(entity).length, 'INVALID_MODE', entity.id);
    for (const forbidden of ['effects', 'effect', 'cost', 'onEnter', 'onCross', 'trigger']) invariant(!Object.hasOwn(entity, forbidden), 'NAVIGATION_MUST_BE_EFFECT_FREE', `${entity.id}.${forbidden}`);
  }
  for (const portal of portals.values()) {
    invariant(cells.has(portal.aCell) && cells.has(portal.bCell) && portal.aCell !== portal.bCell, 'INVALID_PORTAL_CELL', portal.id);
    invariant(PORTAL_KINDS.includes(portal.kind), 'INVALID_PORTAL_KIND', portal.id);
    invariant(Array.isArray(portal.aperture) && portal.aperture.length === 2 && portal.aperture.every(finitePoint) && distance(...portal.aperture) > EPS, 'INVALID_PORTAL_APERTURE', portal.id);
    const [a, b] = [cells.get(portal.aCell), cells.get(portal.bCell)];
    for (const cell of [a, b]) {
      invariant(portal.aperture.every(p => onBoundary(p, cell.polygon)) && onBoundary(lerp(...portal.aperture, 0.5), cell.polygon), 'REMOTE_OR_NONBOUNDARY_PORTAL', portal.id);
      invariant(modes(portal).every(m => modes(cell).includes(m)), 'PORTAL_MODE_WITHOUT_CELL', portal.id);
    }
    if (a.surfaceId !== b.surfaceId) invariant(['stairs', 'ramp'].includes(portal.kind), 'UNDECLARED_LAYER_TRANSITION', portal.id);
    for (const point of portal.aperture) invariant(Math.abs(height(a.surfaceId, point) - height(b.surfaceId, point)) <= EPS, 'HEIGHT_DISCONTINUITY', portal.id);
  }
  const allCells=[...cells.values()];
  for(let i=0;i<allCells.length;i++) for(let j=i+1;j<allCells.length;j++) {
    const a=allCells[i],b=allCells[j];
    const joined=[...portals.values()].some(p=>[p.aCell,p.bCell].includes(a.id)&&[p.aCell,p.bCell].includes(b.id));
    invariant((a.surfaceId!==b.surfaceId&&!joined)||!interiorsOverlap(a.polygon,b.polygon),'OVERLAPPING_CENTRE_CELLS',`${a.id}/${b.id}`);
  }
  for (const anchor of anchors.values()) {
    invariant(cells.has(anchor.cellId) && finitePoint(anchor.position), 'INVALID_ANCHOR', anchor.id);
    invariant(inside(anchor.position, cells.get(anchor.cellId).polygon), 'ANCHOR_OUTSIDE_CELL', anchor.id);
    invariant(typeof anchor.eventId === 'string' && anchor.eventId.length > 0, 'MISSING_EVENT_ID', anchor.id);
    invariant(Number.isFinite(anchor.interactionRadius) && anchor.interactionRadius >= 0, 'INVALID_INTERACTION_RADIUS', anchor.id);
    invariant(modes(anchor).every(m => modes(cells.get(anchor.cellId)).includes(m)), 'ANCHOR_MODE_WITHOUT_CELL', anchor.id);
  }
  // A declared structural connection must have an actual geometric portal chain.
  for (const assertion of spec.requiredConnections ?? []) {
    invariant(record(assertion) && typeof assertion.from === 'string' && typeof assertion.to === 'string' && (assertion.mode === undefined || MODES.includes(assertion.mode)), 'INVALID_REQUIRED_CONNECTIONS');
    const adjacency = new Map([...cells.keys()].map(id => [id, []]));
    for (const p of portals.values()) if (modes(p).includes(assertion.mode ?? 'person')) { adjacency.get(p.aCell).push(p.bCell); adjacency.get(p.bCell).push(p.aCell); }
    invariant(cells.has(assertion.from) && cells.has(assertion.to) && reachable(assertion.from, adjacency).has(assertion.to), 'BROKEN_REQUIRED_GRAPH', `${assertion.from}->${assertion.to}`);
  }
  freeze(spec);
  // Exact canonical identity, not an unauthenticated caller-supplied digest.
  const geometryKey = stable({ contract: CONTRACT_VERSION, spec, profile });

  function snapshot(navState, mode = 'person') {
    invariant(MODES.includes(mode), 'INVALID_MODE');
    invariant(profile.allowedModes.includes(mode), 'ACTOR_MODE_MISMATCH', `${profile.id}/${mode}`);
    invariant(record(navState), 'INVALID_NAV_STATE');
    jsonDocument(navState);
    invariant(Object.keys(navState).length === Object.keys(schema).length && Object.keys(navState).every(k => Object.hasOwn(schema, k)), 'STATE_KEYS_MISMATCH');
    for (const [key, values] of Object.entries(schema)) invariant(values.includes(navState[key]), 'INVALID_STATE_VALUE', key);
    const state = freeze(copy(navState)), stateKey = stable(state);
    const active = entity => modes(entity).includes(mode) && enabled(entity.enabledWhen, state);
    const activeCells = new Map([...cells].filter(([, c]) => active(c)));
    const activePortals = new Map([...portals].filter(([, p]) => active(p) && activeCells.has(p.aCell) && activeCells.has(p.bCell)));
    const activeAnchors = new Map([...anchors].filter(([, a]) => active(a) && activeCells.has(a.cellId)));
    const adjacency = new Map([...activeCells.keys()].map(id => [id, []]));
    for (const p of activePortals.values()) { adjacency.get(p.aCell).push(p.bCell); adjacency.get(p.bCell).push(p.aCell); }
    // Validate entire convex centre domains, not a handful of sampled vertices.
    for (const cell of activeCells.values()) {
      const support = [...floors.values()].filter(f => f.surfaceId === cell.surfaceId && active(f)).map(f => f.polygon);
      const physicalBlockers = [...blockers.values()].filter(b => b.surfaceId === cell.surfaceId && active(b)).map(b => ({id:b.id,polygon:b.polygon}));
      for (const portal of portals.values()) if ([portal.aCell,portal.bCell].includes(cell.id) && modes(portal).includes(mode)) {
        const other=cells.get(portal.aCell===cell.id?portal.bCell:portal.aCell);
        if(other.surfaceId===cell.surfaceId) continue;
        const collar=portalSupportCollar(portal.aperture,other.polygon,profile.radius);
        for(const floor of floors.values()) if(floor.surfaceId===other.surfaceId && active(floor)) {
          const piece=clipConvex(floor.polygon,collar);if(piece.length>=3) support.push(piece);
        }
        for(const blocker of blockers.values()) if(blocker.surfaceId===other.surfaceId && active(blocker)) {
          const piece=clipConvex(blocker.polygon,collar);if(piece.length>=3) physicalBlockers.push({id:blocker.id,polygon:piece});
        }
      }
      assertClearance(cell,support,unionBoundary(support),profile.radius);
      for (const blocker of physicalBlockers) invariant(polygonDistance(cell.polygon, blocker.polygon) + EPS >= profile.radius, 'DYNAMIC_BLOCKER_CLEARANCE', `${cell.id}/${blocker.id}`);
    }
    const components = [], componentByCell = new Map();
    for (const cellId of [...activeCells.keys()].sort()) if (!componentByCell.has(cellId)) {
      const ids = [...reachable(cellId, adjacency)].sort(), id = `component:${JSON.stringify(ids)}`;
      ids.forEach(cell => componentByCell.set(cell, id));
      components.push({ id, cellIds: ids, surfaceIds: [...new Set(ids.map(cell => cells.get(cell).surfaceId))].sort(), anchorIds: [...activeAnchors.values()].filter(a => ids.includes(a.cellId)).map(a => a.id).sort() });
    }
    freeze(components);
    function validatePosition(pos) {
      invariant(pos && finitePoint(pxy(pos)) && activeCells.has(pos.cellId), 'INVALID_POSITION');
      const cell = activeCells.get(pos.cellId);
      invariant(pos.surfaceId === cell.surfaceId && inside(pxy(pos), cell.polygon), 'POSITION_OUTSIDE_CELL');
      return position(cell, pxy(pos));
    }
    function heightAt(pos) { validatePosition(pos); return height(pos.surfaceId,pxy(pos)); }
    function componentAt(pos) { validatePosition(pos); return components.find(c => c.id === componentByCell.get(pos.cellId)); }
    function availableAnchors(pos) { return componentAt(pos).anchorIds.map(id => copy(activeAnchors.get(id))); }
    function clearStraightSegment(fromInput,toInput) {
      const from=validatePosition(fromInput),to=validatePosition(toInput);
      if(from.surfaceId!==to.surfaceId) return false;
      const a=pxy(from),b=pxy(to),best=new Map([[from.cellId,0]]),queue=[{cellId:from.cellId,t:0}];
      for(const item of queue) {
        if(item.cellId===to.cellId) return true;
        for(const p of activePortals.values()) if([p.aCell,p.bCell].includes(item.cellId)) {
          const other=p.aCell===item.cellId?p.bCell:p.aCell;
          if(cells.get(other).surfaceId!==from.surfaceId) continue;
          const ts=segmentParameters(a,b,...p.aperture);
          if(onSegment(lerp(a,b,item.t),...p.aperture)) ts.push(item.t);
          for(const t of ts.sort((x,y)=>x-y)) if(t>=item.t-EPS&&t<=1+EPS&&inside(lerp(a,b,t),cells.get(item.cellId).polygon)) {
            if(!best.has(other)||t<best.get(other)-EPS) {best.set(other,t);queue.push({cellId:other,t});}
            break;
          }
        }
      }
      return false;
    }
    function canInteract(pos, anchorId) {
      validatePosition(pos); const a = activeAnchors.get(anchorId);
      return !!a && distance(pxy(pos), a.position) <= a.interactionRadius + EPS && clearStraightSegment(pos,position(cells.get(a.cellId),a.position));
    }
    // Only paths constructed and deeply frozen by this snapshot may skip repeated
    // replay during frame sampling. Deserialized/caller-owned paths never enter it.
    const certifiedPaths = new WeakSet();
    function findPath(startInput, targetInput) {
      const start = validatePosition(startInput), target = validatePosition(targetInput);
      if (componentByCell.get(start.cellId) !== componentByCell.get(target.cellId)) return null;
      // Portals use reviewed midpoint crossings. Dijkstra finds the shortest
      // such route, not a claim of Euclidean-shortest free-space navigation.
      const nodes = [{id:'@start',pos:start}, {id:'@target',pos:target}], crossEdges = new Map();
      for (const p of [...activePortals.values()].sort((a,b) => a.id.localeCompare(b.id))) {
        const mid = lerp(...p.aperture, 0.5), ai = nodes.length, bi = ai + 1;
        nodes.push({id:`${p.id}:a`,pos:position(cells.get(p.aCell),mid)}, {id:`${p.id}:b`,pos:position(cells.get(p.bCell),mid)});
        crossEdges.set(ai,{index:bi,portal:p.id}); crossEdges.set(bi,{index:ai,portal:p.id});
      }
      const costs = nodes.map(() => Infinity), previous = new Map(), visited = new Set(); costs[0] = 0;
      while (true) {
        let current = -1;
        for (let i = 0; i < nodes.length; i++) if (!visited.has(i) && (current === -1 || costs[i] < costs[current])) current = i;
        if (current === -1 || costs[current] === Infinity) return null;
        if (current === 1) break;
        visited.add(current);
        const neighbours = nodes.flatMap((node, i) => i !== current && node.pos.cellId === nodes[current].pos.cellId ? [{index:i,cost:distance(pxy(nodes[current].pos),pxy(node.pos)),kind:'walk'}] : []);
        if (crossEdges.has(current)) neighbours.push({...crossEdges.get(current),cost:0,kind:'portal'});
        for (const edge of neighbours) if (!visited.has(edge.index) && costs[current] + edge.cost < costs[edge.index]) {
          costs[edge.index] = costs[current] + edge.cost;
          previous.set(edge.index,{from:current,kind:edge.kind,portalId:edge.portal});
        }
      }
      const steps = []; let cursor = 1;
      while (cursor !== 0) {
        const e = previous.get(cursor); invariant(e, 'INTERNAL_PATH_FAILURE');
        steps.push({kind:e.kind,from:copy(nodes[e.from].pos),to:copy(nodes[cursor].pos),...(e.kind === 'portal' ? {portalId:e.portalId} : {})}); cursor = e.from;
      }
      steps.reverse();
      const path = freeze({contract:CONTRACT_VERSION,geometryKey,stateKey,mode,start,target,steps,length:costs[1]});
      replay(path, start); certifiedPaths.add(path); return path;
    }
    function pathToAnchor(start, anchorId) {
      invariant(anchors.has(anchorId), 'UNKNOWN_ANCHOR', anchorId);
      const a = activeAnchors.get(anchorId); if (!a) return null;
      return findPath(start,position(cells.get(a.cellId),a.position));
    }
    function replay(path, initialPosition) {
      invariant(path?.contract === CONTRACT_VERSION && path.geometryKey === geometryKey && path.mode === mode, 'PATH_GEOMETRY_MISMATCH');
      invariant(path.stateKey === stateKey, 'STALE_PATH_STATE');
      let current = validatePosition(initialPosition); invariant(samePosition(current,path.start), 'PATH_START_MISMATCH');
      invariant(Array.isArray(path.steps), 'INVALID_PATH'); let length = 0;
      for (const step of path.steps) {
        invariant(samePosition(current,step.from), 'DISCONTINUOUS_PATH'); validatePosition(step.to);
        if (step.kind === 'walk') {
          invariant(current.cellId === step.to.cellId, 'WALK_CANNOT_CHANGE_CELL');
          // Both endpoints lie in the same certified convex domain: the full segment is safe.
          length += distance(pxy(current),pxy(step.to));
        } else if (step.kind === 'portal') {
          const p = activePortals.get(step.portalId);
          invariant(p && ((p.aCell === current.cellId && p.bCell === step.to.cellId) || (p.bCell === current.cellId && p.aCell === step.to.cellId)), 'CLOSED_OR_INVALID_PORTAL');
          invariant(near(pxy(current),pxy(step.to)) && onSegment(pxy(current),...p.aperture), 'PORTAL_TELEPORT_REJECTED');
        } else invariant(false,'UNKNOWN_PATH_STEP');
        current = copy(step.to);
      }
      invariant(samePosition(current,path.target) && Number.isFinite(path.length) && Math.abs(path.length-length) <= EPS * Math.max(1,length), 'INVALID_PATH_END_OR_LENGTH');
      return freeze({position:current,length,navState:copy(state),events:[]});
    }
    function stepWalk(fromInput, toInput) {
      const from = validatePosition(fromInput), to = validatePosition(toInput);
      invariant(from.cellId === to.cellId, 'WALK_CANNOT_CHANGE_CELL');
      invariant(distance(pxy(from),pxy(to)) <= profile.maxStep + EPS, 'REMOTE_MOVEMENT_REJECTED');
      return freeze(to);
    }
    function crossPortal(fromInput, portalId) {
      const from = validatePosition(fromInput), portal = activePortals.get(portalId);
      invariant(portal && [portal.aCell,portal.bCell].includes(from.cellId), 'CLOSED_OR_INVALID_PORTAL');
      invariant(onSegment(pxy(from),...portal.aperture), 'REMOTE_PORTAL_REJECTED');
      const other = from.cellId === portal.aCell ? portal.bCell : portal.aCell;
      return freeze(position(cells.get(other),pxy(from)));
    }
    function samplePath(path, metres) {
      if (!certifiedPaths.has(path)) replay(path,path?.start);
      return sampleValidatedPath(path,metres);
    }
    function sampleValidatedPath(path, metres) {
      invariant(Number.isFinite(metres) && metres >= 0 && metres <= path.length + EPS, 'INVALID_PATH_DISTANCE');
      let remaining = Math.min(metres,path.length), current = path.start;
      for (const step of path.steps) {
        if (step.kind === 'portal') { current = step.to; continue; }
        const length = distance(pxy(step.from),pxy(step.to));
        if (remaining < length - EPS) return freeze(position(cells.get(step.from.cellId),lerp(pxy(step.from),pxy(step.to),remaining/length)));
        remaining = Math.max(0,remaining-length); current = step.to;
      }
      return freeze(copy(current));
    }
    function advance(path, cursor, currentInput, budget) {
      invariant(Number.isFinite(budget) && budget >= 0 && budget <= profile.maxStep + EPS, 'REMOTE_MOVEMENT_REJECTED');
      if (!certifiedPaths.has(path)) replay(path,path?.start);
      const expected = sampleValidatedPath(path,cursor), current = validatePosition(currentInput);
      invariant(samePosition(expected,current) || (cursor === 0 && samePosition(path.start,current)), 'CURSOR_POSITION_MISMATCH');
      const next = Math.min(path.length,cursor+budget);
      return freeze({position:sampleValidatedPath(path,next),cursor:next,done:next >= path.length-EPS,events:[]});
    }
    function save(pos) {
      return freeze({contract:CONTRACT_VERSION,geometryKey,stateKey,mode,position:validatePosition(pos)});
    }
    function restore(value) {
      invariant(value?.contract === CONTRACT_VERSION && value.geometryKey === geometryKey && value.mode === mode, 'SAVE_GEOMETRY_MISMATCH');
      invariant(value.stateKey === stateKey, 'SAVE_STATE_MISMATCH');
      return freeze(validatePosition(value.position));
    }
    return freeze({contract:CONTRACT_VERSION,geometryId:spec.geometryId,geometryVersion:spec.version,state,mode,profile,components,validatePosition,heightAt,clearStraightSegment,componentAt,availableAnchors,canInteract,findPath,pathToAnchor,replay,stepWalk,crossPortal,samplePath,advance,save,restore});
  }
  return freeze({contract:CONTRACT_VERSION,geometryId:spec.geometryId,geometryVersion:spec.version,profile,snapshot});
}
