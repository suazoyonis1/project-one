import * as THREE from 'three';
import { createCharacterMesh } from './models.js';
export class NPC {
  constructor(scene, c) { Object.assign(this, c); this.mesh = createCharacterMesh(c.modelType); this.mesh.position.copy(c.position); scene.add(this.mesh); }
}
export class Enemy {
  constructor(scene, c) { Object.assign(this, c); this.scene = scene; this.dead = false; this.cd = 0; this.mesh = createCharacterMesh(c.modelType); this.mesh.position.copy(c.position); scene.add(this.mesh); }
  takeDamage(amt, kb) { if (this.dead) return; this.hp -= amt; if (kb) this.mesh.position.addScaledVector(kb, 1.5); if (this.hp <= 0) { this.dead = true; this.mesh.rotation.x = -Math.PI/2; setTimeout(() => this.scene.remove(this.mesh), 2000); } }
  update(dt, p) {
    if (this.dead) return; this.cd = Math.max(0, this.cd - dt);
    const d = this.mesh.position.distanceTo(p.mesh.position);
    if (d < 28) {
      const dir = p.mesh.position.clone().sub(this.mesh.position); dir.y = 0; dir.normalize();
      if (d > 2.6) this.mesh.position.addScaledVector(dir, this.speed * dt);
      else if (this.cd <= 0) { this.cd = 1.5; p.takeDamage(this.damage); }
    }
  }
}
export function spawnWorldEntities(scene) {
  return {
    npcs: [
      new NPC(scene, { id: 'mayor', name: 'Mayor Woop Slap', role: 'Mayor', modelType: 'mayor', position: new THREE.Vector3(6,2.3,12), dialogue: ['Gather the 3 supply crates in Foosha Village, then board the Going Merry at the southern dock!'] }),
      new NPC(scene, { id: 'nami', name: 'Nami', role: 'Navigator', modelType: 'nami', position: new THREE.Vector3(16,2.3,30), dialogue: ['I upgraded your sea charts! Your ship sails faster now!'] }),
      new NPC(scene, { id: 'zoro', name: 'Roronoa Zoro', role: 'Swordsman', modelType: 'zoro', position: new THREE.Vector3(228,2.25,217), dialogue: ['You beat Captain Morgan! Count me in your crew, Luffy!'] }),
      new NPC(scene, { id: 'sanji', name: 'Sanji', role: 'Chef', modelType: 'sanji', position: new THREE.Vector3(-230,4.0,244), dialogue: ['Eat up! Full HP restored—now help me beat these pirate raiders!'] })
    ],
    enemies: [
      new Enemy(scene, { id: 'm1', name: 'Marine', modelType: 'marine', hp: 50, damage: 8, speed: 7, position: new THREE.Vector3(226,2.25,202) }),
      new Enemy(scene, { id: 'morgan', name: 'Captain Morgan', modelType: 'morgan', isBoss: true, hp: 160, damage: 16, speed: 8.5, position: new THREE.Vector3(240,2.25,198) })
    ]
  };
}
