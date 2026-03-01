import * as THREE from 'three';
import { VoxelBuilder, BlockTypes, getBlockMaterial } from './VoxelBuilder.js';

export class Terrain {
    constructor(scene) {
        this.scene = scene;
        this.builder = new VoxelBuilder(scene);
        this.group = new THREE.Group();
        this.generate();
        scene.add(this.group);
    }

    generate() {
        const size = 60;
        const half = size / 2;

        // Use instanced mesh for ground blocks for performance
        const grassMat = getBlockMaterial(BlockTypes.GRASS);
        const dirtMat = getBlockMaterial(BlockTypes.DIRT);
        const boxGeo = new THREE.BoxGeometry(1, 1, 1);

        // Heightmap with gentle hills
        const getHeight = (x, z) => {
            const nx = x / 30;
            const nz = z / 30;
            return Math.floor(
                Math.sin(nx * 2.5) * Math.cos(nz * 2.5) * 1.5 +
                Math.sin(nx * 1.2 + 0.5) * 1.0 +
                Math.cos(nz * 1.8 + 0.3) * 0.8
            );
        };

        // Create instanced meshes
        const totalBlocks = size * size;
        const grassInstanced = new THREE.InstancedMesh(boxGeo, grassMat, totalBlocks);
        const dirtInstanced = new THREE.InstancedMesh(boxGeo, dirtMat, totalBlocks * 2);
        grassInstanced.castShadow = true;
        grassInstanced.receiveShadow = true;
        dirtInstanced.receiveShadow = true;

        let grassIdx = 0;
        let dirtIdx = 0;
        const matrix = new THREE.Matrix4();

        for (let x = -half; x < half; x++) {
            for (let z = -half; z < half; z++) {
                const h = getHeight(x, z);

                // Top grass layer
                matrix.makeTranslation(x, h, z);
                if (grassIdx < totalBlocks) {
                    grassInstanced.setMatrixAt(grassIdx++, matrix);
                }

                // One layer of dirt below
                matrix.makeTranslation(x, h - 1, z);
                if (dirtIdx < totalBlocks * 2) {
                    dirtInstanced.setMatrixAt(dirtIdx++, matrix);
                }
                matrix.makeTranslation(x, h - 2, z);
                if (dirtIdx < totalBlocks * 2) {
                    dirtInstanced.setMatrixAt(dirtIdx++, matrix);
                }
            }
        }

        grassInstanced.count = grassIdx;
        dirtInstanced.count = dirtIdx;
        grassInstanced.instanceMatrix.needsUpdate = true;
        dirtInstanced.instanceMatrix.needsUpdate = true;

        this.group.add(grassInstanced);
        this.group.add(dirtInstanced);

        // Water plane
        const waterGeo = new THREE.PlaneGeometry(size * 2, size * 2);
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x2980B9,
            transparent: true,
            opacity: 0.55,
            roughness: 0.1,
            metalness: 0.3,
        });
        const waterMesh = new THREE.Mesh(waterGeo, waterMat);
        waterMesh.rotation.x = -Math.PI / 2;
        waterMesh.position.y = -3;
        waterMesh.receiveShadow = true;
        this.group.add(waterMesh);
        this.water = waterMesh;

        // Paths between structures (flat stone areas)
        this._buildPaths();
    }

    _buildPaths() {
        const pathMat = getBlockMaterial(BlockTypes.COBBLE);
        const boxGeo = new THREE.BoxGeometry(1, 0.2, 1);
        const pathBlocks = [];

        // Center spawn area — flat platform
        for (let x = -4; x <= 4; x++) {
            for (let z = -4; z <= 4; z++) {
                pathBlocks.push([x, 0.6, z]);
            }
        }

        // Paths radiating outward to structures
        const paths = [
            { dx: 1, dz: 0, len: 22 },  // east to projects fortress
            { dx: -1, dz: 0, len: 18 }, // west to about hut
            { dx: 0, dz: 1, len: 20 },  // south to skills mine
            { dx: 0, dz: -1, len: 18 }, // north to experience tower
            { dx: 1, dz: 1, len: 25 },  // SE to contact portal
        ];

        paths.forEach(p => {
            for (let i = 5; i < p.len; i++) {
                const px = p.dx * i;
                const pz = p.dz * i;
                for (let w = -1; w <= 1; w++) {
                    const wx = p.dz !== 0 ? w : 0;
                    const wz = p.dx !== 0 ? w : 0;
                    pathBlocks.push([px + wx, 0.6, pz + wz]);
                }
            }
        });

        const instanced = new THREE.InstancedMesh(boxGeo, pathMat, pathBlocks.length);
        const matrix = new THREE.Matrix4();
        pathBlocks.forEach(([x, y, z], i) => {
            matrix.makeTranslation(x, y, z);
            instanced.setMatrixAt(i, matrix);
        });
        instanced.instanceMatrix.needsUpdate = true;
        instanced.receiveShadow = true;
        this.group.add(instanced);
    }

    getHeightAt(x, z) {
        const nx = x / 30;
        const nz = z / 30;
        return Math.floor(
            Math.sin(nx * 2.5) * Math.cos(nz * 2.5) * 1.5 +
            Math.sin(nx * 1.2 + 0.5) * 1.0 +
            Math.cos(nz * 1.8 + 0.3) * 0.8
        );
    }

    update(time) {
        // Animate water
        if (this.water) {
            this.water.position.y = -3 + Math.sin(time * 0.5) * 0.15;
        }
    }
}
