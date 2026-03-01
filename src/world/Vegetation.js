import * as THREE from 'three';
import { VoxelBuilder, BlockTypes } from './VoxelBuilder.js';

export class Vegetation {
    constructor(scene) {
        this.scene = scene;
        this.builder = new VoxelBuilder(scene);
        this.generate();
    }

    generate() {
        // Tree placements (avoiding structure areas)
        const treePositions = [
            [-12, 5], [-15, -8], [-10, -12], [12, -10], [15, 8],
            [-8, 15], [10, 14], [-20, 12], [-22, -5], [14, -15],
            [20, -8], [-25, 0], [25, -12], [-14, 18], [8, -20],
            [-30, 10], [30, 5], [-28, -15], [28, 12], [-18, -20],
            [22, 22], [-22, 22], [-15, 25], [15, -25], [-25, -20],
        ];

        treePositions.forEach(([x, z]) => {
            this._buildTree(x, z);
        });

        // Flowers scattered around
        this._buildFlowers();
    }

    _buildTree(x, z) {
        const g = new THREE.Group();
        const height = 4 + Math.floor(Math.random() * 3);
        const treeType = Math.random();

        // Trunk
        for (let y = 1; y <= height; y++) {
            this.builder.placeBlock(0, y, 0, BlockTypes.WOOD, g);
        }

        if (treeType < 0.6) {
            // Oak style — round canopy
            const radius = 2;
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -1; dy <= 2; dy++) {
                    for (let dz = -radius; dz <= radius; dz++) {
                        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        if (dist <= radius + 0.5 && Math.random() > 0.15) {
                            this.builder.placeBlock(dx, height + dy + 1, dz, BlockTypes.LEAVES, g);
                        }
                    }
                }
            }
        } else {
            // Spruce style — conical
            for (let level = 0; level < 4; level++) {
                const r = 3 - level;
                const ly = height - 1 + level;
                for (let dx = -r; dx <= r; dx++) {
                    for (let dz = -r; dz <= r; dz++) {
                        if (Math.abs(dx) + Math.abs(dz) <= r + 1 && Math.random() > 0.1) {
                            this.builder.placeBlock(dx, ly, dz, BlockTypes.LEAVES, g);
                        }
                    }
                }
            }
            this.builder.placeBlock(0, height + 4, 0, BlockTypes.LEAVES, g);
        }

        g.position.set(x, 0, z);
        this.scene.add(g);
    }

    _buildFlowers() {
        const flowerColors = [
            new THREE.Color(0xff4466), // red
            new THREE.Color(0xffdd44), // yellow
            new THREE.Color(0xff88cc), // pink
            new THREE.Color(0x44aaff), // blue
            new THREE.Color(0xffffff), // white
        ];
        const flowerGeo = new THREE.BoxGeometry(0.3, 0.5, 0.3);

        for (let i = 0; i < 60; i++) {
            const x = (Math.random() - 0.5) * 50;
            const z = (Math.random() - 0.5) * 50;
            // Skip near structures
            if (Math.abs(x) < 6 && Math.abs(z) < 6) continue;

            const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
            const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
            const flower = new THREE.Mesh(flowerGeo, mat);
            flower.position.set(x, 1.2, z);
            this.scene.add(flower);
        }
    }
}
