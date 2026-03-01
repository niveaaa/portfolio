import * as THREE from 'three';
import { VoxelBuilder, BlockTypes } from './VoxelBuilder.js';

export class Structures {
    constructor(scene, sceneManager) {
        this.scene = scene;
        this.sceneManager = sceneManager;
        this.builder = new VoxelBuilder(scene);
        this.animatedParts = [];

        this.buildSpawnArea();
        this.buildAboutHut();
        this.buildProjectsFortress();
        this.buildSkillsMine();
        this.buildExperienceTower();
        this.buildContactPortal();
    }

    // ─── SPAWN AREA (Home) ──────────────────────
    buildSpawnArea() {
        const g = new THREE.Group();
        g.position.set(0, 1, 0);

        // Floating "V" logo blocks
        const logoBlocks = [
            [-3, 8, 0], [-2, 7, 0], [-1, 6, 0], [0, 5, 0], [1, 6, 0], [2, 7, 0], [3, 8, 0],
            [-3, 9, 0], [3, 9, 0], [0, 4, 0],
        ];
        logoBlocks.forEach(([x, y, z], i) => {
            const block = this.builder.placeBlock(x, y, z,
                i % 3 === 0 ? BlockTypes.DIAMOND_ORE : i % 3 === 1 ? BlockTypes.EMERALD : BlockTypes.LAPIS, g);
            this.animatedParts.push({ mesh: block, type: 'float', offset: i * 0.3 });
        });

        // Platform
        this.builder.buildFloor(-3, 0, -3, 7, 7, BlockTypes.STONE, g);
        this.builder.buildFloor(-2, 0.1, -2, 5, 5, BlockTypes.GLOWSTONE, g);

        // Decorative pillars
        [[-3, 0, -3], [3, 0, -3], [-3, 0, 3], [3, 0, 3]].forEach(([x, y, z]) => {
            this.builder.buildColumn(x, y, z, 4, BlockTypes.STONE, g);
            this.builder.placeBlock(x, y + 4, z, BlockTypes.GLOWSTONE, g);
        });

        this.scene.add(g);
    }

