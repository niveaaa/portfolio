import * as THREE from 'three';

export class Camera {
    constructor(renderer) {
        this.camera = new THREE.PerspectiveCamera(
            65,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 18, 40);
        this.camera.lookAt(0, 5, 0);

        // Movement state
        this.keys = {};
        this.moveSpeed = 0.7;
        this.lookSpeed = 0.003;
        this.isPointerLocked = false;
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.euler.setFromQuaternion(this.camera.quaternion);
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.targetY = this.camera.position.y;

        // Smooth auto-orbit when not in pointer lock
        this.autoOrbit = true;
        this.orbitAngle = 0;
        this.orbitRadius = 45;
        this.orbitCenter = new THREE.Vector3(0, 0, 0);
        this.orbitHeight = 22;
        this.orbitSpeed = 0.08;

        this._setupControls(renderer);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });
    }

    _setupControls(renderer) {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (this.isPointerLocked) e.preventDefault();
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Pointer lock — only via dedicated button, not canvas click
        this.canvas = renderer.domElement;
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === this.canvas;
            if (this.isPointerLocked) {
                this.autoOrbit = false;
                this.euler.setFromQuaternion(this.camera.quaternion);
            } else {
                this.autoOrbit = true;
            }
        });
        document.addEventListener('mousemove', (e) => {
            if (!this.isPointerLocked) return;
            this.euler.y -= e.movementX * this.lookSpeed;
            this.euler.x -= e.movementY * this.lookSpeed;
            this.euler.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.euler.x));
            this.camera.quaternion.setFromEuler(this.euler);
        });

        // Scroll zoom when not locked
        this.canvas.addEventListener('wheel', (e) => {
            if (this.isPointerLocked) return;
            this.orbitRadius = Math.max(15, Math.min(80, this.orbitRadius + e.deltaY * 0.05));
        }, { passive: true });

        // ESC release
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.isPointerLocked) {
                document.exitPointerLock();
                this.autoOrbit = true;
            }
        });
    }

    update(delta) {
        if (this.isPointerLocked) {
            this._updateFirstPerson(delta);
        } else if (this.autoOrbit) {
            this._updateOrbit(delta);
        }
    }

    _updateFirstPerson(delta) {
        const speed = this.moveSpeed;
        this.direction.set(0, 0, 0);

        if (this.keys['KeyW'] || this.keys['ArrowUp']) this.direction.z -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) this.direction.z += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) this.direction.x -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) this.direction.x += 1;

        this.direction.normalize();
        this.direction.applyQuaternion(this.camera.quaternion);
        this.direction.y = 0;
        this.direction.normalize();

        this.camera.position.addScaledVector(this.direction, speed);

        // Clamp to world bounds
        const bound = 70;
        this.camera.position.x = Math.max(-bound, Math.min(bound, this.camera.position.x));
        this.camera.position.z = Math.max(-bound, Math.min(bound, this.camera.position.z));

        // Keep at fixed height with gentle bob
        this.camera.position.y = 12 + Math.sin(Date.now() * 0.003) * 0.15;
    }

    _updateOrbit(delta) {
        this.orbitAngle += this.orbitSpeed * delta;
        const x = this.orbitCenter.x + Math.cos(this.orbitAngle) * this.orbitRadius;
        const z = this.orbitCenter.z + Math.sin(this.orbitAngle) * this.orbitRadius;

        this.camera.position.lerp(
            new THREE.Vector3(x, this.orbitHeight, z),
            0.02
        );
        this.camera.lookAt(this.orbitCenter.x, 5, this.orbitCenter.z);
    }

    enterFirstPerson() {
        if (!this.isPointerLocked && this.canvas) {
            this.canvas.requestPointerLock();
        }
    }

    exitFirstPerson() {
        if (this.isPointerLocked) {
            document.exitPointerLock();
        }
    }

    get instance() {
        return this.camera;
    }
}
