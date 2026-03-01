export class HUD {
    constructor() {
        this.minimapCanvas = document.getElementById('minimap');
        this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;
        this.controlsHint = document.getElementById('controls-hint');
        this.hideTimeout = null;

        // Structure colors on minimap
        this.structures = [
            { x: 0, z: 0, color: '#4ade80', label: 'Home' },
            { x: -18, z: 0, color: '#fbbf24', label: 'About' },
            { x: 22, z: 0, color: '#ef4444', label: 'Projects' },
            { x: 0, z: 20, color: '#22d3ee', label: 'Skills' },
            { x: 0, z: -18, color: '#a78bfa', label: 'Experience' },
            { x: 18, z: 18, color: '#8b5cf6', label: 'Contact' },
        ];
    }

    show() {
        const hud = document.getElementById('hud');
        if (hud) hud.style.display = 'block';
    }

    hide() {
        const hud = document.getElementById('hud');
        if (hud) hud.style.display = 'none';
    }

    updateMinimap(cameraX, cameraZ) {
        if (!this.minimapCtx) return;
        const ctx = this.minimapCtx;
        const w = 160, h = 160;
        const scale = 1.2;

        // Clear
        ctx.fillStyle = 'rgba(10, 15, 25, 0.9)';
        ctx.fillRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < w; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, h);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(w, i);
            ctx.stroke();
        }

        // Draw structures
        this.structures.forEach(s => {
            const mx = w / 2 + (s.x - cameraX) * scale;
            const my = h / 2 + (s.z - cameraZ) * scale;
            if (mx < -10 || mx > w + 10 || my < -10 || my > h + 10) return;

            ctx.fillStyle = s.color;
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 6;
            ctx.fillRect(mx - 4, my - 4, 8, 8);
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '6px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(s.label, mx, my + 12);
        });

        // Player dot
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Border
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, w, h);
    }

    fadeControlsHint() {
        // Always visible — no fade
    }
}