    // ─── ABOUT ME HUT ──────────────────────────
    buildAboutHut() {
        const g = new THREE.Group();
        g.position.set(-18, 1, 0);

        // Floor
        this.builder.buildFloor(-3, 0, -3, 7, 7, BlockTypes.PLANK, g);

        // Walls
        for (let y = 1; y <= 4; y++) {
            for (let x = -3; x <= 3; x++) {
                if (x !== 0 || y > 2) {
                    this.builder.placeBlock(x, y, -3, BlockTypes.WOOD, g);
                    this.builder.placeBlock(x, y, 3, BlockTypes.WOOD, g);
                }
            }
            for (let z = -2; z <= 2; z++) {
                this.builder.placeBlock(-3, y, z, BlockTypes.WOOD, g);
                this.builder.placeBlock(3, y, z, BlockTypes.WOOD, g);
            }
        }

        // Windows (glass)
        this.builder.placeBlock(-3, 2, 0, BlockTypes.GLASS, g);
        this.builder.placeBlock(3, 2, 0, BlockTypes.GLASS, g);
        this.builder.placeBlock(0, 3, -3, BlockTypes.GLASS, g);

        // Roof (double stairs shape)
        for (let x = -4; x <= 4; x++) {
            const roofH = 5 + Math.max(0, 2 - Math.abs(x));
            for (let rh = 5; rh <= roofH; rh++) {
                for (let z = -4; z <= 4; z++) {
                    this.builder.placeBlock(x, rh, z, BlockTypes.BRICK, g);
                }
            }
        }

        // Chest (clickable)
        const chest = this.builder.placeBlock(0, 1, 0, BlockTypes.PLANK, g);
        this.builder.placeBlock(0, 2, 0, BlockTypes.GOLD_ORE, g);

        // Sign
        const sign = this.builder.placeBlock(0, 3, -4, BlockTypes.PLANK, g);

        // Bookshelves
        for (let y = 1; y <= 3; y++) {
            this.builder.placeBlock(-2, y, 2, BlockTypes.BOOKSHELF, g);
            this.builder.placeBlock(2, y, 2, BlockTypes.BOOKSHELF, g);
        }

        this.scene.add(g);

        // Register as interactable
        const hitbox = new THREE.Mesh(
            new THREE.BoxGeometry(8, 8, 8),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        hitbox.position.copy(g.position);
        hitbox.position.y += 3;
        this.scene.add(hitbox);
        this.sceneManager.registerInteractable(hitbox, 'about', '📖 About Me Hut — Click to open');
    }

    // ─── PROJECTS FORTRESS ─────────────────────
    buildProjectsFortress() {
        const g = new THREE.Group();
        g.position.set(22, 1, 0);

        // Main fortress base
        this.builder.buildFloor(-5, 0, -5, 11, 11, BlockTypes.STONE, g);
        this.builder.buildWalls(-5, 1, -5, 11, 6, 11, BlockTypes.COBBLE, g);

        // Towers at corners
        [[-5, -5], [5, -5], [-5, 5], [5, 5]].forEach(([tx, tz]) => {
            for (let y = 1; y <= 8; y++) {
                this.builder.placeBlock(tx, y, tz, BlockTypes.STONE, g);
                this.builder.placeBlock(tx + (tx > 0 ? -1 : 1), y, tz, BlockTypes.COBBLE, g);
                this.builder.placeBlock(tx, y, tz + (tz > 0 ? -1 : 1), BlockTypes.COBBLE, g);
            }
            this.builder.placeBlock(tx, 9, tz, BlockTypes.GLOWSTONE, g);
        });

        // Gate entrance
        this.builder.placeBlock(0, 4, -5, BlockTypes.STONE, g);
        this.builder.placeBlock(-1, 4, -5, BlockTypes.STONE, g);
        this.builder.placeBlock(1, 4, -5, BlockTypes.STONE, g);
        this.builder.placeBlock(0, 5, -5, BlockTypes.GLOWSTONE, g);

        // Floating project islands
        const islandPositions = [
            [-3, 10, -2], [3, 12, -1], [0, 14, 3], [-2, 11, 4]
        ];
        islandPositions.forEach(([ix, iy, iz], idx) => {
            const island = new THREE.Group();
            // Platform
            for (let x = -1; x <= 1; x++) {
                for (let z = -1; z <= 1; z++) {
                    this.builder.placeBlock(x, 0, z, BlockTypes.GRASS, island);
                    this.builder.placeBlock(x, -1, z, BlockTypes.DIRT, island);
                }
            }
            // Mini structure on each
            const types = [BlockTypes.DIAMOND_ORE, BlockTypes.GOLD_ORE, BlockTypes.EMERALD, BlockTypes.LAPIS];
            this.builder.placeBlock(0, 1, 0, types[idx], island);
            this.builder.placeBlock(0, 2, 0, BlockTypes.GLASS, island);

            island.position.set(ix, iy, iz);
            g.add(island);
            this.animatedParts.push({ mesh: island, type: 'float', offset: idx * 1.5 });
        });

        // Banner / flag
        for (let y = 1; y <= 7; y++) {
            this.builder.placeBlock(0, y, 0, BlockTypes.WOOD, g);
        }
        this.builder.placeBlock(1, 7, 0, BlockTypes.REDSTONE, g);
        this.builder.placeBlock(1, 6, 0, BlockTypes.REDSTONE, g);

        this.scene.add(g);

        const hitbox = new THREE.Mesh(
            new THREE.BoxGeometry(14, 12, 14),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        hitbox.position.copy(g.position);
        hitbox.position.y += 5;
        this.scene.add(hitbox);
        this.sceneManager.registerInteractable(hitbox, 'projects', '🏰 Projects Fortress — Click to explore');
    }

    // ─── SKILLS MINE ────────────────────────────
    buildSkillsMine() {
        const g = new THREE.Group();
        g.position.set(0, 1, 20);

        // Mine entrance
        this.builder.buildFloor(-3, 0, -2, 7, 5, BlockTypes.STONE, g);

        // Entrance frame
        for (let y = 1; y <= 4; y++) {
            this.builder.placeBlock(-2, y, -2, BlockTypes.WOOD, g);
            this.builder.placeBlock(2, y, -2, BlockTypes.WOOD, g);
        }
        for (let x = -2; x <= 2; x++) {
            this.builder.placeBlock(x, 4, -2, BlockTypes.WOOD, g);
        }

        // Descending shaft (visible from outside)
        for (let depth = 0; depth < 6; depth++) {
            const dy = -depth;
            const dz = depth;
            this.builder.buildFloor(-2, dy, dz - 1, 5, 3, BlockTypes.STONE, g);

            // Ore blocks in walls
            if (depth > 0) {
                const ores = [BlockTypes.IRON_ORE, BlockTypes.GOLD_ORE, BlockTypes.DIAMOND_ORE];
                const ore = ores[Math.min(depth - 1, 2)];
                this.builder.placeBlock(-2, dy + 1, dz, ore, g);
                this.builder.placeBlock(2, dy + 1, dz, ore, g);
            }

            // Support beams
            if (depth % 2 === 0) {
                this.builder.placeBlock(-2, dy + 1, dz, BlockTypes.WOOD, g);
                this.builder.placeBlock(2, dy + 1, dz, BlockTypes.WOOD, g);
                this.builder.placeBlock(-2, dy + 2, dz, BlockTypes.WOOD, g);
                this.builder.placeBlock(2, dy + 2, dz, BlockTypes.WOOD, g);
                for (let x = -1; x <= 1; x++) {
                    this.builder.placeBlock(x, dy + 3, dz, BlockTypes.WOOD, g);
                }
            }
        }

        // Torch (glowstone)
        this.builder.placeBlock(-1, 2, -2, BlockTypes.GLOWSTONE, g);
        this.builder.placeBlock(1, 2, -2, BlockTypes.GLOWSTONE, g);

        // Cart rails (iron blocks)
        for (let i = 0; i < 4; i++) {
            this.builder.placeBlock(0, -i + 0.5, i, BlockTypes.IRON_ORE, g);
        }

        this.scene.add(g);

        const hitbox = new THREE.Mesh(
            new THREE.BoxGeometry(8, 10, 10),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        hitbox.position.copy(g.position);
        hitbox.position.y += 2;
        this.scene.add(hitbox);
        this.sceneManager.registerInteractable(hitbox, 'skills', '⛏️ Skills Mine — Click to explore');
    }

    // ─── EXPERIENCE TOWER ──────────────────────
    buildExperienceTower() {
        const g = new THREE.Group();
        g.position.set(0, 1, -18);

        const floors = 5;
        const floorH = 4;

        for (let f = 0; f < floors; f++) {
            const baseY = f * floorH;
            const size = 5 - f * 0.5;
            const half = Math.floor(size / 2);

            // Floor
            for (let x = -half; x <= half; x++) {
                for (let z = -half; z <= half; z++) {
                    this.builder.placeBlock(x, baseY, z, f === 0 ? BlockTypes.STONE : BlockTypes.PLANK, g);
                }
            }

            // Walls with windows
            for (let y = 1; y < floorH; y++) {
                for (let x = -half; x <= half; x++) {
                    const isWindow = y === 2 && (x === 0);
                    this.builder.placeBlock(x, baseY + y, -half,
                        isWindow ? BlockTypes.GLASS : BlockTypes.COBBLE, g);
                    this.builder.placeBlock(x, baseY + y, half,
                        isWindow ? BlockTypes.GLASS : BlockTypes.COBBLE, g);
                }
                for (let z = -half + 1; z < half; z++) {
                    const isWindow = y === 2 && (z === 0);
                    this.builder.placeBlock(-half, baseY + y, z,
                        isWindow ? BlockTypes.GLASS : BlockTypes.COBBLE, g);
                    this.builder.placeBlock(half, baseY + y, z,
                        isWindow ? BlockTypes.GLASS : BlockTypes.COBBLE, g);
                }
            }
        }

        // Beacon on top
        const topY = floors * floorH;
        this.builder.placeBlock(0, topY, 0, BlockTypes.GLOWSTONE, g);
        this.builder.placeBlock(0, topY + 1, 0, BlockTypes.GLASS, g);
        this.builder.placeBlock(0, topY + 2, 0, BlockTypes.DIAMOND_ORE, g);
        this.animatedParts.push({
            mesh: g.children[g.children.length - 1],
            type: 'rotate',
            offset: 0
        });

        this.scene.add(g);

        const hitbox = new THREE.Mesh(
            new THREE.BoxGeometry(8, floors * floorH + 4, 8),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        hitbox.position.copy(g.position);
        hitbox.position.y += (floors * floorH) / 2;
        this.scene.add(hitbox);
        this.sceneManager.registerInteractable(hitbox, 'experience', '🗼 Experience Tower — Click to explore');
    }

    // ─── CONTACT PORTAL ─────────────────────────
    buildContactPortal() {
        const g = new THREE.Group();
        g.position.set(18, 1, 18);

        // Obsidian frame (classic 4x5 portal)
        const frame = [
            [0, 0, -1], [0, 0, 0], [0, 0, 1], [0, 0, 2],
            [0, 5, -1], [0, 5, 0], [0, 5, 1], [0, 5, 2],
            [0, 1, -1], [0, 2, -1], [0, 3, -1], [0, 4, -1],
            [0, 1, 2], [0, 2, 2], [0, 3, 2], [0, 4, 2],
        ];
        frame.forEach(([x, y, z]) => {
            this.builder.placeBlock(x, y, z, BlockTypes.OBSIDIAN, g);
        });

        // Portal fill (glowing purple)
        for (let y = 1; y <= 4; y++) {
            for (let z = 0; z <= 1; z++) {
                const block = this.builder.placeBlock(0, y, z, BlockTypes.PORTAL, g);
                this.animatedParts.push({ mesh: block, type: 'portalPulse', offset: y * 0.5 + z * 0.3 });
            }
        }

        // Platform
        for (let x = -2; x <= 2; x++) {
            for (let z = -3; z <= 4; z++) {
                this.builder.placeBlock(x, -1, z, BlockTypes.OBSIDIAN, g);
            }
        }

        // Decorative glowstone pillars
        [[-2, -2], [-2, 3], [2, -2], [2, 3]].forEach(([x, z]) => {
            this.builder.buildColumn(x, 0, z, 4, BlockTypes.OBSIDIAN, g);
            this.builder.placeBlock(x, 4, z, BlockTypes.GLOWSTONE, g);
        });

        this.scene.add(g);

        const hitbox = new THREE.Mesh(
            new THREE.BoxGeometry(8, 8, 8),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        hitbox.position.copy(g.position);
        hitbox.position.y += 3;
        this.scene.add(hitbox);
        this.sceneManager.registerInteractable(hitbox, 'contact', '🌀 Contact Portal — Click to enter');
    }

    // ─── ANIMATION UPDATE ──────────────────────
    update(time) {
        this.animatedParts.forEach(part => {
            switch (part.type) {
                case 'float':
                    part.mesh.position.y += Math.sin(time * 2 + part.offset) * 0.003;
                    break;
                case 'rotate':
                    part.mesh.rotation.y = time + part.offset;
                    break;
                case 'portalPulse': {
                    const scale = 0.95 + Math.sin(time * 3 + part.offset) * 0.08;
                    part.mesh.scale.set(scale, scale, scale);
                    if (part.mesh.material && part.mesh.material.emissiveIntensity !== undefined) {
                        part.mesh.material.emissiveIntensity = 0.3 + Math.sin(time * 2 + part.offset) * 0.3;
                    }
                    break;
                }
            }
        });
    }
}
