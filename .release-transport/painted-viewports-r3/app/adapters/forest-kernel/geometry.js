// Finite, convex, metre-space geometry. No renderer or game-rule dependencies.
export const EPS = 1e-8;
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const mul = (a, k) => [a[0] * k, a[1] * k];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
export const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
export const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
export const lerp = (a, b, t) => add(a, mul(sub(b, a), t));
export const near = (a, b) => distance(a, b) <= EPS;
export const finitePoint = p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite);
export const edges = polygon => polygon.map((p, i) => [p, polygon[(i + 1) % polygon.length]]);
export function invariant(value, code, detail = '') {
  if (!value) { const error = new Error(`${code}${detail ? ': ' + detail : ''}`); error.code = code; throw error; }
}
export function convexPolygon(value, label) {
  invariant(Array.isArray(value) && value.length >= 3 && value.every(finitePoint), 'INVALID_POLYGON', label);
  const p = value.map(x => [...x]);
  let area = edges(p).reduce((sum, [a, b]) => sum + cross(a, b), 0) / 2;
  invariant(Math.abs(area) > EPS, 'DEGENERATE_POLYGON', label);
  if (area < 0) p.reverse();
  for (const [a, b] of edges(p)) {
    invariant(distance(a, b) > EPS, 'DEGENERATE_EDGE', label);
    for (const c of p) invariant(cross(sub(b, a), sub(c, a)) >= -EPS, 'NON_CONVEX_OR_SELF_INTERSECTING', label);
  }
  // Repeated non-neighbour vertices and backtracking collinear edges are not simple polygons.
  for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) invariant(!near(p[i], p[j]), 'REPEATED_VERTEX', label);
  for (let i = 0; i < p.length; i++) {
    const a = sub(p[i], p[(i + p.length - 1) % p.length]), b = sub(p[(i + 1) % p.length], p[i]);
    invariant(Math.abs(cross(a, b)) > EPS || dot(a, b) > 0, 'BACKTRACKING_EDGE', label);
  }
  return p;
}
export function inside(point, polygon, strict = false) {
  return edges(polygon).every(([a, b]) => cross(sub(b, a), sub(point, a)) >= (strict ? EPS : -EPS));
}
export function onSegment(point, a, b) {
  return Math.abs(cross(sub(b, a), sub(point, a))) <= EPS * Math.max(1, distance(a, b)) && dot(sub(point, a), sub(point, b)) <= EPS;
}
export const onBoundary = (point, polygon) => edges(polygon).some(([a, b]) => onSegment(point, a, b));
export function pointSegmentDistance(point, a, b) {
  if (distance(a,b) <= EPS) return distance(point,a);
  const ab = sub(b, a), t = Math.max(0, Math.min(1, dot(sub(point, a), ab) / dot(ab, ab)));
  return distance(point, lerp(a, b, t));
}
export function segmentParameters(a, b, c, d) {
  if (distance(a,b) <= EPS) return onSegment(a,c,d) ? [0] : [];
  const ab = sub(b, a), cd = sub(d, c), ac = sub(c, a), det = cross(ab, cd);
  if (Math.abs(det) > EPS) {
    const t = cross(ac, cd) / det, u = cross(ac, ab) / det;
    return t >= -EPS && t <= 1 + EPS && u >= -EPS && u <= 1 + EPS ? [Math.max(0, Math.min(1, t))] : [];
  }
  if (Math.abs(cross(ac, ab)) > EPS) return [];
  return [c, d].filter(p => onSegment(p, a, b)).map(p => dot(sub(p, a), ab) / dot(ab, ab));
}
export function segmentDistance(a, b, c, d) {
  if (segmentParameters(a, b, c, d).length || segmentParameters(c, d, a, b).length) return 0;
  return Math.min(pointSegmentDistance(a, c, d), pointSegmentDistance(b, c, d), pointSegmentDistance(c, a, b), pointSegmentDistance(d, a, b));
}
export function polygonSegmentDistance(polygon, a, b) {
  if (inside(a, polygon) || inside(b, polygon)) return 0;
  return Math.min(...edges(polygon).map(([c, d]) => segmentDistance(a, b, c, d)));
}
export function polygonDistance(a, b) {
  if (inside(a[0], b) || inside(b[0], a)) return 0;
  return Math.min(...edges(b).map(([c, d]) => polygonSegmentDistance(a, c, d)));
}
// Arrangement of convex floor edges, with exposed subsegments retained. This
// handles overlaps, shared edges, holes and non-convex unions, not input self-intersections.
export function unionBoundary(polygons) {
  const allEdges = polygons.flatMap((polygon, owner) => edges(polygon).map(([a, b]) => ({ a, b, owner })));
  const result = [];
  for (const edge of allEdges) {
    const {a, b, owner} = edge, ab = sub(b, a);
    const ts = [0, 1, ...allEdges.flatMap(e => segmentParameters(a, b, e.a, e.b))].sort((x, y) => x - y);
    const unique = ts.filter((v, i) => i === 0 || v - ts[i - 1] > EPS);
    for (let i = 0; i < unique.length - 1; i++) {
      const from = lerp(a, b, unique[i]), to = lerp(a, b, unique[i + 1]), mid = lerp(from, to, 0.5);
      if (distance(from, to) <= EPS) continue;
      const hidden = polygons.some((polygon, index) => {
        if (index === owner) return false;
        if (inside(mid, polygon, true)) return true;
        return edges(polygon).some(([c, d]) => onSegment(mid, c, d) && Math.abs(cross(ab, sub(d, c))) <= EPS && dot(ab, sub(d, c)) < 0);
      });
      if (!hidden && !result.some(([c, d]) => near(from, c) && near(to, d))) result.push([from, to]);
    }
  }
  return result;
}
export function assertClearance(cell, floors, boundary, radius) {
  invariant(floors.some(f => inside(cell.polygon[0], f)), 'NO_FLOOR_SUPPORT', cell.id);
  for (const [a, b] of boundary) invariant(polygonSegmentDistance(cell.polygon, a, b) + EPS >= radius, 'INSUFFICIENT_CLEARANCE', cell.id);
}
export function stable(value) {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + stable(value[k])).join(',') + '}';
  return JSON.stringify(value);
}
export function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.freeze(value); for (const v of Object.values(value)) freeze(v); }
  return value;
}

