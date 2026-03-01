import * as THREE from 'three';

export class DayNightCycle {
    constructor(scene) {
        this.scene = scene;

        // Sun
        this.sunLight = new THREE.DirectionalLight(0xfff4e0, 1.5);
        this.sunLight.position.set(50, 80, 30);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 200;
        this.sunLight.shadow.camera.left = -60;
        this.sunLight.shadow.camera.right = 60;
        this.sunLight.shadow.camera.top = 60;
        this.sunLight.shadow.camera.bottom = -60;
        this.sunLight.shadow.bias = -0.001;
        scene.add(this.sunLight);

        // Ambient
        this.ambientLight = new THREE.AmbientLight(0x6688cc, 0.4);
        scene.add(this.ambientLight);

        // Hemisphere light for natural sky-ground lighting
        this.hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x444422, 0.3);
        scene.add(this.hemiLight);

        // Sun visual
        const sunGeo = new THREE.SphereGeometry(5, 8, 8);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xffee88 });
        this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
        scene.add(this.sunMesh);

        // Moon visual
        const moonGeo = new THREE.SphereGeometry(3, 8, 8);
        const moonMat = new THREE.MeshBasicMaterial({ color: 0xccccdd });
        this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
        scene.add(this.moonMesh);
    }

    update(timeOfDay) {
        // Fixed bright sunny noon — sun high in the sky
        this.sunLight.position.set(50, 100, 30);
        this.sunLight.intensity = 1.8;
        this.sunLight.color.setHex(0xfff4e0);
        this.sunMesh.position.set(125, 250, 75);

        // Hide moon below horizon
        this.moonMesh.position.set(-125, -250, -75);

        // Bright ambient lighting
        this.ambientLight.color.setHex(0x6688cc);
        this.ambientLight.intensity = 0.55;

        // Hemisphere light — bright sky and warm ground
        this.hemiLight.color.setHex(0x87CEEB);
        this.hemiLight.groundColor.setHex(0x444422);
        this.hemiLight.intensity = 0.4;

        // Always sunny indicator
        const indicator = document.getElementById('time-indicator');
        if (indicator) {
            indicator.textContent = '☀️';
        }
    }
}
