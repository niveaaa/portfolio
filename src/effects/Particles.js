import * as THREE from 'three';

export class Particles {
    constructor(scene) {
        this.scene = scene;

        // Floating dust motes (daytime)
        this._createDust();

        // Fireflies (nighttime)
        this._createFireflies();

        // Portal glow particles
        this._createPortalParticles();
    }

    _createDust() {
        const count = 200;
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 1] = 2 + Math.random() * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
            velocities.push({
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.02,
            });
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        this.dustMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.3,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        this.dust = new THREE.Points(geo, this.dustMaterial);
        this.dustVelocities = velocities;
        this.scene.add(this.dust);
    }

    _createFireflies() {
        const count = 50;
        const positions = new Float32Array(count * 3);
        this.fireflyData = [];

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 60;
            const y = 3 + Math.random() * 8;
            const z = (Math.random() - 0.5) * 60;
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            this.fireflyData.push({
                baseX: x, baseY: y, baseZ: z,
                phase: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 1.5,
                radius: 1 + Math.random() * 2,
            });
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        this.fireflyMaterial = new THREE.PointsMaterial({
            color: 0x88ff44,
            size: 0.6,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        this.fireflies = new THREE.Points(geo, this.fireflyMaterial);
        this.scene.add(this.fireflies);
    }

    _createPortalParticles() {
        const count = 40;
        const positions = new Float32Array(count * 3);
        this.portalData = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = 18;
            positions[i * 3 + 1] = 3 + Math.random() * 4;
            positions[i * 3 + 2] = 18 + (Math.random() - 0.5) * 3;
            this.portalData.push({
                phase: Math.random() * Math.PI * 2,
                speed: 1 + Math.random() * 2,
                radius: 0.5 + Math.random() * 1.5,
            });
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: 0xaa66ff,
            size: 0.5,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        this.portalParticles = new THREE.Points(geo, mat);
        this.scene.add(this.portalParticles);
    }

    update(time, isNight) {
        // Dust
        const dustPos = this.dust.geometry.attributes.position.array;
        for (let i = 0; i < this.dustVelocities.length; i++) {
            const v = this.dustVelocities[i];
            dustPos[i * 3] += v.x + Math.sin(time + i) * 0.005;
            dustPos[i * 3 + 1] += v.y + Math.sin(time * 0.5 + i * 0.3) * 0.005;
            dustPos[i * 3 + 2] += v.z + Math.cos(time + i * 0.7) * 0.005;

            // Wrap around
            if (dustPos[i * 3] > 40) dustPos[i * 3] = -40;
            if (dustPos[i * 3] < -40) dustPos[i * 3] = 40;
            if (dustPos[i * 3 + 1] > 25) dustPos[i * 3 + 1] = 2;
            if (dustPos[i * 3 + 1] < 2) dustPos[i * 3 + 1] = 25;
            if (dustPos[i * 3 + 2] > 40) dustPos[i * 3 + 2] = -40;
            if (dustPos[i * 3 + 2] < -40) dustPos[i * 3 + 2] = 40;
        }
        this.dust.geometry.attributes.position.needsUpdate = true;
        this.dustMaterial.opacity = isNight ? 0.15 : 0.35;

        // Fireflies
        const ffPos = this.fireflies.geometry.attributes.position.array;
        for (let i = 0; i < this.fireflyData.length; i++) {
            const d = this.fireflyData[i];
            ffPos[i * 3] = d.baseX + Math.sin(time * d.speed + d.phase) * d.radius;
            ffPos[i * 3 + 1] = d.baseY + Math.sin(time * d.speed * 0.7 + d.phase) * 0.8;
            ffPos[i * 3 + 2] = d.baseZ + Math.cos(time * d.speed + d.phase) * d.radius;
        }
        this.fireflies.geometry.attributes.position.needsUpdate = true;

        // Firefly glow — only at night
        const targetFfOpacity = isNight ? (0.5 + Math.sin(time * 2) * 0.3) : 0;
        this.fireflyMaterial.opacity += (targetFfOpacity - this.fireflyMaterial.opacity) * 0.05;

        // Portal particles
        const ppPos = this.portalParticles.geometry.attributes.position.array;
        for (let i = 0; i < this.portalData.length; i++) {
            const d = this.portalData[i];
            ppPos[i * 3] = 18 + Math.sin(time * d.speed + d.phase) * d.radius;
            ppPos[i * 3 + 1] = 3 + Math.abs(Math.sin(time * d.speed * 0.5 + d.phase)) * 4;
            ppPos[i * 3 + 2] = 18 + Math.cos(time * d.speed + d.phase) * d.radius;
        }
        this.portalParticles.geometry.attributes.position.needsUpdate = true;
    }
}
