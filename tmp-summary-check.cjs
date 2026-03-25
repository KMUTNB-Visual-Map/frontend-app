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

const dir = path.join(process.cwd(),'public','models');
const files = fs.readdirSync(dir).filter(f=>/^archif\d+\.glb$/i.test(f)).sort();
for (const f of files){
  const gltf = readGlbJson(path.join(dir,f));
  const nodes = gltf.nodes || [];
  const sceneIdx = gltf.scene ?? 0;
  const rootIdxs = (gltf.scenes?.[sceneIdx]?.nodes) || [];
  let rootRot = 0;
  let rootMatrix = 0;
  const examples = [];
  for (const idx of rootIdxs){
    const n = nodes[idx] || {};
    if (Array.isArray(n.matrix)) rootMatrix++;
    const r = n.rotation || [0,0,0,1];
    if (!isIdentityQ(r)) {
      rootRot++;
      if (examples.length < 3) examples.push(`${n.name||'unnamed'}:${JSON.stringify(r)}`);
    }
  }
  console.log(`${f} | rootCount=${rootIdxs.length} | rootNonIdentityRotation=${rootRot} | rootMatrix=${rootMatrix} | anyNodeMatrix=${nodes.some(n=>Array.isArray(n.matrix))} | examples=${examples.join(' ; ')}`);
}
