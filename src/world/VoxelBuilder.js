import * as THREE from 'three';

// Procedural textures from canvas
function createBlockTexture(baseColor, variation = 0.08, gridLines = true) {
    const size = 16;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const v = 1 + (Math.random() - 0.5) * variation * 2;
            ctx.fillStyle = `rgb(${Math.floor(r * v)}, ${Math.floor(g * v)}, ${Math.floor(b * v)})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }

    if (gridLines) {
        ctx.strokeStyle = `rgba(0,0,0,0.12)`;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(0.25, 0.25, size - 0.5, size - 0.5);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

export const BlockTypes = {
    GRASS: { color: '#4a7c3f', emissive: 0x000000, name: 'grass' },
    DIRT: { color: '#8B6914', emissive: 0x000000, name: 'dirt' },
    STONE: { color: '#808080', emissive: 0x000000, name: 'stone' },
    WOOD: { color: '#8B6914', emissive: 0x000000, name: 'wood' },
    PLANK: { color: '#C4A35A', emissive: 0x000000, name: 'plank' },
    LEAVES: { color: '#2d7a2d', emissive: 0x000000, name: 'leaves' },
    GLASS: { color: '#a8d8ea', emissive: 0x000000, name: 'glass', transparent: true },
    COBBLE: { color: '#696969', emissive: 0x000000, name: 'cobble' },
    BRICK: { color: '#B03A2E', emissive: 0x000000, name: 'brick' },
    SAND: { color: '#f4e4a6', emissive: 0x000000, name: 'sand' },
    WATER: { color: '#2980B9', emissive: 0x0066aa, name: 'water', transparent: true },
    OBSIDIAN: { color: '#1a0a2e', emissive: 0x110022, name: 'obsidian' },
    PORTAL: { color: '#8b5cf6', emissive: 0x8b5cf6, name: 'portal', transparent: true },
    DIAMOND_ORE: { color: '#44c8e3', emissive: 0x22aacc, name: 'diamond' },
    GOLD_ORE: { color: '#f5c842', emissive: 0xcc9900, name: 'gold' },
    IRON_ORE: { color: '#b8b8b8', emissive: 0x444444, name: 'iron' },
    GLOWSTONE: { color: '#f5d142', emissive: 0xffaa00, name: 'glow' },
    SNOW: { color: '#f0f0ff', emissive: 0x000000, name: 'snow' },
    BOOKSHELF: { color: '#8B6914', emissive: 0x000000, name: 'bookshelf' },
    LAPIS: { color: '#2546bd', emissive: 0x1133aa, name: 'lapis' },
    REDSTONE: { color: '#cc2020', emissive: 0xcc0000, name: 'redstone' },
    EMERALD: { color: '#22cc55', emissive: 0x11aa44, name: 'emerald' },
};

const materialCache = new Map();

export function getBlockMaterial(blockType) {
    if (materialCache.has(blockType.name)) return materialCache.get(blockType.name);

    const tex = createBlockTexture(blockType.color);
    const mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.85,
        metalness: 0.05,
        emissive: new THREE.Color(blockType.emissive),
        emissiveIntensity: blockType.emissive ? 0.4 : 0,
        transparent: blockType.transparent || false,
        opacity: blockType.transparent ? 0.7 : 1.0,
    });
    materialCache.set(blockType.name, mat);
    return mat;
}

const boxGeo = new THREE.BoxGeometry(1, 1, 1);

export class VoxelBuilder {
    constructor(scene) {
        this.scene = scene;
        this.groups = new Map();
    }

    // Place a single block
    placeBlock(x, y, z, blockType, parent = null) {
        const mesh = new THREE.Mesh(boxGeo, getBlockMaterial(blockType));
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (parent) {
            parent.add(mesh);
        } else {
            this.scene.add(mesh);
        }
        return mesh;
    }

    // Build a box of blocks
    buildBox(ox, oy, oz, w, h, d, blockType, parent = null, hollow = false) {
        const group = parent || new THREE.Group();
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                for (let z = 0; z < d; z++) {
                    if (hollow) {
                        const isEdge = x === 0 || x === w - 1 || y === 0 || y === h - 1 || z === 0 || z === d - 1;
                        if (!isEdge) continue;
                    }
                    this.placeBlock(ox + x, oy + y, oz + z, blockType, group);
                }
            }
        }
        if (!parent) this.scene.add(group);
        return group;
    }

    // Build a floor
    buildFloor(ox, oy, oz, w, d, blockType, parent = null) {
        return this.buildBox(ox, oy, oz, w, 1, d, blockType, parent);
    }

    // Build walls (4 sides, no top/bottom)
    buildWalls(ox, oy, oz, w, h, d, blockType, parent = null) {
        const group = parent || new THREE.Group();
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                this.placeBlock(ox + x, oy + y, oz, blockType, group);
                this.placeBlock(ox + x, oy + y, oz + d - 1, blockType, group);
            }
            for (let z = 1; z < d - 1; z++) {
                this.placeBlock(ox, oy + y, oz + z, blockType, group);
                this.placeBlock(ox + w - 1, oy + y, oz + z, blockType, group);
            }
        }
        if (!parent) this.scene.add(group);
        return group;
    }

    // Build a column
    buildColumn(x, oy, z, h, blockType, parent = null) {
        const group = parent || new THREE.Group();
        for (let y = 0; y < h; y++) {
            this.placeBlock(x, oy + y, z, blockType, group);
        }
        if (!parent) this.scene.add(group);
        return group;
    }
}
