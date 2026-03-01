export class LoadingScreen {
    constructor() {
        this.screen = document.getElementById('loading-screen');
        this.bar = document.getElementById('loading-bar');
        this.tip = document.getElementById('loading-tip');
        this.enterBtn = document.getElementById('enter-btn');
        this.progress = 0;
        this.onEnter = null;

        this.tips = [
            'Generating terrain...',
            'Planting trees...',
            'Building structures...',
            'Placing torches...',
            'Spawning fireflies...',
            'Polishing diamonds...',
            'Enchanting items...',
            'Loading memories...',
            'Crafting portfolio...',
            'Almost there...',
        ];

        this.currentTip = 0;
        this._cycleTips();

        if (this.enterBtn) {
            this.enterBtn.addEventListener('click', () => {
                if (this.onEnter) this.onEnter();
                this.hide();
            });
        }
    }

    _cycleTips() {
        this._tipInterval = setInterval(() => {
            this.currentTip = (this.currentTip + 1) % this.tips.length;
            if (this.tip) {
                this.tip.style.opacity = '0';
                setTimeout(() => {
                    this.tip.textContent = this.tips[this.currentTip];
                    this.tip.style.opacity = '1';
                }, 200);
            }
        }, 2000);
    }

    setProgress(value) {
        this.progress = Math.min(100, value);
        if (this.bar) {
            this.bar.style.width = this.progress + '%';
        }
    }

    showEnterButton() {
        clearInterval(this._tipInterval);
        if (this.tip) this.tip.textContent = 'World ready!';
        if (this.enterBtn) this.enterBtn.style.display = 'inline-block';
    }

    hide() {
        clearInterval(this._tipInterval);
        if (this.screen) this.screen.classList.add('hidden');
    }
}
