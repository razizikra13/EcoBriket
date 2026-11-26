// EcoBriket 3D — hero interaktif, viewer produk, dan "foto studio" render 3D untuk katalog.
// Dibundel dengan esbuild ke public/js/eco3d.js (npm run build:3d). Tanpa CDN agar lolos CSP 'self'.
import * as THREE from 'three';

/* ------------------------------------------------------------------ util */
const TAU = Math.PI * 2;
const rnd = seed => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const hash = s => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const texOf = (c, { repeat = [1, 1], srgb = true } = {}) => { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
const FONT = '"Space Grotesk","Inter","Segoe UI",system-ui,sans-serif';

export function supported() {
  try { const c = document.createElement('canvas'); return !!(window.WebGL2RenderingContext && c.getContext('webgl2')); } catch { return false; }
}

/* ------------------------------------------------------------- textures */
const TEX = {};
function charcoalTex(tint = '#2a2d31') {
  if (TEX['c' + tint]) return TEX['c' + tint];
  const c = canvas(256, 256), x = c.getContext('2d'), r = rnd(7);
  x.fillStyle = tint; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) { const v = 30 + r() * 40 | 0; x.fillStyle = `rgba(${v},${v + 3},${v + 6},${.35 + r() * .5})`; x.fillRect(r() * 256, r() * 256, 1 + r() * 2.4, 1 + r() * 2.4); }
  for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(150,150,145,${.15 + r() * .35})`; x.fillRect(r() * 256, r() * 256, 1, 1); }
  x.globalAlpha = .18; x.strokeStyle = '#000';
  for (let i = 0; i < 40; i++) { const y = r() * 256; x.beginPath(); x.moveTo(0, y); x.lineTo(256, y + (r() - .5) * 6); x.lineWidth = .6 + r(); x.stroke(); }
  return (TEX['c' + tint] = texOf(c, { repeat: [2, 2] }));
}
function emberTex() {
  if (TEX.ember) return TEX.ember;
  const c = canvas(256, 256), x = c.getContext('2d'), r = rnd(11);
  x.fillStyle = '#080402'; x.fillRect(0, 0, 256, 256);
  x.lineCap = 'round';
  for (let i = 0; i < 46; i++) {
    let px = r() * 256, py = r() * 256; x.beginPath(); x.moveTo(px, py);
    for (let k = 0; k < 5; k++) { px += (r() - .5) * 46; py += (r() - .3) * 40; x.lineTo(px, py); }
    x.strokeStyle = `rgba(255,${120 + r() * 80 | 0},40,${.5 + r() * .5})`; x.lineWidth = 1 + r() * 2.6; x.shadowColor = '#ff7a2a'; x.shadowBlur = 8; x.stroke();
  }
  const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, 'rgba(255,140,50,.55)'); g.addColorStop(.35, 'rgba(255,90,30,.08)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.shadowBlur = 0; x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  return (TEX.ember = texOf(c, { repeat: [1, 1] }));
}
function radialTex(stops, size = 128, key) {
  if (key && TEX[key]) return TEX[key];
  const c = canvas(size, size), x = c.getContext('2d'), g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => g.addColorStop(o, col)); x.fillStyle = g; x.fillRect(0, 0, size, size);
  const t = texOf(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; if (key) TEX[key] = t; return t;
}
const smokeTex = () => radialTex([[0, 'rgba(235,232,225,.55)'], [.5, 'rgba(220,218,210,.18)'], [1, 'rgba(220,218,210,0)']], 128, 'smoke');
const sparkTex = () => radialTex([[0, 'rgba(255,240,200,1)'], [.35, 'rgba(255,170,60,.8)'], [1, 'rgba(255,120,30,0)']], 64, 'spark');
function flameTex() {
  if (TEX.flame) return TEX.flame;
  const c = canvas(64, 128), x = c.getContext('2d'), g = x.createLinearGradient(0, 128, 0, 0);
  g.addColorStop(0, 'rgba(255,90,20,.0)'); g.addColorStop(.12, 'rgba(255,120,30,.95)'); g.addColorStop(.45, 'rgba(255,190,70,.95)'); g.addColorStop(.8, 'rgba(255,240,170,.7)'); g.addColorStop(1, 'rgba(255,255,230,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 128);
  const t = texOf(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return (TEX.flame = t);
}
function fiberTex(base, line, seed = 3, key) {
  if (key && TEX[key]) return TEX[key];
  const c = canvas(256, 256), x = c.getContext('2d'), r = rnd(seed);
  x.fillStyle = base; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 520; i++) { x.strokeStyle = line; x.globalAlpha = .08 + r() * .25; x.lineWidth = .5 + r() * 1.6; const y = r() * 256, xx = r() * 256; x.beginPath(); x.moveTo(xx, y); x.lineTo(xx + 20 + r() * 50, y + (r() - .5) * 8); x.stroke(); }
  x.globalAlpha = 1; const t = texOf(c); if (key) TEX[key] = t; return t;
}
function nutmegFaceTex() {
  if (TEX.nface) return TEX.nface;
  const s = 256, c = canvas(s, s), x = c.getContext('2d'), r = rnd(5), m = s / 2;
  x.fillStyle = '#C99A3A'; x.beginPath(); x.arc(m, m, m, 0, TAU); x.fill();
  x.fillStyle = '#F3E2B4'; x.beginPath(); x.arc(m, m, m * .86, 0, TAU); x.fill();
  x.fillStyle = '#7A4A2A'; x.beginPath(); x.ellipse(m, m, m * .62, m * .7, 0, 0, TAU); x.fill();
  x.strokeStyle = '#C8352A'; x.lineCap = 'round';
  for (let i = 0; i < 9; i++) { x.lineWidth = 7 + r() * 6; x.beginPath(); const ox = m + (i - 4) * 13; x.moveTo(ox, m - 70 + r() * 10); x.bezierCurveTo(ox + 16, m - 20, ox - 16, m + 20, ox + (r() - .5) * 10, m + 70); x.stroke(); }
  const t = texOf(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return (TEX.nface = t);
}
function woodTex() {
  if (TEX.wood) return TEX.wood;
  const c = canvas(512, 128), x = c.getContext('2d'), r = rnd(21);
  x.fillStyle = '#C79A5E'; x.fillRect(0, 0, 512, 128);
  for (let i = 0; i < 70; i++) { x.strokeStyle = `rgba(${130 + r() * 40 | 0},${85 + r() * 30 | 0},45,${.25 + r() * .35})`; x.lineWidth = .8 + r() * 2.2; const y = r() * 128; x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(170, y + (r() - .5) * 10, 340, y + (r() - .5) * 10, 512, y + (r() - .5) * 6); x.stroke(); }
  return (TEX.wood = texOf(c));
}
function ringsTex() {
  if (TEX.rings) return TEX.rings;
  const s = 256, c = canvas(s, s), x = c.getContext('2d');
  x.fillStyle = '#D8AE72'; x.fillRect(0, 0, s, s);
  for (let i = 1; i < 12; i++) { x.strokeStyle = i % 2 ? '#B8864C' : '#C99A60'; x.lineWidth = 3; x.beginPath(); x.arc(s / 2 + i, s / 2, i * 10.5, 0, TAU); x.stroke(); }
  const t = texOf(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return (TEX.rings = t);
}
function cornTex() {
  if (TEX.corn) return TEX.corn;
  const c = canvas(256, 256), x = c.getContext('2d');
  x.fillStyle = '#B8902F'; x.fillRect(0, 0, 256, 256);
  for (let j = 0; j < 16; j++) for (let i = 0; i < 12; i++) { x.fillStyle = (i + j) % 3 ? '#E2B94A' : '#D7AA3C'; x.beginPath(); x.roundRect(i * 21.3 + (j % 2) * 10 + 2, j * 16 + 2, 18, 13, 4); x.fill(); }
  return (TEX.corn = texOf(c));
}
function labelTex(info) {
  const W = 512, H = 460, c = canvas(W, H), x = c.getContext('2d');
  x.fillStyle = '#FFFDF8'; x.beginPath(); x.roundRect(0, 0, W, H, 42); x.fill();
  // logo heksagon
  x.save(); x.translate(64, 72); x.scale(1.15, 1.15);
  x.fillStyle = '#1C2024'; x.beginPath(); [[32, 5], [55.4, 18.5], [55.4, 45.5], [32, 59], [8.6, 45.5], [8.6, 18.5]].forEach(([a, b], i) => i ? x.lineTo(a - 32, b - 32) : x.moveTo(a - 32, b - 32)); x.closePath(); x.fill();
  x.fillStyle = '#5FA777'; x.beginPath(); x.moveTo(0, -19); x.bezierCurveTo(-8, -9, -14, -1.5, -14, 6.5); x.bezierCurveTo(-14, 14, -7.7, 20, 0, 20); x.fill();
  x.fillStyle = '#E8A23A'; x.beginPath(); x.moveTo(0, -19); x.bezierCurveTo(8, -9, 14, -1.5, 14, 6.5); x.bezierCurveTo(14, 14, 7.7, 20, 0, 20); x.fill();
  x.fillStyle = '#1C2024'; x.beginPath(); x.arc(0, 8, 4.8, 0, TAU); x.fill(); x.restore();
  x.fillStyle = '#1F5C40'; x.font = `700 40px ${FONT}`; x.fillText('EcoBriket', 120, 86);
  x.fillStyle = '#1C2024'; x.font = `700 50px ${FONT}`;
  (info.lines || ['Briket', 'Bio-Arang']).slice(0, 2).forEach((l, i) => x.fillText(l, 48, 190 + i * 58));
  x.fillStyle = '#FBEFD9'; x.beginPath(); x.roundRect(48, 290, 330, 56, 28); x.fill();
  x.fillStyle = '#714709'; x.font = `700 30px ${FONT}`; x.fillText(info.burn || '', 72, 328);
  x.fillStyle = '#5F666D'; x.font = `400 28px ${FONT}`; x.fillText(info.net || '', 48, 404);
  const t = texOf(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
}

/* ------------------------------------------------------------ materials */
const M = {};
const mat = (k, f) => M[k] || (M[k] = f());
const charMat = () => mat('char', () => new THREE.MeshStandardMaterial({ color: '#ffffff', map: charcoalTex(), bumpMap: charcoalTex(), bumpScale: 1.6, roughness: .93, metalness: .02, side: THREE.DoubleSide }));
const hotMat = () => new THREE.MeshStandardMaterial({ color: '#d0b8ae', map: charcoalTex('#2b211d'), roughness: .9, emissive: '#ff5a14', emissiveMap: emberTex(), emissiveIntensity: 1.8, side: THREE.DoubleSide });
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .8, ...o });

/* ------------------------------------------------------------ geometry */
function latheProfile(r, h, hole, bev) {
  const p = [];
  if (hole > 0) {
    p.push(new THREE.Vector2(hole + bev, 0), new THREE.Vector2(r - bev, 0), new THREE.Vector2(r - bev * .3, bev * .3), new THREE.Vector2(r, bev),
      new THREE.Vector2(r, h - bev), new THREE.Vector2(r - bev * .3, h - bev * .3), new THREE.Vector2(r - bev, h), new THREE.Vector2(hole + bev, h),
      new THREE.Vector2(hole + bev * .3, h - bev * .3), new THREE.Vector2(hole, h - bev), new THREE.Vector2(hole, bev), new THREE.Vector2(hole + bev * .3, bev * .3), new THREE.Vector2(hole + bev, 0));
  } else {
    p.push(new THREE.Vector2(0.0001, 0), new THREE.Vector2(r - bev, 0), new THREE.Vector2(r, bev), new THREE.Vector2(r, h - bev), new THREE.Vector2(r - bev, h), new THREE.Vector2(0.0001, h));
  }
  return p;
}
function roundedRectShape(w, d, rad) {
  const s = new THREE.Shape(), x = -w / 2, y = -d / 2;
  s.moveTo(x + rad, y); s.lineTo(x + w - rad, y); s.quadraticCurveTo(x + w, y, x + w, y + rad); s.lineTo(x + w, y + d - rad); s.quadraticCurveTo(x + w, y + d, x + w - rad, y + d);
  s.lineTo(x + rad, y + d); s.quadraticCurveTo(x, y + d, x, y + d - rad); s.lineTo(x, y + rad); s.quadraticCurveTo(x, y, x + rad, y); return s;
}
// Geometri briket per bentuk. Satuan: 1 = 50 mm. Alas di y = 0.
function briqGeo(shape, W, H, seed = 1) {
  let g;
  if (shape === 'heksagonal') {
    const s = new THREE.Shape(), r = W / 2;
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + Math.PI / 6; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    s.closePath(); const hole = new THREE.Path(); hole.absarc(0, 0, W * .14, 0, TAU, true); s.holes.push(hole);
    g = new THREE.ExtrudeGeometry(s, { depth: H - .04, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 2, curveSegments: 24 });
    g.rotateX(-Math.PI / 2); g.translate(0, .02, 0);
  } else if (shape === 'kubus') {
    g = new THREE.ExtrudeGeometry(roundedRectShape(W - .06, W - .06, W * .1), { depth: W - .06, bevelEnabled: true, bevelThickness: .03, bevelSize: .03, bevelSegments: 3, curveSegments: 6 });
    g.rotateX(-Math.PI / 2); g.translate(0, .03, 0);
  } else if (shape === 'bantal') {
    g = new THREE.SphereGeometry(.5, 40, 24); g.scale(W, H * 1.1, W * .62);
    const pos = g.attributes.position; for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); pos.setY(i, y * (1 - .18 * Math.cos(pos.getX(i) / W * Math.PI))); }
    g.computeVertexNormals(); g.translate(0, H * .5, 0);
  } else if (shape === 'curah-arang') {
    const r = rnd(seed); g = new THREE.IcosahedronGeometry(W * .5, 1);
    const pos = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); v.multiplyScalar(.75 + r() * .45); v.y *= .7; pos.setXYZ(i, v.x, v.y, v.z); }
    g.computeVertexNormals(); g.translate(0, W * .32, 0);
  } else {
    const hole = shape === 'silinder-berlubang' ? W * .13 : 0;
    g = new THREE.LatheGeometry(latheProfile(W / 2, H, hole, Math.min(.04, W * .06)), 56);
  }
  return g;
}

/* --------------------------------------------------------------- pieces */
function makePiece(shape, W, H, { hot = false, seed = 1 } = {}) {
  const mesh = new THREE.Mesh(briqGeo(shape, W, H, seed), hot ? hotMat() : charMat());
  mesh.castShadow = mesh.receiveShadow = true; mesh.userData.shape = shape; mesh.userData.hot = hot;
  if (shape === 'silinder-berlubang' || shape === 'silinder') {
    const groove = new THREE.Mesh(new THREE.BoxGeometry(W * .07, H * .7, .02), new THREE.MeshStandardMaterial({ color: '#3c4248', roughness: .9 }));
    groove.position.set(W * .28, H * .5, W * .41); groove.rotation.y = .6; mesh.add(groove);
  }
  return mesh;
}
function topOf(shape, W, H) { return shape === 'kubus' ? W : shape === 'curah-arang' ? W * .6 : H; }

function makeFlame(scale = 1) {
  const g = new THREE.Group();
  const prof = (R, Hh) => { const p = []; for (let i = 0; i <= 18; i++) { const t = i / 18; p.push(new THREE.Vector2(Math.max(.0001, R * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15)), .9) * (1 - t * .55)), t * Hh)); } return p; };
  const mk = (R, Hh, col, op) => new THREE.Mesh(new THREE.LatheGeometry(prof(R, Hh), 24), new THREE.MeshBasicMaterial({ color: col, map: flameTex(), transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  const outer = mk(.16, .62, '#ff8a2a', .95), inner = mk(.085, .36, '#fff0b0', .9);
  inner.position.y = .02; g.add(outer, inner);
  const light = new THREE.PointLight('#ff8a3c', 5, 4, 2); light.position.y = .25; g.add(light);
  g.scale.setScalar(scale);
  const sparks = [];
  for (let i = 0; i < 6; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTex(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); s.scale.setScalar(.05); s.userData.o = Math.random() * 10; g.add(s); sparks.push(s); }
  g.userData.update = (t, still) => {
    const f = still ? 0 : Math.sin(t * 13.1) * .06 + Math.sin(t * 7.3 + 1) * .08 + Math.sin(t * 23.7) * .03;
    outer.scale.set(1 - f * .4, 1 + f, 1 - f * .4); inner.scale.set(1, 1 + f * 1.3, 1);
    outer.rotation.y = t * .8; g.rotation.z = still ? 0 : Math.sin(t * 2.1) * .05;
    light.intensity = 5 + f * 14;
    sparks.forEach(s => { const k = ((t * .45 + s.userData.o) % 1); s.position.set(Math.sin(s.userData.o * 7 + t) * .12 * k, .3 + k * .9, Math.cos(s.userData.o * 5) * .1 * k); s.material.opacity = still ? 0 : (1 - k) * .9; });
  };
  return g;
}
function makeSmoke(n = 5) {
  const g = new THREE.Group(), ps = [];
  for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex(), transparent: true, depthWrite: false, opacity: .0 })); s.userData.o = i / n; g.add(s); ps.push(s); }
  g.userData.update = (t, still) => ps.forEach(s => { const k = still ? (s.userData.o * .8 + .1) : (t * .12 + s.userData.o) % 1; s.position.set(Math.sin(k * 6 + s.userData.o * 9) * .18 * k, .4 + k * 1.8, 0); s.scale.setScalar(.25 + k * .9); s.material.opacity = Math.sin(k * Math.PI) * .32; s.material.rotation = k * 1.5; });
  return g;
}
function makeLeaf(color = '#5FA777', size = 1) {
  const s = new THREE.Shape(); s.moveTo(0, 0); s.bezierCurveTo(.18, .32, .62, .42, 1, 0); s.bezierCurveTo(.62, -.3, .2, -.22, 0, 0);
  const g = new THREE.ShapeGeometry(s, 16); const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i); pos.setZ(i, -x * x * .25 - y * y * .6); }
  g.computeVertexNormals(); g.scale(size, size, size);
  const leaf = new THREE.Mesh(g, std(color, { side: THREE.DoubleSide, roughness: .6 })); leaf.castShadow = true;
  const rib = new THREE.Mesh(new THREE.CylinderGeometry(.006 * size, .01 * size, .92 * size, 6), std('#2A6E4E'));
  rib.rotation.z = -Math.PI / 2; rib.position.set(.46 * size, .01 * size, -.06 * size); leaf.add(rib);
  return leaf;
}
function makeNutmegDisc(r = .42) {
  const g = new THREE.CylinderGeometry(r, r, .1, 48);
  const side = std('#B07A2E'), cap = std('#ffffff', { map: nutmegFaceTex(), roughness: .7 });
  const m = new THREE.Mesh(g, [side, cap, cap]); m.rotation.x = Math.PI / 2; m.castShadow = true;
  const holder = new THREE.Group(); holder.add(m); m.position.y = r; return holder;
}
function makeNutmegWhole(r = .2) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), std('#7A4A2A', { roughness: .6 })); m.scale.y = .88; m.castShadow = true;
  const mace = std('#C8352A', { roughness: .5 });
  for (let i = 0; i < 7; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(r * 1.01, r * .06, 6, 24, Math.PI * .9), mace); t.rotation.set(Math.PI / 2 + (i - 3) * .12, i * .9, .3); m.add(t); }
  m.position.y = r * .88; return m;
}
function makeCocoHalf(r = .34) {
  const g = new THREE.Group();
  const outer = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 20, 0, TAU, Math.PI / 2, Math.PI / 2), std('#ffffff', { map: fiberTex('#6E4325', '#3e2414', 9, 'coco'), roughness: .85, side: THREE.FrontSide }));
  const inner = new THREE.Mesh(new THREE.SphereGeometry(r * .93, 40, 20, 0, TAU, Math.PI / 2, Math.PI / 2), std('#F5EEDC', { roughness: .5, side: THREE.BackSide }));
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r * .965, r * .04, 8, 48), std('#FBF7EC')); rim.rotation.x = Math.PI / 2;
  [outer, inner, rim].forEach(m => { m.castShadow = true; g.add(m); });
  g.position.y = r; return g;
}
const ellip = (sx, sy, sz, color, o) => { const m = new THREE.Mesh(new THREE.SphereGeometry(.5, 20, 14), std(color, o)); m.scale.set(sx, sy, sz); m.castShadow = true; return m; };

function makeSource(kind, seed = 1) {
  const g = new THREE.Group(), r = rnd(seed + 99);
  const pile = (n, mk, spread = .45) => { for (let i = 0; i < n; i++) { const a = r() * TAU, d = Math.sqrt(r()) * spread; const m = mk(i); m.position.set(Math.cos(a) * d, m.position.y + (spread - d) * .25 * r(), Math.sin(a) * d); m.rotation.set(r() * 3, r() * 3, r() * 3); g.add(m); } };
  switch (kind) {
    case 'ampas-pala':
      pile(26, i => { const m = ellip(.11, .05, .08, i % 2 ? '#8A5A35' : '#A8774B'); m.position.y = .03; return m; }, .42);
      { const n = makeNutmegWhole(.17); n.position.set(.05, .1, -.05); g.add(n); } break;
    case 'tempurung-kelapa': { const a = makeCocoHalf(.32); a.rotation.z = .35; a.position.x = -.12; const b = makeCocoHalf(.26); b.rotation.set(-.4, 0, -.5); b.position.set(.38, .26, .18); g.add(a, b); } break;
    case 'cangkang-sawit': pile(20, i => { const m = ellip(.13, .07, .09, i % 2 ? '#3E271A' : '#5A3A25', { roughness: .45 }); m.position.y = .04; return m; }, .4); break;
    case 'sekam-padi': {
      const mound = new THREE.Mesh(new THREE.SphereGeometry(.5, 32, 16, 0, TAU, 0, Math.PI / 2), std('#DDBE6A', { map: fiberTex('#DDBE6A', '#A8812E', 4, 'husk') })); mound.scale.set(1, .42, .8); mound.receiveShadow = mound.castShadow = true; g.add(mound);
      pile(36, () => { const m = ellip(.09, .025, .035, '#C9A043'); m.position.y = .12; return m; }, .45); break;
    }
    case 'serbuk-gergaji': {
      const mound = new THREE.Mesh(new THREE.SphereGeometry(.42, 32, 16, 0, TAU, 0, Math.PI / 2), std('#E2C08F', { map: fiberTex('#E2C08F', '#B88B52', 6, 'saw') })); mound.scale.set(1, .4, .8); mound.position.x = -.12; mound.castShadow = mound.receiveShadow = true; g.add(mound);
      const slice = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .1, 40), [std('#A97A44', { map: fiberTex('#A97A44', '#6e4a22', 8, 'bark') }), std('#fff', { map: ringsTex() }), std('#fff', { map: ringsTex() })]);
      slice.rotation.set(1.25, 0, -.2); slice.position.set(.32, .3, -.05); slice.castShadow = true; g.add(slice); break;
    }
    case 'tongkol-jagung': {
      const cob = new THREE.Mesh(new THREE.CapsuleGeometry(.13, .55, 8, 24), std('#fff', { map: cornTex() })); cob.rotation.set(0, .4, 1.3); cob.position.y = .15; cob.castShadow = true; g.add(cob);
      const husk = makeLeaf('#C9BE8E', .7); husk.rotation.set(-1.4, .3, 0); husk.position.set(-.35, .03, .1); g.add(husk); break;
    }
    case 'kulit-pinang': {
      const fruit = ellip(.32, .4, .32, '#D9822B', { map: fiberTex('#D9822B', '#9c5512', 12, 'areca') }); fruit.position.set(-.12, .2, 0); fruit.rotation.z = .5; g.add(fruit);
      const half = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .05, 32), [std('#B07A4A'), std('#E9D8B4'), std('#E9D8B4')]); half.position.set(.28, .03, .12); half.castShadow = true; g.add(half);
      const core = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .052, 24), std('#8A5A35')); core.position.copy(half.position); g.add(core); break;
    }
    default: { const c = makeCocoHalf(.26); c.position.x = .2; const n = makeNutmegWhole(.16); n.position.set(-.22, 0, .1); g.add(c, n); }
  }
  return g;
}

function makeBag(info) {
  const g = new THREE.Group(), W = 1.55, H = 2.1, D = .55;
  const geo = new THREE.BoxGeometry(W, H, D, 6, 6, 2); const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const y = pos.getY(i), k = (y + H / 2) / H; pos.setX(i, pos.getX(i) * (1 - k * .05)); pos.setZ(i, pos.getZ(i) * (1 + Math.sin(k * Math.PI) * .12)); }
  geo.computeVertexNormals();
  const kraft = std('#fff', { map: fiberTex('#C9A06A', '#9C7443', 2, 'kraft'), roughness: .9 });
  const body = new THREE.Mesh(geo, kraft); body.position.y = H / 2; body.castShadow = body.receiveShadow = true; g.add(body);
  const crimp = new THREE.Mesh(new THREE.BoxGeometry(W * .97, .16, D * .9), std('#B48A55', { roughness: .85 })); crimp.position.y = H + .02; crimp.castShadow = true; g.add(crimp);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.08, .97), new THREE.MeshStandardMaterial({ map: labelTex(info), roughness: .65, transparent: true }));
  label.position.set(0, H * .64, D / 2 * 1.1 + .005); g.add(label);
  return g;
}
function makeTray(w, d) {
  const g = new THREE.ExtrudeGeometry(roundedRectShape(w, d, .1), { depth: .08, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 2 });
  g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, std('#fff', { map: woodTex(), roughness: .7 })); m.receiveShadow = m.castShadow = true; return m;
}

/* -------------------------------------------------------------- lighting */
function rig(scene, { hero = false } = {}) {
  scene.add(new THREE.HemisphereLight('#fff7ea', '#7fa88a', 1.25));
  const key = new THREE.DirectionalLight('#fff1dc', 2.6); key.position.set(-3, 5.5, 4.5); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 6; key.shadow.bias = -0.0004; key.shadow.normalBias = .02;
  const sc = key.shadow.camera; sc.left = -4; sc.right = 4; sc.top = 4; sc.bottom = -3; sc.near = .5; sc.far = 18;
  scene.add(key);
  const fill = new THREE.DirectionalLight('#dfefff', .7); fill.position.set(4, 2, 2); scene.add(fill);
  const rim = new THREE.DirectionalLight('#ffe6c4', hero ? 1.4 : 1.1); rim.position.set(1, 3, -5); scene.add(rim);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: hero ? .16 : .22 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
}

/* ------------------------------------------------------- scene builders */
const FIT = (w, h) => { let W = w / 50, H = h / 50; const k = Math.min(1, 1.15 / W, 1.7 / H); return [W * k, H * k]; };
// Susunan produk: 2 di belakang, 3 di depan (1 menyala), bahan baku, daun.
function productGroup(p, { live = false } = {}) {
  const g = new THREE.Group(), pick = [], anim = [];
  const shape = p.shape || 'silinder-berlubang'; let [W, H] = FIT(p.w || 50, p.h || 60);
  if (shape === 'kubus') H = W; if (shape === 'bantal') { W = Math.min(1.3, W); H = Math.max(.35, Math.min(.55, H)); }
  const seed = hash(p.id || p.name || shape);
  const items = [];
  if (shape === 'curah-arang') {
    const r = rnd(seed); for (let i = 0; i < 11; i++) items.push({ x: (r() - .5) * 2.2, z: (r() - .5) * 1, s: .55 + r() * .5, hot: i === 4, ry: r() * 3 });
  } else if (shape === 'bantal') {
    [[-.72, .32], [0, .36], [.72, .32], [-.36, -.3], [.36, -.3]].forEach(([x, z], i) => items.push({ x: x * W * 1.05, z: z * W * 1.4, s: 1, hot: i === 1, ry: (i - 2) * .2 }));
    items.push({ x: 0, z: 0, y: H * .78, s: .95, hot: false, ry: .3 });
  } else {
    const gap = W * 1.16;
    [[-gap, .45], [0, .55], [gap, .45], [-gap / 2, -.42], [gap / 2, -.42]].forEach(([x, z], i) => items.push({ x, z: z * Math.max(1, W * .9), s: i > 2 ? .96 : 1, hot: i === 1, ry: (i * 1.3) % 3 }));
  }
  const trayW = Math.max(...items.map(i => Math.abs(i.x))) * 2 + W * 1.5 + .3, trayD = (shape === 'curah-arang' ? 1.6 : Math.max(...items.map(i => Math.abs(i.z))) * 2 + W * 1.25 + .2);
  const tray = makeTray(trayW, trayD); g.add(tray);
  items.forEach((it, i) => {
    const m = makePiece(shape, W * it.s, H * it.s, { hot: it.hot, seed: seed + i });
    m.position.set(it.x, .1 + (it.y || 0), it.z); m.rotation.y = it.ry; g.add(m); pick.push(m);
    if (it.hot) {
      const fl = makeFlame(shape === 'curah-arang' ? .7 : .55 + W * .25); fl.position.set(it.x, .1 + topOf(shape, W * it.s, H * it.s) - .02, it.z); g.add(fl); anim.push(fl.userData.update);
      const sm = makeSmoke(live ? 6 : 4); sm.position.copy(fl.position); g.add(sm); anim.push(sm.userData.update);
      m.userData.update = (t, still) => { m.material.emissiveIntensity = 1.5 + (still ? 0 : Math.sin(t * 3.1) * .35 + Math.sin(t * 7.7) * .15); };
      anim.push(m.userData.update);
    }
  });
  const src = makeSource(p.bahan, seed); src.position.set(trayW / 2 + .6, 0, .35); src.scale.setScalar(1.15); g.add(src);
  const l1 = makeLeaf('#5FA777', 1.05); l1.rotation.set(-1.25, 2.4, 0); l1.position.set(-trayW / 2 - .2, .02, -.5); g.add(l1);
  const l2 = makeLeaf('#7DB98F', .85); l2.rotation.set(-1.35, .5, 0); l2.position.set(trayW / 2 + .2, .02, -.55); g.add(l2);
  g.userData = { pick, anim };
  return g;
}

function heroGroup(info) {
  const g = new THREE.Group(), pick = [], anim = [], anchors = {};
  const bag = makeBag(info.label); bag.position.set(.15, 0, -.75); bag.rotation.y = -.12; g.add(bag); bag.userData.kind = 'bag';
  const defs = [
    { shape: 'silinder-berlubang', x: -1.0, z: .55, W: .62, H: .95, name: info.names?.cyl },
    { shape: 'silinder-berlubang', x: -.32, z: .8, W: .62, H: .8, hot: true, name: info.names?.hot },
    { shape: 'heksagonal', x: .38, z: .6, W: .58, H: 1.05, name: info.names?.hex },
    { shape: 'kubus', x: 1.02, z: .76, W: .52, H: .52, name: info.names?.cube },
  ];
  defs.forEach((d, i) => {
    const m = makePiece(d.shape, d.W, d.H, { hot: d.hot, seed: 40 + i }); m.position.set(d.x, 0, d.z); m.rotation.y = i * .7; m.userData.name = d.name; g.add(m); pick.push(m);
    if (d.hot) {
      const fl = makeFlame(.8); fl.position.set(d.x, d.H - .02, d.z); g.add(fl); anim.push(fl.userData.update);
      const sm = makeSmoke(6); sm.position.copy(fl.position); g.add(sm); anim.push(sm.userData.update);
      anim.push((t, still) => { m.material.emissiveIntensity = 1.5 + (still ? 0 : Math.sin(t * 3.1) * .35 + Math.sin(t * 7.7) * .15); });
      anchors.burn = new THREE.Vector3(d.x - .55, d.H + 1.25, d.z);
    }
    if (d.shape === 'heksagonal') anchors.cal = new THREE.Vector3(d.x + 1.25, .25, d.z + .3);
  });
  const nut = makeNutmegDisc(.4); nut.position.set(-1.72, 0, .5); nut.rotation.y = .35; g.add(nut);
  const c1 = makeCocoHalf(.3); c1.position.set(1.62, 0, .85); c1.rotation.z = .25; g.add(c1);
  const c2 = makeCocoHalf(.24); c2.position.set(1.98, .2, .4); c2.rotation.set(-.3, 0, -.6); g.add(c2);
  const leaves = [['#5FA777', 1.15, [-1.85, .8, -1], [.2, .3, 2.6]], ['#7DB98F', 1, [1.35, 1.55, -1.1], [.1, -.2, .9]], ['#5FA777', .9, [-.25, 2.55, -1.2], [.3, .4, 1.45]], ['#7DB98F', 1.05, [1.95, .04, -.5], [-1.45, -.5, .2]], ['#5FA777', .8, [-1.35, 1.8, -.9], [.2, .2, 2.1]]];
  leaves.forEach(([c, s, p, r]) => { const l = makeLeaf(c, s); if (p[1] > .2) l.castShadow = false; l.position.set(...p); l.rotation.set(...r); g.add(l); l.userData.sway = Math.random() * 6; anim.push((t, still) => { if (!still) l.rotation.x = r[0] + Math.sin(t * .9 + l.userData.sway) * .05; }); });
  g.userData = { pick, anim, anchors, bag };
  return g;
}

/* ------------------------------------------------------ interaction core */
class Stage {
  constructor(el, group, { camera = [0, 2.1, 7.2], target = [0, .9, 0], fov = 30, label = '', onPick, tip, chips = [], autoSpin = true, yaw = 0 } = {}) {
    this.el = el; this.group = group; this.onPick = onPick; this.tip = tip; this.chips = chips;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    const r = this.renderer; r.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75)); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05; r.setClearColor(0x000000, 0);
    const cv = r.domElement; cv.className = 'stage3d-cv'; cv.tabIndex = 0; cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', label);
    el.appendChild(cv);
    this.scene = new THREE.Scene(); rig(this.scene, { hero: true }); this.scene.add(group);
    this.cam = new THREE.PerspectiveCamera(fov, 1, .1, 60); this.cam.position.set(...camera); this.tgt = new THREE.Vector3(...target); this.cam.lookAt(this.tgt);
    this.baseDist = this.cam.position.distanceTo(this.tgt);
    this.yaw = this.tyaw = yaw; this.pitch = this.tpitch = 0; this.vel = 0; this.drag = null; this.last = performance.now(); this.idle = 0; this.t = 0; this.auto = autoSpin && !reduced();
    this.ray = new THREE.Raycaster(); this.mouse = new THREE.Vector2(); this.hover = null;
    this._bind(); this._resize(); this.running = true;
    this.io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; if (this.visible) this._loop(); }, { threshold: .05 }); this.io.observe(el);
    this.ro = new ResizeObserver(() => this._resize()); this.ro.observe(el);
    this._vis = () => { if (!document.hidden) this._loop(); }; document.addEventListener('visibilitychange', this._vis);
  }
  _resize() {
    const w = this.el.clientWidth || 400, h = this.el.clientHeight || 300; this.renderer.setSize(w, h, false); this.cam.aspect = w / h;
    // Layar sempit: mundurkan kamera supaya semua objek tetap terlihat.
    const k = Math.max(1, 1.25 / Math.max(.6, w / h)); this.distK = k; this.cam.updateProjectionMatrix(); this._place(); this.renderer.render(this.scene, this.cam);
  }
  _place() {
    const d = this.baseDist * (this.distK || 1), p = this.pitch;
    const base = new THREE.Vector3().subVectors(this.cam.position, this.tgt).normalize();
    const el = Math.asin(Math.max(-.9, Math.min(.9, base.y)));
    const elev = Math.max(.05, Math.min(.75, (this._el0 ??= el) + p));
    this.cam.position.set(this.tgt.x + Math.sin(0) * d * Math.cos(elev), this.tgt.y + Math.sin(elev) * d, this.tgt.z + Math.cos(0) * d * Math.cos(elev));
    this.cam.lookAt(this.tgt); this.group.rotation.y = this.yaw;
  }
  _bind() {
    const cv = this.renderer.domElement;
    this.h = {
      down: e => { if (e.button !== 0) return; this.drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: false }; this.vel = 0; this.idle = 0; this.el.classList.add('is-drag'); this.el.classList.add('touched'); this._loop(); },
      move: e => {
        if (this.drag) {
          const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y; this.drag.x = e.clientX; this.drag.y = e.clientY;
          if (Math.abs(e.clientX - this.drag.sx) + Math.abs(e.clientY - this.drag.sy) > 6) { this.drag.moved = true; try { cv.setPointerCapture(e.pointerId); } catch {} }
          this.tyaw += dx * .0105; this.vel = dx * .0105; this.tpitch = Math.max(-.32, Math.min(.42, this.tpitch + dy * .004)); this.idle = 0; this._loop(); return;
        }
        if (e.pointerType === 'mouse') this._hover(e);
      },
      up: e => {
        if (!this.drag) return; const d = this.drag; this.drag = null; this.el.classList.remove('is-drag');
        if (!d.moved) { this._hover(e); if (this.hover && this.onPick) this.onPick(this.hover.userData.shape, this.hover); }
      },
      leave: () => { this._setHover(null); },
      key: e => { const k = e.key; if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(k)) return; e.preventDefault(); if (k === 'ArrowLeft') this.tyaw -= .35; if (k === 'ArrowRight') this.tyaw += .35; if (k === 'ArrowUp') this.tpitch = Math.min(.42, this.tpitch + .1); if (k === 'ArrowDown') this.tpitch = Math.max(-.32, this.tpitch - .1); this.idle = 0; this.el.classList.add('touched'); this._loop(); },
    };
    cv.addEventListener('pointerdown', this.h.down); window.addEventListener('pointermove', this.h.move, { passive: true }); window.addEventListener('pointerup', this.h.up); window.addEventListener('pointercancel', this.h.up);
    cv.addEventListener('pointerleave', this.h.leave); cv.addEventListener('keydown', this.h.key);
  }
  _hover(e) {
    const cv = this.renderer.domElement, r = cv.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return this._setHover(null);
    this.mouse.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    this.ray.setFromCamera(this.mouse, this.cam);
    const hit = this.ray.intersectObjects(this.group.userData.pick || [], false)[0];
    this._setHover(hit ? hit.object : null, e.clientX - r.left, e.clientY - r.top);
  }
  _setHover(o, x, y) {
    if (this.hover !== o) { this.hover = o; this.renderer.domElement.style.cursor = o && this.onPick ? 'pointer' : 'grab'; this._loop(); }
    if (this.tip) {
      if (o && o.userData.name) { this.tip.textContent = o.userData.name; this.tip.style.transform = `translate(${x + 14}px, ${y - 10}px)`; this.tip.hidden = false; }
      else this.tip.hidden = true;
    }
  }
  _loop() {
    if (this._raf || !this.running) return;
    this._raf = requestAnimationFrame(now => { this._raf = 0; this._frame(now); });
  }
  _frame(now) {
    const dt = Math.min(.05, (now - this.last) / 1000); this.last = now; this.t += dt; this.idle += dt;
    const still = reduced();
    if (!this.drag) { this.tyaw += this.vel; this.vel *= .9; if (Math.abs(this.vel) < .0002) this.vel = 0; }
    if (this.auto && !this.drag && this.idle > 2.5 && !this.hover) this.tyaw += dt * .22;
    if (!this.drag && this.idle > 2.5) this.tpitch *= .97;
    const ease = 1 - Math.pow(.0009, dt);
    this.yaw += (this.tyaw - this.yaw) * ease; this.pitch += (this.tpitch - this.pitch) * ease; this._place();
    (this.group.userData.pick || []).forEach(m => { const s = m === this.hover ? 1.07 : 1; m.scale.x += (s - m.scale.x) * ease; m.scale.y += (s - m.scale.y) * ease; m.scale.z += (s - m.scale.z) * ease; if (!m.userData.hot) { m.material = m === this.hover ? (this._hm ||= charMat().clone()) : charMat(); if (this._hm) this._hm.emissive.set('#3a5a40'), this._hm.emissiveIntensity = .35; } });
    (this.group.userData.anim || []).forEach(f => f(this.t, still));
    this.renderer.render(this.scene, this.cam);
    this._chips();
    const moving = Math.abs(this.tyaw - this.yaw) > .0005 || Math.abs(this.tpitch - this.pitch) > .0005 || this.vel;
    if (this.visible !== false && !document.hidden && (moving || this.auto || (this.group.userData.anim || []).length || this.drag)) this._loop();
  }
  _chips() {
    const a = this.group.userData.anchors; if (!a || !this.chips.length) return;
    const w = this.el.clientWidth, h = this.el.clientHeight, v = new THREE.Vector3();
    this.chips.forEach(c => {
      const p = a[c.dataset.anchor]; if (!p) return;
      v.copy(p).applyMatrix4(this.group.matrixWorld).project(this.cam);
      const x = (v.x * .5 + .5) * w, y = (-v.y * .5 + .5) * h, cw = c.offsetWidth, ch = c.offsetHeight;
      const left = Math.max(0, Math.min(w - cw, x - cw / 2)), top = Math.max(0, Math.min(h - ch, y - ch / 2));
      c.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
      const behind = v.z > 1 || (Math.cos(this.yaw % TAU) < -.35 && c.dataset.anchor === 'burn');
      c.style.opacity = behind ? .35 : 1;
    });
  }
  reset() { this.tyaw = Math.round(this.yaw / TAU) * TAU; this.tpitch = 0; this.vel = 0; this.idle = 0; this._loop(); }
  setAuto(on) { this.auto = !!on && !reduced(); this.idle = 3; this._loop(); }
  dispose() {
    this.running = false; cancelAnimationFrame(this._raf); this.io.disconnect(); this.ro.disconnect(); document.removeEventListener('visibilitychange', this._vis);
    const cv = this.renderer.domElement; window.removeEventListener('pointermove', this.h.move); window.removeEventListener('pointerup', this.h.up); window.removeEventListener('pointercancel', this.h.up);
    this.scene.traverse(o => { if (o.geometry) o.geometry.dispose(); });
    this.renderer.dispose(); cv.remove();
  }
}

/* --------------------------------------------------------------- public */
// Hero beranda: kemasan + briket 3D yang bisa diputar (seret), dengan chip info yang menempel pada objek.
export async function mountHero(el, info = {}) {
  try { await document.fonts.ready; } catch {}
  const group = heroGroup(info);
  const tip = el.querySelector('.stage3d-tip');
  const chips = [...el.parentElement.querySelectorAll('.float-chip[data-anchor]')];
  return new Stage(el, group, { camera: [0, 2.15, 7.3], target: [.05, 1.0, 0], fov: 30, label: info.aria || '', onPick: info.onPick, tip, chips, yaw: -.25 });
}
// Viewer produk di halaman detail.
export function mountViewer(el, p, info = {}) {
  const group = productGroup(p, { live: true });
  const box = new THREE.Box3().setFromObject(group), c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
  group.position.x -= c.x; group.position.z -= c.z;
  const d = Math.max(s.x * .95, s.y * 1.5) / (2 * Math.tan(THREE.MathUtils.degToRad(15))) + .6;
  return new Stage(el, group, { camera: [0, s.y * .55 + d * .42, d], target: [0, s.y * .35, 0], fov: 30, label: info.aria || '', tip: el.querySelector('.stage3d-tip'), onPick: info.onPick, yaw: -.35 });
}

// "Foto studio" untuk kartu katalog: render 3D sekali → gambar WebP (latar warna per bahan digambar 2D).
let PR = null;
const PAL = {
  'ampas-pala': ['#F8E6D2', '#EBC6A0', '#C8452F'], 'tempurung-kelapa': ['#F3E7DA', '#DCC0A2', '#8A5A35'], 'cangkang-sawit': ['#E6EEDD', '#C3D4AE', '#5A3A25'],
  'sekam-padi': ['#F8F0D2', '#EBD58E', '#B99236'], 'serbuk-gergaji': ['#F4E8D7', '#DFC29B', '#A97A44'], 'tongkol-jagung': ['#FBF3CF', '#F0D77A', '#C9962B'],
  'kulit-pinang': ['#FCE8D2', '#F2BF8A', '#D9822B'], 'campuran': ['#E4F1E7', '#B9D8C2', '#1F5C40'],
};
export const palette = k => PAL[k] || PAL.campuran;
function backdrop(x, w, h, kind, seed) {
  const [a, b, acc] = palette(kind), r = rnd(seed);
  const g = x.createLinearGradient(0, 0, w * .4, h); g.addColorStop(0, a); g.addColorStop(1, b); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.globalAlpha = .55; x.fillStyle = '#fff'; x.beginPath(); x.arc(w * .46, h * .44, h * .42, 0, TAU); x.fill();
  x.globalAlpha = .18; x.fillStyle = acc; x.beginPath(); x.arc(w * .86, h * .16, h * .13, 0, TAU); x.fill();
  x.globalAlpha = .12; for (let i = 0; i < 26; i++) { x.beginPath(); x.arc(r() * w, r() * h * .55, 1.5 + r() * 3.5, 0, TAU); x.fill(); }
  x.globalAlpha = .1; x.strokeStyle = '#fff'; x.lineWidth = w * .035;
  for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(w * (.05 + i * .09), 0); x.lineTo(w * (.32 + i * .09), h); x.stroke(); }
  x.globalAlpha = 1;
}
export async function photo(p, { w = 640, h = 480 } = {}) {
  if (!PR) {
    PR = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    PR.shadowMap.enabled = true; PR.shadowMap.type = THREE.PCFShadowMap; PR.toneMapping = THREE.ACESFilmicToneMapping; PR.toneMappingExposure = 1.08; PR.setClearColor(0, 0); PR.setPixelRatio(1);
  }
  PR.setSize(w, h, false);
  const scene = new THREE.Scene(); rig(scene); const group = productGroup(p); scene.add(group);
  (group.userData.anim || []).forEach(f => f(1.3, true));
  group.rotation.y = -.32;
  const box = new THREE.Box3().setFromObject(group), c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
  group.position.x -= c.x * .95; group.position.z -= c.z;
  const cam = new THREE.PerspectiveCamera(28, w / h, .1, 60), dist = Math.max(s.x / (w / h) * .86, s.y * 1.25) / (2 * Math.tan(THREE.MathUtils.degToRad(14))) + .3;
  cam.position.set(0, s.y * .45 + dist * .36, dist); cam.lookAt(0, s.y * .3, 0);
  PR.render(scene, cam);
  const out = canvas(w, h), x = out.getContext('2d'); backdrop(x, w, h, p.bahan, hash(p.id || p.name)); x.drawImage(PR.domElement, 0, 0);
  scene.traverse(o => { if (o.geometry) o.geometry.dispose(); });
  const url = out.toDataURL('image/webp', .86);
  return url.startsWith('data:image/webp') ? url : out.toDataURL('image/jpeg', .88);
}
