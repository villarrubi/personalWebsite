// Indexed Staunton meshes by clarkerubber (MIT), with locally authored wood materials.
import {loadStauntonGeometry,woodMaterial} from './staunton-assets.js';
export const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
export const startingPosition = ['black', 'white'].flatMap((side, index) =>
  [0, 1].flatMap(rank => Array.from({length: 8}, (_, file) => ({
    side, type: rank ? 'pawn' : backRank[file], file,
    row: index ? 7 - rank : rank,
  }))));

export async function createChessModel(T, {mobile = false} = {}) {
  const bodies = await loadStauntonGeometry(T);
  const root = new T.Group();
  const segments = mobile ? 40 : 64;
  const resources = new Set();
  const keep = resource => (resources.add(resource), resource);
  Object.values(bodies).forEach(keep);
  const boxwood = keep(woodMaterial(T,0xe1c39a,0xb88951));
  const walnut = keep(woodMaterial(T,0x70492c,0x29160d,{roughness:.43}));
  const frameMaterial = keep(woodMaterial(T,0x5b3520,0x26150d,{board:true,roughness:.38}));
  const veneer = keep(woodMaterial(T,0xd7b683,0x9c713e,{board:true}));
  const lightSquare = keep(woodMaterial(T,0xd1b484,0xac834f,{board:true,roughness:.44}));
  const darkSquare = keep(woodMaterial(T,0x775237,0x422717,{board:true,roughness:.44}));
  const felt = keep(new T.MeshStandardMaterial({color:0x24352b,roughness:.95}));
  function add(geometry, mat, parent = root, x = 0, y = 0, z = 0) {
    const mesh = new T.Mesh(geometry, mat); mesh.position.set(x, y, z);
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function roundBox(w, h, d, r) {
    const s = new T.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return keep(new T.ExtrudeGeometry(s, {depth:d, steps:1, bevelEnabled:true, bevelSize:.025, bevelThickness:.025, bevelSegments:3, curveSegments:12}));
  }
  const frame = add(roundBox(8.7, 8.7, .27, .08), frameMaterial);
  frame.rotation.x = -Math.PI / 2; frame.position.y = -.1;
  const trim = add(roundBox(8.74, 8.74, .025, .08), veneer);
  trim.rotation.x = -Math.PI / 2; trim.position.y = -.06;
  const square = keep(new T.BoxGeometry(.998, .055, .998));
  for (let row = 0; row < 8; row++) for (let file = 0; file < 8; file++) {
    add(square, (row + file) % 2 ? darkSquare : lightSquare, root, file - 3.5, .196, row - 3.5);
  }
  // Board coordinates are printed in the rim, not floating labels.
  const labelCanvas = document.createElement('canvas'); labelCanvas.width = labelCanvas.height = 1024;
  const labelCtx = labelCanvas.getContext('2d'); labelCtx.fillStyle = '#b8a886';
  labelCtx.font = '13px Georgia'; labelCtx.textAlign = 'center'; labelCtx.textBaseline = 'middle';
  for (let i = 0; i < 8; i++) {
    const p = ((i - 3.5) / 8.7 + .5) * 1024;
    labelCtx.fillText('abcdefgh'[i], p, 997); labelCtx.fillText('abcdefgh'[i], p, 27);
    labelCtx.fillText(String(8 - i), 27, p); labelCtx.fillText(String(8 - i), 997, p);
  }
  const labels = keep(new T.CanvasTexture(labelCanvas)); labels.colorSpace = T.SRGBColorSpace;
  const labelMat = keep(new T.MeshBasicMaterial({map:labels, transparent:true, depthWrite:false}));
  const labelPlane = add(keep(new T.PlaneGeometry(8.7, 8.7)), labelMat);
  labelPlane.rotation.x = -Math.PI / 2; labelPlane.position.y = .2; labelPlane.castShadow = false;

  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 128;
  const sctx = shadowCanvas.getContext('2d'), gradient = sctx.createRadialGradient(64,64,12,64,64,64);
  gradient.addColorStop(0,'rgba(0,0,0,.55)'); gradient.addColorStop(.5,'rgba(0,0,0,.3)'); gradient.addColorStop(1,'rgba(0,0,0,0)');
  sctx.fillStyle = gradient; sctx.fillRect(0,0,128,128);
  const shadowTexture = keep(new T.CanvasTexture(shadowCanvas));
  const shadowMaterial = keep(new T.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}));
  const shadowGeometry = keep(new T.PlaneGeometry(.86,.86));
  for (const {side,type,file,row} of startingPosition) {
    const group = new T.Group(); group.name = `${side}-${type}-${file}`;
    group.position.set(file - 3.5, .225, row - 3.5); root.add(group);
    const mat = side === 'white' ? boxwood : walnut;
    const piece=add(bodies[type],mat,group);
    // The carved heads face across the board; slight yaw shows their muzzle and mane.
    if(type==='knight')piece.rotation.y=side==='white'?Math.PI/2+.15:-Math.PI/2+.15;
    const contact = add(shadowGeometry, shadowMaterial, group,0,.002); contact.rotation.x = -Math.PI / 2; contact.castShadow = false;
    const radius=type==='pawn'?.237:.295;
    add(keep(new T.CylinderGeometry(radius,radius,.012,segments)),felt,group,0,.006);

  }
  return {root, dispose(){for(const resource of resources)resource.dispose();}};
}
