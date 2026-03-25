const fs = require('fs');
const path = require('path');

function readGlbJson(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.readUInt32LE(0) !== 0x46546c67 || buf.readUInt32LE(4) !== 2) throw new Error('not glb2');
  let off = 12;
  const len = buf.readUInt32LE(off); off += 4;
  const type = buf.readUInt32LE(off); off += 4;
  if (type !== 0x4E4F534A) throw new Error('no json chunk');
  return JSON.parse(buf.slice(off, off + len).toString('utf8'));
}

function isIdentityQ(r){
  return Array.isArray(r) && Math.abs(r[0])<1e-6 && Math.abs(r[1])<1e-6 && Math.abs(r[2])<1e-6 && Math.abs(r[3]-1)<1e-6;
}
function isZero3(t){
  return Array.isArray(t) && Math.abs(t[0])<1e-6 && Math.abs(t[1])<1e-6 && Math.abs(t[2])<1e-6;
}
function isOne3(s){
  return Array.isArray(s) && Math.abs(s[0]-1)<1e-6 && Math.abs(s[1]-1)<1e-6 && Math.abs(s[2]-1)<1e-6;
}

const dir = path.join(process.cwd(),'public','models');
const files = fs.readdirSync(dir).filter(f=>/^archif\d+\.glb$/i.test(f)).sort();

for (const f of files){
  const gltf = readGlbJson(path.join(dir,f));
  const nodes = gltf.nodes || [];
  const sceneIdx = gltf.scene ?? 0;
  const rootIdxs = (gltf.scenes?.[sceneIdx]?.nodes) || [];
  console.log(`=== ${f} ===`);
  console.log(`defaultScene=${sceneIdx}, rootCount=${rootIdxs.length}`);
  rootIdxs.forEach((idx,i)=>{
    const n = nodes[idx] || {};
    const t = n.translation || [0,0,0];
    const r = n.rotation || [0,0,0,1];
    const s = n.scale || [1,1,1];
    console.log(`root[${i}] idx=${idx} name=${n.name||'(unnamed)'}`);
    console.log(`  t=${JSON.stringify(t)} nonZeroT=${!isZero3(t)}`);
    console.log(`  r=${JSON.stringify(r)} nonIdentityR=${!isIdentityQ(r)}`);
    console.log(`  s=${JSON.stringify(s)} nonOneS=${!isOne3(s)}`);
    if (Array.isArray(n.matrix)) {
      console.log(`  matrix=${JSON.stringify(n.matrix)}`);
    }
  });

  const rootHasNonIdentityRotation = rootIdxs.some((idx)=>{
    const r = nodes[idx]?.rotation || [0,0,0,1];
    return !isIdentityQ(r);
  });
  console.log(`rootHasNonIdentityRotation=${rootHasNonIdentityRotation}`);

  const anyMatrix = nodes.some(n=>Array.isArray(n.matrix));
  console.log(`anyNodeHasMatrix=${anyMatrix}`);
}
