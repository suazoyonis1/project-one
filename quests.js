import * as THREE from 'three';
import { Enemy } from './entities.js';
export class QuestManager {
  constructor(scene, world, player, ship, npcs, enemies) {
    Object.assign(this, { scene, world, player, ship, npcs, enemies, step: 0, crates: 0, crew: ['Luffy'], spawned: false });
    this.quests = [
      { title: 'Mission 1: Romance Dawn', objective: 'Talk to Mayor Woop Slap [F].', waypoint: new THREE.Vector3(6,2.3,12) },
      { title: 'Mission 1: Supplies', objective: 'Collect 3 crates around Foosha Village.', waypoint: new THREE.Vector3(14,2.8,6) },
      { title: 'Mission 1: Set Sail!', objective: 'Board the Going Merry at the dock [F].', waypoint: new THREE.Vector3(0,1,74) },
      { title: 'Mission 2: Shells Town', objective: 'Sail southeast and defeat Captain Morgan!', waypoint: new THREE.Vector3(240,2.25,198) },
      { title: 'Mission 2: Recruit Zoro', objective: 'Talk to Roronoa Zoro [F].', waypoint: new THREE.Vector3(228,2.25,217) },
      { title: 'Mission 3: Baratie', objective: 'Sail southwest to Baratie and speak to Sanji.', waypoint: new THREE.Vector3(-230,4.0,244) },
      { title: 'Mission 3: Defend Baratie!', objective: 'Defeat the invading Krieg Pirates!', waypoint: new THREE.Vector3(-230,4.0,260) },
      { title: 'East Blue Complete!', objective: 'All East Blue missions cleared!', waypoint: new THREE.Vector3(0,0,0) }
    ];
    this.updateUI();
  }
  showBanner(t) { const b = document.getElementById('banner-alert'); b.textContent = t; b.classList.remove('hidden'); setTimeout(() => b.classList.add('hidden'), 3000); }
  onTalkToNPC(npc) {
    if (npc.id === 'mayor' && this.step === 0) { this.step = 1; this.updateUI(); }
    else if (npc.id === 'nami') { this.ship.chartBonus = 18; this.showBanner('Ship Speed Upgraded!'); }
    else if (npc.id === 'zoro' && this.step === 4) { this.crew.push('Zoro'); this.player.berries += 1500; this.step = 5; this.showBanner('Zoro Joined Your Crew!'); this.updateUI(); }
    else if (npc.id === 'sanji') {
      this.player.healFull(); this.showBanner('HP & Stamina Restored!');
      if (this.step === 5) {
        this.step = 6; this.spawned = true;
        [-10, 10].forEach((x, i) => this.enemies.push(new Enemy(this.scene, { id: `pirate_${i}`, name: 'Pirate', modelType: 'pirate', hp: 70, damage: 10, speed: 8, position: new THREE.Vector3(-230+x, 4.0, 270) })));
        this.updateUI();
      }
    }
  }
  update(pPos, isSailing) {
    if (this.step === 1) {
      this.world.supplyCrates.forEach(c => { if (!c.userData.collected && pPos.distanceTo(c.position) < 3.5) { c.userData.collected = true; c.visible = false; this.crates++; if (this.crates >= 3) { this.step = 2; this.updateUI(); } } });
    }
    if (this.step === 2 && isSailing) { this.step = 3; this.updateUI(); }
    if (this.step === 3 && this.enemies.find(e => e.id === 'morgan')?.dead) { this.step = 4; this.updateUI(); }
    if (this.step === 6 && this.spawned && this.enemies.filter(e => e.id.startsWith('pirate_')).every(e => e.dead)) { this.step = 7; this.crew.push('Sanji'); this.updateUI(); }
    document.getElementById('quest-distance').textContent = `Waypoint: ${Math.round(pPos.distanceTo(this.quests[this.step].waypoint))} m`;
    document.getElementById('crew-text').textContent = this.crew.join(', ');
  }
  updateUI() { document.getElementById('quest-title').textContent = this.quests[this.step].title; document.getElementById('quest-objective').textContent = this.quests[this.step].objective; }
}
