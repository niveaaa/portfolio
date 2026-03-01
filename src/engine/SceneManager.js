import * as THREE from 'three';

export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.008);

        // Structure registry for raycasting
        this.interactables = [];
        this.structureMap = new Map();
    }

    add(object) {
        this.scene.add(object);
    }

    remove(object) {
        this.scene.remove(object);
    }

    registerInteractable(mesh, id, label) {
        this.interactables.push(mesh);
        this.structureMap.set(mesh.uuid, { id, label });
    }

    getInteractableInfo(mesh) {
        return this.structureMap.get(mesh.uuid);
    }

    get instance() {
        return this.scene;
    }
}
