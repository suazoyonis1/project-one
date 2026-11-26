import * as THREE from 'three';
import { createCharacterMesh } from './models.js';

export class PlayerController {
  constructor(scene, camera) {
    this.scene = scene; this.camera = camera;
    this.mesh = createCharacterMesh('luffy');
    this.mesh.position.set(0, 2.3, 18);
    this.scene.add(this.mesh);
    this.hp = 100; this.maxHp = 100; this.stamina = 100; this.maxStamina = 100; this.berries = 500;
    this.velocity = new THREE.Vector3(); this.isGrounded = true;
    this.camYaw = Math.PI; this.camPitch = 0.32;
    this.attackTimer = 0; this.cdPistol = 0; this.cdGatling = 0; this.staminaRegenDelay = 0;
  }
  healFull() { this.hp = this.maxHp; this.stamina = this.maxStamina; }
  takeDamage(amt) { this.hp = Math.max(0, this.hp - amt); if (this.hp === 0) { this.healFull(); this.mesh.position.set(0, 2.3, 18); } }
  performMeleeCombo(enemies) {
    if (this.attackTimer > 0) return; this.attackTimer = 0.28;
    const fwd = new THREE.Vector3(Math.sin(this.mesh.rotation.y), 0, Math.cos(this.mesh.rotation.y));
    enemies.forEach(e => { if (!e.dead && e.mesh.position.distanceTo(this.mesh.position) < 4) e.takeDamage(22, fwd); });
  }
  useGomuPistol(enemies) {
    if (this.cdPistol > 0 || this.stamina < 20) return; this.stamina -= 20; this.staminaRegenDelay = 0.8; this.cdPistol = 2.5;
    const fwd = new THREE.Vector3(Math.sin(this.mesh.rotation.y), 0, Math.cos(this.mesh.rotation.y));
    enemies.forEach(e => { if (!e.dead && e.mesh.position.distanceTo(this.mesh.position) < 18) e.takeDamage(45, fwd); });
  }
  useGomuGatling(enemies) {
    if (this.cdGatling > 0 || this.stamina < 35) return; this.stamina -= 35; this.staminaRegenDelay = 0.8; this.cdGatling = 5.0;
    const fwd = new THREE.Vector3(Math.sin(this.mesh.rotation.y), 0, Math.cos(this.mesh.rotation.y));
    enemies.forEach(e => { if (!e.dead && e.mesh.position.distanceTo(this.mesh.position) < 14) e.takeDamage(70, fwd); });
  }
  update(dt, keys, world, isSailing, ship) {
    this.cdPistol = Math.max(0, this.cdPistol - dt); this.cdGatling = Math.max(0, this.cdGatling - dt); this.attackTimer = Math.max(0, this.attackTimer - dt);
    if (isSailing) {
      this.mesh.position.copy(ship.mesh.position).add(new THREE.Vector3(0, 2.25, -2.5));
      this.mesh.rotation.y = ship.mesh.rotation.y;
      const targetYaw = ship.mesh.rotation.y + Math.PI;
      this.camYaw += Math.atan2(Math.sin(targetYaw - this.camYaw), Math.cos(targetYaw - this.camYaw)) * Math.min(1, dt * 6);
      this.updateCamera(ship.mesh.position, 22);
      return;
    }
    // A/D turns Luffy left & right; W/S moves forward & backward where Luffy points
    const turnSpeed = 2.8;
    if (keys['KeyA']) this.mesh.rotation.y += turnSpeed * dt;
    if (keys['KeyD']) this.mesh.rotation.y -= turnSpeed * dt;

    const fwd = new THREE.Vector3(Math.sin(this.mesh.rotation.y), 0, Math.cos(this.mesh.rotation.y));
    const moving = keys['KeyW'] || keys['KeyS'];
    const sprinting = keys['ShiftLeft'] && keys['KeyW'] && this.stamina > 0;
    const speed = sprinting ? 24 : 14;
    if (sprinting) {
      this.stamina = Math.max(0, this.stamina - 24 * dt);
      this.staminaRegenDelay = 0.8;
    } else {
      this.staminaRegenDelay = Math.max(0, this.staminaRegenDelay - dt);
      if (this.staminaRegenDelay === 0) {
        this.stamina = Math.min(this.maxStamina, this.stamina + 18 * dt);
      }
    }
    if (keys['KeyW']) this.mesh.position.addScaledVector(fwd, -speed * dt);
    if (keys['KeyS']) this.mesh.position.addScaledVector(fwd, speed * 0.65 * dt);

    // Camera automatically turns behind Luffy wherever he is pointing
    const targetYaw = this.mesh.rotation.y;
    this.camYaw += Math.atan2(Math.sin(targetYaw - this.camYaw), Math.cos(targetYaw - this.camYaw)) * Math.min(1, dt * 7);

    if (keys['Space'] && this.isGrounded) { this.velocity.y = 18; this.isGrounded = false; }
    this.velocity.y -= 45 * dt; this.mesh.position.y += this.velocity.y * dt;
    const isl = world.getIslandAt(this.mesh.position), floorY = isl ? isl.groundY : 0.2;
    if (this.mesh.position.y <= floorY) { this.mesh.position.y = floorY; this.velocity.y = 0; this.isGrounded = true; }
    this.updateCamera(this.mesh.position, 11);
  }
  updateCamera(t, d) {
    this.camera.position.lerp(new THREE.Vector3(t.x - Math.sin(this.camYaw)*Math.cos(this.camPitch)*d, t.y + Math.sin(this.camPitch)*d + 2.5, t.z - Math.cos(this.camYaw)*Math.cos(this.camPitch)*d), 0.2);
    this.camera.lookAt(t.x, t.y + 2.2, t.z);
  }
}
