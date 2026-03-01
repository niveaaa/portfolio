export class AudioManager {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.ambientGain = null;
        this.isAmbientPlaying = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.3;
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio not available:', e);
        }
    }

    // Procedural click sound
    playClick() {
        if (!this.initialized) this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.1);
    }

    // Procedural ambient pad
    startAmbient() {
        if (!this.initialized) this.init();
        if (!this.ctx || this.isAmbientPlaying) return;
        this.isAmbientPlaying = true;

        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.value = 0;
        this.ambientGain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 3);
        this.ambientGain.connect(this.masterGain);

        // Gentle chord pad using detuned oscillators
        const notes = [130.81, 164.81, 196.00, 261.63]; // C3, E3, G3, C4
        this.ambientOscillators = notes.map((freq, i) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.detune.value = Math.random() * 10 - 5;

            const oscGain = this.ctx.createGain();
            oscGain.gain.value = 0.25;
            osc.connect(oscGain);
            oscGain.connect(this.ambientGain);
            osc.start();
            return osc;
        });

        // Gentle LFO for shimmer
        this._ambientLFO = setInterval(() => {
            if (this.ambientOscillators) {
                this.ambientOscillators.forEach(osc => {
                    osc.detune.setTargetAtTime(
                        Math.random() * 20 - 10,
                        this.ctx.currentTime,
                        2
                    );
                });
            }
        }, 3000);
    }

    // Portal hum
    playPortalHum() {
        if (!this.initialized) this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.value = 55;

        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 2);
    }

    // Rain ambient
    playRainAmbient(isRaining) {
        if (!this.initialized) this.init();
        if (!this.ctx) return;

        if (isRaining && !this.rainNoise) {
            // White noise for rain
            const bufferSize = this.ctx.sampleRate * 2;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const channel = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                channel[i] = (Math.random() * 2 - 1) * 0.3;
            }

            this.rainNoise = this.ctx.createBufferSource();
            this.rainNoise.buffer = buffer;
            this.rainNoise.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 800;

            this.rainGain = this.ctx.createGain();
            this.rainGain.gain.value = 0;
            this.rainGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 2);

            this.rainNoise.connect(filter);
            filter.connect(this.rainGain);
            this.rainGain.connect(this.masterGain);
            this.rainNoise.start();
        } else if (!isRaining && this.rainNoise) {
            this.rainGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
            const node = this.rainNoise;
            setTimeout(() => {
                try { node.stop(); } catch (e) { }
            }, 1500);
            this.rainNoise = null;
        }
    }
}
