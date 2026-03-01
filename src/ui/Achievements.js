export class Achievements {
    constructor() {
        this.popup = document.getElementById('achievement-popup');
        this.titleEl = document.getElementById('achievement-title');
        this.descEl = document.getElementById('achievement-desc');
        this.queue = [];
        this.isShowing = false;

        this.unlocked = new Set();

        this.definitions = {
            'first_click': { title: 'First Steps', desc: 'Clicked your first structure' },
            'explorer': { title: 'Explorer', desc: 'Visited 3 different structures' },
            'completionist': { title: 'Completionist', desc: 'Visited all 5 structures!' },
            'night_owl': { title: 'Night Owl', desc: 'Experienced nighttime' },
            'rain_dancer': { title: 'Rain Dancer', desc: 'Toggled the weather' },
            'free_roam': { title: 'Free Roam', desc: 'Entered first-person mode' },
            'secret_found': { title: 'Secret Found!', desc: 'You found a hidden easter egg!' },
        };

        this.visitedSections = new Set();
    }

    tryUnlock(id) {
        if (this.unlocked.has(id)) return false;
        if (!this.definitions[id]) return false;

        this.unlocked.add(id);
        const def = this.definitions[id];
        this.queue.push(def);
        this._processQueue();
        return true;
    }

    trackVisit(sectionId) {
        this.visitedSections.add(sectionId);

        if (this.visitedSections.size === 1) {
            this.tryUnlock('first_click');
        }
        if (this.visitedSections.size >= 3) {
            this.tryUnlock('explorer');
        }
        if (this.visitedSections.size >= 5) {
            this.tryUnlock('completionist');
        }
    }

    _processQueue() {
        if (this.isShowing || this.queue.length === 0) return;
        this.isShowing = true;

        const def = this.queue.shift();
        this.titleEl.textContent = def.title;
        this.descEl.textContent = def.desc;
        this.popup.style.display = 'flex';

        requestAnimationFrame(() => {
            this.popup.classList.add('show');
        });

        setTimeout(() => {
            this.popup.classList.remove('show');
            setTimeout(() => {
                this.popup.style.display = 'none';
                this.isShowing = false;
                this._processQueue();
            }, 500);
        }, 3000);
    }
}
