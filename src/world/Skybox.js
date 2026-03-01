import * as THREE from 'three';

export class Skybox {
    constructor(scene) {
        this.scene = scene;
        this.timeOfDay = 0; // 0-1, 0=noon, 0.5=midnight

        // Sky dome
        const skyGeo = new THREE.SphereGeometry(400, 32, 32);
        this.skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0077ff) },
                bottomColor: { value: new THREE.Color(0x87CEEB) },
                sunPosition: { value: new THREE.Vector3(0, 1, 0) },
                timeOfDay: { value: 0 },
            },
            vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float timeOfDay;
        varying vec3 vWorldPosition;
        
        void main() {
          float h = normalize(vWorldPosition).y;
          float t = max(0.0, h);
          
          // Day colors
          vec3 dayTop = vec3(0.2, 0.5, 1.0);
          vec3 dayBottom = vec3(0.7, 0.85, 1.0);
          
          // Sunset colors
          vec3 sunsetTop = vec3(0.1, 0.1, 0.3);
          vec3 sunsetBottom = vec3(0.9, 0.4, 0.1);
          
          // Night colors
          vec3 nightTop = vec3(0.02, 0.02, 0.08);
          vec3 nightBottom = vec3(0.05, 0.05, 0.15);
          
          vec3 top, bottom;
          
          // Smooth interpolation across day phases
          float phase = timeOfDay;
          if (phase < 0.2) {
            // Day
            top = dayTop;
            bottom = dayBottom;
          } else if (phase < 0.3) {
            // Sunset transition
            float f = (phase - 0.2) / 0.1;
            top = mix(dayTop, sunsetTop, f);
            bottom = mix(dayBottom, sunsetBottom, f);
          } else if (phase < 0.4) {
            // Sunset to night
            float f = (phase - 0.3) / 0.1;
            top = mix(sunsetTop, nightTop, f);
            bottom = mix(sunsetBottom, nightBottom, f);
          } else if (phase < 0.7) {
            // Night
            top = nightTop;
            bottom = nightBottom;
          } else if (phase < 0.8) {
            // Dawn transition
            float f = (phase - 0.7) / 0.1;
            top = mix(nightTop, sunsetTop, f);
            bottom = mix(nightBottom, sunsetBottom, f);
          } else {
            // Dawn to day
            float f = (phase - 0.8) / 0.2;
            top = mix(sunsetTop, dayTop, f);
            bottom = mix(sunsetBottom, dayBottom, f);
          }
          
          vec3 color = mix(bottom, top, t);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
            side: THREE.BackSide,
            depthWrite: false,
        });
        this.skyMesh = new THREE.Mesh(skyGeo, this.skyMaterial);
        scene.add(this.skyMesh);

        // Stars
        this._createStars();

        // Clouds
        this._createClouds();
    }

    _createStars() {
        const count = 600;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 0.8 + 0.2); // upper hemisphere
            const r = 350;
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.cos(phi);
            positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.5,
            transparent: true,
            opacity: 0,
            sizeAttenuation: true,
        });
        this.stars = new THREE.Points(starGeo, this.starMaterial);
        this.scene.add(this.stars);
    }

    _createClouds() {
        this.clouds = new THREE.Group();
        const cloudMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.6,
            roughness: 1,
            metalness: 0,
        });

        for (let i = 0; i < 15; i++) {
            const cloud = new THREE.Group();
            const numBlocks = 4 + Math.floor(Math.random() * 6);
            for (let b = 0; b < numBlocks; b++) {
                const size = 2 + Math.random() * 3;
                const box = new THREE.Mesh(
                    new THREE.BoxGeometry(size, size * 0.4, size * 0.8),
                    cloudMat
                );
                box.position.set(
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 1.5,
                    (Math.random() - 0.5) * 4
                );
                cloud.add(box);
            }
            cloud.position.set(
                (Math.random() - 0.5) * 200,
                50 + Math.random() * 30,
                (Math.random() - 0.5) * 200
            );
            cloud.userData.speed = 0.5 + Math.random() * 1.5;
            this.clouds.add(cloud);
        }
        this.scene.add(this.clouds);
    }

    update(time, deltaTime) {
        // Fixed sunny daytime
        this.timeOfDay = 0;
        this.skyMaterial.uniforms.timeOfDay.value = 0;

        // Stars always hidden in daytime
        this.starMaterial.opacity = 0;

        // Cloud movement
        this.clouds.children.forEach(cloud => {
            cloud.position.x += cloud.userData.speed * deltaTime * 0.5;
            if (cloud.position.x > 150) cloud.position.x = -150;
        });

        // Bright sunny fog
        const fogColor = new THREE.Color(0x87CEEB);
        this.scene.fog.color.copy(fogColor);
        this.scene.background = fogColor;

        return this.timeOfDay;
    }

    get isNight() {
        return false;
    }
}
