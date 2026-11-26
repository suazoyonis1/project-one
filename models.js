import * as THREE from 'three';
import { GLTFLoader } from './GLTFLoader.js';

const gltfLoader = new GLTFLoader();

function attachCustomGLTF(root, path, h) {
  gltfLoader.load(path, (g) => {
    const m = g.scene;
    const b = new THREE.Box3().setFromObject(m);
    m.scale.setScalar(h / (b.getSize(new THREE.Vector3()).y || 1));
    b.setFromObject(m);
    const c = b.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -b.min.y, -c.z);
    root.clear();
    root.add(m);
  });
}

function mat(color, roughness = 0.6) {
  return new THREE.MeshStandardMaterial({ color, roughness });
}

export function createCharacterMesh(type) {
  const root = new THREE.Group();
  const cfg = {
    luffy:  { skin: 0xf1c27d, shirt: 0xdc2626, pants: 0x2563eb, hair: 0x111827, hat: true },
    zoro:   { skin: 0xf1c27d, shirt: 0xf8fafc, pants: 0x14532d, hair: 0x16a34a, swords: true },
    nami:   { skin: 0xf5cba7, shirt: 0x38bdf8, pants: 0x1d4ed8, hair: 0xf97316, staff: true },
    sanji:  { skin: 0xf1c27d, shirt: 0x111827, pants: 0x111827, hair: 0xfacc15 },
    mayor:  { skin: 0xe0ac69, shirt: 0x65a30d, pants: 0x78350f, hair: 0xe2e8f0 },
    marine: { skin: 0xf1c27d, shirt: 0xf8fafc, pants: 0x1e3a8a, hair: 0x1f2937, cap: true },
    morgan: { skin: 0xe0ac69, shirt: 0x1e293b, pants: 0x0f172a, hair: 0xfacc15, axe: true, scale: 1.45 },
    pirate: { skin: 0xd2996c, shirt: 0x7f1d1d, pants: 0x292524, hair: 0x111827 }
  }[type] || { skin: 0xf1c27d, shirt: 0xf8fafc, pants: 0x1e3a8a, hair: 0x1f2937 };

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.5), mat(cfg.shirt));
  torso.position.y = 1.45;
  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.4), mat(cfg.pants));
  leftLeg.position.set(-0.22, 0.45, 0);
  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.4), mat(cfg.pants));
  rightLeg.position.set(0.22, 0.45, 0);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.65), mat(cfg.skin));
  head.position.y = 2.35;
  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.7), mat(cfg.hair));
  hair.position.y = 2.62;
  root.add(torso, leftLeg, rightLeg, head, hair);

  if (cfg.hat) {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.06, 20), mat(0xfacc15));
    brim.position.y = 2.72;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.28, 20), mat(0xfacc15));
    crown.position.y = 2.86;
    root.add(brim, crown);
  }
  root.scale.setScalar(cfg.scale || 1);
  if (type === 'luffy') attachCustomGLTF(root, './assets/luffy/scene.gltf', 3.2);
  return root;
}

export function createGoingMerryMesh() {
  const ship = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(5.5, 2.2, 13), mat(0x92400e));
  hull.position.y = 1.0;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(5.1, 0.2, 12.6), mat(0xd97706));
  deck.position.y = 2.15;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 11, 12), mat(0x78350f));
  mast.position.set(0, 7.2, 0.5);
  const sail = new THREE.Mesh(new THREE.BoxGeometry(6.2, 5.2, 0.15), mat(0xf8fafc));
  sail.position.set(0, 8.2, 0.8);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 16), mat(0xf8fafc));
  head.position.set(0, 2.7, 7.2);
  ship.add(hull, deck, mast, sail, head);
  return ship;
}
