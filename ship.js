import * as THREE from 'three';
import { createGoingMerryMesh } from './models.js';
export class PirateShip {
  constructor(scene) { this.mesh = createGoingMerryMesh(); this.mesh.position.set(0, 0, 74); scene.add(this.mesh); this.speed = 0; this.chartBonus = 0; this.isControlled = false; }
  canBoard(p) { return p.distanceTo(this.mesh.position) < 15; }
  update(dt, keys, world) {
    if (!this.isControlled) { this.speed *= 0.92; return; }
    if (keys['KeyW']) this.speed = Math.min(42 + this.chartBonus, this.speed + 28 * dt);
    else if (keys['KeyS']) this.speed = Math.max(-14, this.speed - 24 * dt);
    else this.speed *= 0.985;
    if (Math.abs(this.speed) > 0.5) { if (keys['KeyA']) this.mesh.rotation.y += 1.35 * dt; if (keys['KeyD']) this.mesh.rotation.y -= 1.35 * dt; }
    const fwd = new THREE.Vector3(Math.sin(this.mesh.rotation.y), 0, Math.cos(this.mesh.rotation.y));
    this.mesh.position.addScaledVector(fwd, this.speed * dt);
  }
}
