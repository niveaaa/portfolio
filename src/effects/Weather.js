import * as THREE from 'three';

export class Weather {
    constructor(scene) {
        this.scene = scene;
        this.isRaining = false;
        this.rainGroup = null;
        this.fogDensityBase = 0.008;

        this._createRain();
    }

    _createRain() {
        const count = 3000;
        const positions = new Float32Array(count * 3);
        this.rainVelocities = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = Math.random() * 60;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
            this.rainVelocities[i] = 0.5 + Math.random() * 0.5;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        this.rainMaterial = new THREE.PointsMaterial({
            color: 0xaaaaee,
            size: 0.15,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        this.rain = new THREE.Points(geo, this.rainMaterial);
        this.scene.add(this.rain);
    }

    toggle() {
        this.isRaining = !this.isRaining;
        return this.isRaining;
    }

    update(time, deltaTime) {
        const targetOpacity = this.isRaining ? 0.5 : 0;
        this.rainMaterial.opacity += (targetOpacity - this.rainMaterial.opacity) * 0.05;

        if (this.rainMaterial.opacity > 0.01) {
            const pos = this.rain.geometry.attributes.position.array;
            for (let i = 0; i < this.rainVelocities.length; i++) {
                pos[i * 3 + 1] -= this.rainVelocities[i];
                if (pos[i * 3 + 1] < 0) {
                    pos[i * 3 + 1] = 50 + Math.random() * 10;
                    pos[i * 3] = (Math.random() - 0.5) * 100;
                    pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
                }
            }
            this.rain.geometry.attributes.position.needsUpdate = true;
        }

        // Fog adjustment
        const targetFogDensity = this.isRaining ? 0.02 : this.fogDensityBase;
        this.scene.fog.density += (targetFogDensity - this.scene.fog.density) * 0.02;
    }
}
