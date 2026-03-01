import { Renderer } from './engine/Renderer.js';
import { Camera } from './engine/Camera.js';
import { SceneManager } from './engine/SceneManager.js';
import { Terrain } from './world/Terrain.js';
import { Structures } from './world/Structures.js';
import { Skybox } from './world/Skybox.js';
import { Vegetation } from './world/Vegetation.js';
import { DayNightCycle } from './effects/DayNightCycle.js';
import { Particles } from './effects/Particles.js';
import { Weather } from './effects/Weather.js';
import { HUD } from './ui/HUD.js';
import { Panels } from './ui/Panels.js';
import { Achievements } from './ui/Achievements.js';
import { LoadingScreen } from './ui/LoadingScreen.js';
import { Raycaster } from './interaction/Raycaster.js';
import { AudioManager } from './interaction/AudioManager.js';
import { MobileFallback } from './mobile/MobileFallback.js';

class VoxelPortfolio {
    constructor() {
        // Mobile check
        if (MobileFallback.shouldUseFallback()) {
            const fallback = new MobileFallback();
            fallback.activate();
            return;
        }

        this.loadingScreen = new LoadingScreen();
        this.clock = { last: performance.now(), elapsed: 0 };

        this._init();
    }

    async _init() {
        this.loadingScreen.setProgress(5);

        // Engine
        const container = document.getElementById('canvas-container');
        this.sceneManager = new SceneManager();
        this.renderer = new Renderer(container);
        this.camera = new Camera(this.renderer.instance);
        this.loadingScreen.setProgress(15);

        // World
        await this._sleep(50);
        this.terrain = new Terrain(this.sceneManager.instance);
        this.loadingScreen.setProgress(35);

        await this._sleep(50);
        this.structures = new Structures(this.sceneManager.instance, this.sceneManager);
        this.loadingScreen.setProgress(55);

        await this._sleep(50);
        this.vegetation = new Vegetation(this.sceneManager.instance);
        this.loadingScreen.setProgress(65);

        // Effects
        this.skybox = new Skybox(this.sceneManager.instance);
        this.dayNight = new DayNightCycle(this.sceneManager.instance);
        this.particles = new Particles(this.sceneManager.instance);
        this.weather = new Weather(this.sceneManager.instance);
        this.loadingScreen.setProgress(80);

        // UI
        this.hud = new HUD();
        this.panels = new Panels();
        this.achievements = new Achievements();
        this.audioManager = new AudioManager();
        this.loadingScreen.setProgress(90);

        // Interaction
        this.raycaster = new Raycaster(
            this.camera, this.sceneManager,
            this.panels, this.achievements, this.audioManager
        );
        this.loadingScreen.setProgress(100);

        // Setup event handlers
        this._setupWeatherToggle();
        this._setupPointerLockAchievement();
        this._setupFirstPersonButton();

        // Interactions disabled briefly to prevent click-through from enter button
        this.raycaster.enabled = false;

        // Show enter button
        await this._sleep(500);
        this.loadingScreen.showEnterButton();
        this.loadingScreen.onEnter = () => {
            this.hud.show();
            this.hud.fadeControlsHint();
            this.audioManager.init();
            this.audioManager.startAmbient();
            this._startRenderLoop();
            // Enable interactions after a short delay
            setTimeout(() => { this.raycaster.enabled = true; }, 500);
        };
    }

    _setupWeatherToggle() {
        const btn = document.getElementById('weather-toggle');
        if (btn) {
            btn.addEventListener('click', () => {
                const isRaining = this.weather.toggle();
                btn.textContent = isRaining ? '☀️' : '🌧️';
                this.audioManager.playRainAmbient(isRaining);
                this.achievements.tryUnlock('rain_dancer');
            });
        }
    }

    _setupPointerLockAchievement() {
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement) {
                this.achievements.tryUnlock('free_roam');
            }
            // Update FPS button text
            const fpsBtn = document.getElementById('fps-toggle');
            if (fpsBtn) {
                fpsBtn.textContent = document.pointerLockElement ? '🔄 Exit FPS' : '🎮 First Person';
            }
        });
    }

    _setupFirstPersonButton() {
        const btn = document.getElementById('fps-toggle');
        if (btn) {
            btn.addEventListener('click', () => {
                if (this.camera.isPointerLocked) {
                    this.camera.exitFirstPerson();
                } else {
                    this.camera.enterFirstPerson();
                }
            });
        }
    }

    _startRenderLoop() {
        const animate = () => {
            requestAnimationFrame(animate);

            const now = performance.now();
            const delta = (now - this.clock.last) / 1000;
            this.clock.last = now;
            this.clock.elapsed += delta;
            const time = this.clock.elapsed;

            // Update all systems
            this.camera.update(delta);
            const timeOfDay = this.skybox.update(time, delta);
            this.dayNight.update(timeOfDay);
            this.terrain.update(time);
            this.structures.update(time);
            this.particles.update(time, this.skybox.isNight);
            this.weather.update(time, delta);

            // Minimap
            this.hud.updateMinimap(
                this.camera.instance.position.x,
                this.camera.instance.position.z
            );

            // Render
            this.renderer.render(this.sceneManager.instance, this.camera.instance);
        };

        animate();
    }

    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Boot!
new VoxelPortfolio();
