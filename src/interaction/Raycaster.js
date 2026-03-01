import * as THREE from 'three';

export class Raycaster {
    constructor(camera, sceneManager, panels, achievements, audioManager) {
        this.camera = camera;
        this.sceneManager = sceneManager;
        this.panels = panels;
        this.achievements = achievements;
        this.audio = audioManager;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.enabled = true;

        // Hover label
        this.hoverLabel = document.createElement('div');
        this.hoverLabel.id = 'hover-label';
        document.body.appendChild(this.hoverLabel);

        this.hoveredObject = null;

        // Click handler — works in both pointer-lock and free mode
        window.addEventListener('click', (e) => this._onClick(e));
        window.addEventListener('mousemove', (e) => this._onMouseMove(e));
    }

    _onClick(e) {
        if (this.panels.isOpen) return;
        if (!this.enabled) return;
        if (this.panels.closeCooldown) return;

        // In pointer lock, cast from center. Otherwise from mouse position
        if (this.camera.isPointerLocked) {
            this.mouse.set(0, 0);
        } else {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        }

        this.raycaster.setFromCamera(this.mouse, this.camera.instance);
        const hits = this.raycaster.intersectObjects(this.sceneManager.interactables);

        if (hits.length > 0) {
            const info = this.sceneManager.getInteractableInfo(hits[0].object);
            if (info) {
                this.audio.playClick();
                this.panels.open(info.id);
                this.achievements.trackVisit(info.id);
            }
        }
    }

    _onMouseMove(e) {
        if (this.camera.isPointerLocked) {
            this.mouse.set(0, 0);
        } else {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        }

        this.raycaster.setFromCamera(this.mouse, this.camera.instance);
        const hits = this.raycaster.intersectObjects(this.sceneManager.interactables);

        if (hits.length > 0) {
            const info = this.sceneManager.getInteractableInfo(hits[0].object);
            if (info) {
                this.hoverLabel.textContent = info.label;
                this.hoverLabel.classList.add('visible');
                document.body.style.cursor = 'pointer';
                this.hoveredObject = hits[0].object;
                return;
            }
        }

        this.hoverLabel.classList.remove('visible');
        document.body.style.cursor = 'default';
        this.hoveredObject = null;
    }
}
