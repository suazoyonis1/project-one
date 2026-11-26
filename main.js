import * as THREE from 'three';
import { World } from './world.js';
import { PlayerController } from './player.js';
import { PirateShip } from './ship.js';
import { spawnWorldEntities } from './entities.js';
import { QuestManager } from './quests.js';

class OnePieceGame {
  constructor() {
    const c = document.getElementById('game-canvas');
    this.renderer = new THREE.WebGLRenderer({ canvas: c, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 1200);
    this.world = new World(this.scene);
    this.player = new PlayerController(this.scene, this.camera);
    this.ship = new PirateShip(this.scene);
    const { npcs, enemies } = spawnWorldEntities(this.scene);
    this.npcs = npcs; this.enemies = enemies;
    this.qm = new QuestManager(this.scene, this.world, this.player, this.ship, this.npcs, this.enemies);
    this.keys = {}; this.isSailing = false; this.dlg = null; this.clock = new THREE.Clock();
    this.bindEvents(); this.animate();
  }
  bindEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (this.dlg && (e.code === 'KeyF' || e.code === 'Space')) {
        const n = this.dlg; this.dlg = null;
        document.getElementById('dialogue-box').classList.add('hidden');
        this.qm.onTalkToNPC(n); return;
      }
      if (e.code === 'KeyF') this.interact();
      if (!this.isSailing && e.code === 'KeyQ') this.player.useGomuPistol(this.enemies);
      if (!this.isSailing && e.code === 'KeyE') this.player.useGomuGatling(this.enemies);
    });
    window.addEventListener('keyup', e => this.keys[e.code] = false);
    window.addEventListener('mousedown', e => {
      if (e.button === 0 && !this.dlg && !this.isSailing) this.player.performMeleeCombo(this.enemies);
    });
  }
  interact() {
    if (this.isSailing) {
      const isl = this.world.islands.find(i => Math.hypot(this.ship.mesh.position.x - i.center.x, this.ship.mesh.position.z - i.center.z) <= i.radius + 28);
      if (isl) { this.isSailing = false; this.ship.isControlled = false; this.player.mesh.position.set(isl.center.x, isl.groundY, isl.center.z + isl.radius - 8); }
      return;
    }
    const npc = this.npcs.find(n => this.player.mesh.position.distanceTo(n.mesh.position) < 5);
    if (npc) {
      this.dlg = npc;
      document.getElementById('dialogue-speaker').textContent = npc.name;
      document.getElementById('dialogue-role').textContent = npc.role;
      document.getElementById('dialogue-text').textContent = Array.isArray(npc.dialogue) ? npc.dialogue.join(' ') : npc.dialogue;
      document.getElementById('dialogue-box').classList.remove('hidden');
      return;
    }
    if (this.ship.canBoard(this.player.mesh.position)) { this.isSailing = true; this.ship.isControlled = true; }
  }
  animate() {
    requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.world.update(dt); this.ship.update(dt,this.keys,this.world);
    this.player.update(dt,this.keys,this.world,this.isSailing,this.ship);
    if (!this.isSailing && !this.dlg) this.enemies.forEach(e => e.update(dt,this.player));
    this.qm.update(this.player.mesh.position,this.isSailing);
    document.getElementById('hp-bar').style.width = `${this.player.hp}%`;
    document.getElementById('stamina-bar').style.width = `${this.player.stamina}%`;
    document.getElementById('hp-text').textContent = `${Math.ceil(this.player.hp)} / ${this.player.maxHp}`;
    document.getElementById('stamina-text').textContent = `${Math.ceil(this.player.stamina)} / ${this.player.maxStamina}`;
    document.getElementById('berries-text').textContent = `B ${this.player.berries}`;
    document.getElementById('cd-q').style.height = `${(this.player.cdPistol / 2.5) * 100}%`;
    document.getElementById('cd-e').style.height = `${(this.player.cdGatling / 5) * 100}%`;
    this.renderer.render(this.scene,this.camera);
  }
}
new OnePieceGame();
