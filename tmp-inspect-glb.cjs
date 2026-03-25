const fs = require('fs');
const path = require('path');

function readGlbJson(filePath) {
  const buf = fs.readFileSync(filePath);
  const magic = buf.readUInt32LE(0);
  const version = buf.readUInt32LE(4);
  if (magic !== 0x46546C67 || version !== 2) {
    throw new Error(`Not GLB v2: ${filePath}`);
  }
  let offset = 12;
  const jsonLength = buf.readUInt32LE(offset); offset += 4;
  const jsonType = buf.readUInt32LE(offset); offset += 4;
  if (jsonType !== 0x4E4F534A) {
    throw new Error(`First chunk not JSON: ${filePath}`);
  }
  const jsonText = buf.slice(offset, offset + jsonLength).toString('utf8');
  return JSON.parse(jsonText);
}

function summarize(filePath) {
  const gltf = readGlbJson(filePath);
  const scenes = gltf.scenes || [];
  const nodes = gltf.nodes || [];
  const defaultSceneIndex = gltf.scene ?? 0;
  const rootNodeIndices = scenes[defaultSceneIndex]?.nodes || [];

  const out = {
    file: path.basename(filePath),
    defaultScene: defaultSceneIndex,
    rootNodes: rootNodeIndices.map((i) => {
      const n = nodes[i] || {};
      return {
        index: i,
        name: n.name || null,
        hasMatrix: Array.isArray(n.matrix),
        translation: n.translation || [0,0,0],
        rotation: n.rotation || [0,0,0,1],
        scale: n.scale || [1,1,1],
      };
    }),
  };

  const transformedNodes = [];
  nodes.forEach((n, i) => {
    const t = n.translation;
    const r = n.rotation;
    const s = n.scale;
    const hasMatrix = Array.isArray(n.matrix);

    const tNonIdentity = Array.isArray(t) && (Math.abs(t[0]) > 1e-6 || Math.abs(t[1]) > 1e-6 || Math.abs(t[2]) > 1e-6);
    const rNonIdentity = Array.isArray(r) && !(Math.abs(r[0]) < 1e-6 && Math.abs(r[1]) < 1e-6 && Math.abs(r[2]) < 1e-6 && Math.abs(r[3] - 1) < 1e-6);
    const sNonIdentity = Array.isArray(s) && !(Math.abs(s[0] - 1) < 1e-6 && Math.abs(s[1] - 1) < 1e-6 && Math.abs(s[2] - 1) < 1e-6);

    if (hasMatrix || tNonIdentity || rNonIdentity || sNonIdentity) {
      transformedNodes.push({
        index: i,
        name: n.name || null,
        translation: t || [0,0,0],
        rotation: r || [0,0,0,1],
        scale: s || [1,1,1],
        hasMatrix,
      });
    }
  });

  out.transformedCount = transformedNodes.length;
  out.transformedSample = transformedNodes.slice(0, 30);
  return out;
}

const dir = path.join(process.cwd(), 'public', 'models');
const files = fs.readdirSync(dir).filter((f) => /^archif\d+\.glb$/i.test(f)).sort();
for (const f of files) {
  const info = summarize(path.join(dir, f));
  console.log('---');
  console.log(info.file);
  console.log('defaultScene:', info.defaultScene);
  console.log('rootNodes:', JSON.stringify(info.rootNodes, null, 2));
  console.log('transformedCount:', info.transformedCount);
  console.log('transformedSample:', JSON.stringify(info.transformedSample, null, 2));
}