export function clipHalfPlane(polygon, origin, normal) {
  if (polygon.length < 3) return [];
  const output = [];
  for (const [a,b] of edges(polygon)) {
    const da=dot(sub(a,origin),normal),db=dot(sub(b,origin),normal),ia=da>=-EPS,ib=db>=-EPS;
    if(ia) output.push(a);
    if(ia!==ib) output.push(lerp(a,b,da/(da-db)));
  }
  const clean = output.filter((p,i)=>!i||!near(p,output[i-1]));
  if (clean.length > 1 && near(clean[0],clean.at(-1))) clean.pop();
  if (clean.length < 3 || Math.abs(edges(clean).reduce((sum,[a,b])=>sum+cross(a,b),0)) <= EPS) return [];
  return clean;
}
export function clipConvex(subject, clipper) {
  let out=subject;
  for(const [a,b] of edges(clipper)){const ab=sub(b,a);out=clipHalfPlane(out,a,[-ab[1],ab[0]]);if(out.length<3)return [];}
  return out;
}
// Support may straddle a real slope/landing seam. Use only an r-wide collar
// from the directly connected neighbour's actual floor, never its whole layer.
export function portalSupportCollar(aperture, neighbourCell, radius) {
  const [a,b]=aperture,d=mul(sub(b,a),1/distance(a,b)),n=[-d[1],d[0]],r=radius+EPS;
  const p=add(a,mul(d,-r)),q=add(b,mul(d,r));
  const rectangle=[add(p,mul(n,-r)),add(q,mul(n,-r)),add(q,mul(n,r)),add(p,mul(n,r))];
  const centroid=mul(neighbourCell.reduce((sum,v)=>add(sum,v),[0,0]),1/neighbourCell.length);
  const sign=dot(sub(centroid,a),n)>=0?1:-1;
  return clipHalfPlane(rectangle,a,mul(n,sign));
}
export function interiorsOverlap(a, b) {
  for (const [p,q] of [...edges(a),...edges(b)]) {
    const e = sub(q,p), normal = [-e[1],e[0]], pa=a.map(v=>dot(v,normal)), pb=b.map(v=>dot(v,normal));
    if (Math.min(Math.max(...pa),Math.max(...pb))-Math.max(Math.min(...pa),Math.min(...pb)) <= EPS) return false;
  }
  return true;
}
