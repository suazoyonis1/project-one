import * as THREE from 'three';
export class World {
  constructor(scene) {
    this.scene = scene; this.islands = []; this.supplyCrates = []; this.waterTime = 0;
    this.scene.background = new THREE.Color(0x60a5fa);
    this.scene.fog = new THREE.FogExp2(0x93c5fd, 0.0014);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x1d4ed8, 0.95));
    const sun = new THREE.DirectionalLight(0xfffbeb, 1.4); sun.position.set(120, 220, 100); sun.castShadow = true; this.scene.add(sun);
    const wGeo = new THREE.PlaneGeometry(2400, 2400, 64, 64); wGeo.rotateX(-Math.PI / 2);
    this.oceanMesh = new THREE.Mesh(wGeo, new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25, flatShading: true }));
    this.scene.add(this.oceanMesh);
    this.addIsland('foosha', 'Foosha Village', new THREE.Vector3(0,0,0), 48, 0x22c55e, 2.3);
    this.addIsland('shells', 'Shells Town (Marine Base)', new THREE.Vector3(240,0,210), 58, 0xd6d3d1, 2.25);
    this.addIsland('baratie', 'Baratie (Sea Restaurant)', new THREE.Vector3(-230,0,260), 36, 0x38bdf8, 4.0);
    [new THREE.Vector3(14,2.8,6), new THREE.Vector3(-12,2.8,12), new THREE.Vector3(4,2.8,22)].forEach((p, idx) => {
      const c = new THREE.Mesh(new THREE.BoxGeometry(1.8,1.8,1.8), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
      c.position.copy(p); c.userData = { id: idx, collected: false }; this.scene.add(c); this.supplyCrates.push(c);
    });
  }
  addIsland(id, name, center, radius, color, groundY) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius+5, groundY*2, 32), new THREE.MeshStandardMaterial({ color }));
    m.position.set(center.x, 0, center.z); m.receiveShadow = true; this.scene.add(m);
    this.islands.push({ id, name, center, radius, groundY });
  }
  getIslandAt(pos) { return this.islands.find(i => Math.hypot(pos.x - i.center.x, pos.z - i.center.z) <= i.radius) || null; }
  update(dt) { this.waterTime += dt; }
}
