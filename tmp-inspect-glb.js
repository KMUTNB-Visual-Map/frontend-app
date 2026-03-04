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

  const rotatedNodes = [];
  nodes.forEach((n, i) => {
    const r = n.rotation;
    if (Array.isArray(r)) {
      const isIdentity = Math.abs(r[0]) < 1e-6 && Math.abs(r[1]) < 1e-6 && Math.abs(r[2]) < 1e-6 && Math.abs(r[3] - 1) < 1e-6;
      if (!isIdentity) {
        rotatedNodes.push({ index: i, name: n.name || null, rotation: r });
      }
    }
    if (Array.isArray(n.matrix)) {
      rotatedNodes.push({ index: i, name: n.name || null, matrix: n.matrix });
    }
  });

  out.nonIdentityTransforms = rotatedNodes.slice(0, 20);
  out.nonIdentityCount = rotatedNodes.length;
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
  console.log('nonIdentityCount:', info.nonIdentityCount);
  if (info.nonIdentityTransforms.length) {
    console.log('sampleNonIdentity:', JSON.stringify(info.nonIdentityTransforms, null, 2));
  }
}
