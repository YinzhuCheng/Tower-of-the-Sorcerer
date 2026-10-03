// Read-only snapshot of the original saved-native support mesh and projection.
// No new support triangles, guard widening, iterative shortcuts, or query cache.
export function createFastNativeSupportSampler(mesh, contract) {
  const triangles = mesh.triangles.map(indices => {
    const a = mesh.vertices[indices[0]], b = mesh.vertices[indices[1]], c = mesh.vertices[indices[2]];
    const bycy = b[1] - c[1], cxbx = c[0] - b[0], cyay = c[1] - a[1], axcx = a[0] - c[0];
    return Object.freeze({bycy, cxbx, cyay, axcx, cx: c[0], cy: c[1], az: a[2], bz: b[2], cz: c[2],
      det: bycy * axcx + cxbx * (a[1] - c[1]),
      minX: Math.floor(Math.min(a[0], b[0], c[0])), maxX: Math.floor(Math.max(a[0], b[0], c[0])),
      minY: Math.floor(Math.min(a[1], b[1], c[1])), maxY: Math.floor(Math.max(a[1], b[1], c[1]))});
  });
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const t of triangles) {minX = Math.min(minX, t.minX); maxX = Math.max(maxX, t.maxX); minY = Math.min(minY, t.minY); maxY = Math.max(maxY, t.maxY);}
  const width = Math.max(0, maxX - minX + 1), height = Math.max(0, maxY - minY + 1), bins = Array.from({length: width * height}, () => []);
  // Keep precisely the old floor(min)..floor(max) bin membership and mesh order.
  for (const t of triangles) for (let y = t.minY; y <= t.maxY; y++) for (let x = t.minX; x <= t.maxX; x++) bins[(y - minY) * width + x - minX].push(t);
  for (const bin of bins) Object.freeze(bin);
  Object.freeze(bins);
  const a = contract.affine, f = contract.camera.forward;
  const ox = a.origin_px[0], oy = a.origin_px[1], xx = a.x_m[0], xy = a.x_m[1], yx = a.y_m[0], yy = a.y_m[1], zx = a.z_m[0], zy = a.z_m[1], fx = f[0], fy = f[1], fz = f[2];
  function zAt(x, y) {
    const bx = Math.floor(x), by = Math.floor(y);
    if (!(bx >= minX && bx <= maxX && by >= minY && by <= maxY)) return null;
    const bin = bins[(by - minY) * width + bx - minX];
    let z = null;
    for (let i = 0; i < bin.length; i++) {
      const t = bin[i];
      if (Math.abs(t.det) < 1e-12) continue;
      const u = (t.bycy * (x - t.cx) + t.cxbx * (y - t.cy)) / t.det;
      const v = (t.cyay * (x - t.cx) + t.axcx * (y - t.cy)) / t.det;
      if (u >= -1e-6 && v >= -1e-6 && u + v <= 1 + 1e-6) {
        const candidate = u * t.az + v * t.bz + (1 - u - v) * t.cz;
        z = z === null ? candidate : Math.max(z, candidate);
      }
    }
    return z;
  }
  function result(anchor, x, y, z) {
    // Preserve the original projection expression and map/reduce addition order,
    // including the reduce's initial +0 and anchor-relative world subtraction.
    return {worldFootM: [x, y, z], footPx: [ox + x * xx + y * yx + z * zx, oy + x * xy + y * yy + z * zy],
      footDepthM: anchor.footDepthM + (((0 + (x - anchor.worldFootM[0]) * fx) + (y - anchor.worldFootM[1]) * fy) + (z - anchor.worldFootM[2]) * fz), source: 'saved-native-support-triangle'};
  }
  function nativeGroundSupportAt(anchor, dx = 0, dy = 0) {
    if (!anchor?.worldFootM || !Number.isFinite(dx) || !Number.isFinite(dy)) return null;
    const x = anchor.worldFootM[0] + dx, y = anchor.worldFootM[1] + dy, z = zAt(x, y);
    return z === null ? null : result(anchor, x, y, z);
  }
  function nativeSupportAtPixel(sample, px, py) {
    if (!sample?.worldFootM) return null;
    const dx = (px - sample.footPx[0]) / xx, dy = py - sample.footPx[1];
    let offsetY = dy / yy, x, y, z = null;
    // Exactly three calls' worth of native support, rejecting at each iteration.
    for (let i = 0; i < 3; i++) {
      if (!Number.isFinite(dx) || !Number.isFinite(offsetY)) return null;
      x = sample.worldFootM[0] + dx;
      y = sample.worldFootM[1] + offsetY;
      z = zAt(x, y);
      if (z === null) return null;
      offsetY = (dy - (z - sample.worldFootM[2]) * zy) / yy;
    }
    return result(sample, x, y, z);
  }
  return Object.freeze({nativeGroundSupportAt, nativeSupportAtPixel});
}
