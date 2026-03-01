export class MobileFallback {
    constructor() {
        this.container = document.getElementById('mobile-fallback');
    }

    activate() {
        // Hide 3D canvas and HUD
        document.getElementById('canvas-container').style.display = 'none';
        document.getElementById('hud').style.display = 'none';
        document.getElementById('loading-screen').style.display = 'none';
        this.container.style.display = 'block';
        document.body.style.overflow = 'auto';

        this.container.innerHTML = this._buildContent();
        this._animateOnScroll();
    }

    _buildContent() {
        return `
      <div style="text-align:center;padding:40px 20px 20px;">
        <div style="font-size:3rem;margin-bottom:12px;">⛏️</div>
        <h1 style="font-family:'Press Start 2P',monospace;font-size:1rem;background:linear-gradient(90deg,#00f0ff,#8b5cf6,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">VOXEL PORTFOLIO</h1>
      </div>

      <div class="mobile-section" data-anim>
        <span class="voxel-decoration">🏠</span>
        <h2>About Me</h2>
        <p>Hey there! I'm a passionate Full-Stack Developer who loves building immersive digital experiences. With a background in both frontend elegance and backend robustness, I bring ideas to life through clean, scalable code.</p>
        <p style="margin-top:8px;">When I'm not coding, you'll find me exploring open-source projects, tinkering with game development, or diving deep into new technologies.</p>
      </div>

      <div class="mobile-section" data-anim>
        <span class="voxel-decoration">🏰</span>
        <h2>Projects</h2>
        ${this._mobileProjectCard('🌐 E-Commerce Platform', 'Full-featured platform with real-time inventory and AI recommendations.', ['React', 'Node.js', 'MongoDB'])}
        ${this._mobileProjectCard('🤖 AI Chat Assistant', 'Intelligent chatbot with NLU and multi-model support.', ['Python', 'FastAPI', 'LangChain'])}
        ${this._mobileProjectCard('📊 Analytics Dashboard', 'Real-time analytics processing millions of events.', ['TypeScript', 'Next.js', 'D3.js'])}
        ${this._mobileProjectCard('🎮 Game Engine', 'Browser-based multiplayer engine powering indie games.', ['Three.js', 'WebRTC', 'Rust'])}
      </div>

      <div class="mobile-section" data-anim>
        <span class="voxel-decoration">⛏️</span>
        <h2>Skills</h2>
        ${this._mobileSkill('JavaScript', 95, '#22d3ee')}
        ${this._mobileSkill('TypeScript', 90, '#22d3ee')}
        ${this._mobileSkill('React', 92, '#22d3ee')}
        ${this._mobileSkill('Node.js', 88, '#22d3ee')}
        ${this._mobileSkill('Python', 85, '#fbbf24')}
        ${this._mobileSkill('Three.js', 82, '#fbbf24')}
        ${this._mobileSkill('Docker', 78, '#fbbf24')}
        ${this._mobileSkill('AWS', 75, '#9ca3af')}
      </div>

      <div class="mobile-section" data-anim>
        <span class="voxel-decoration">🗼</span>
        <h2>Experience</h2>
        ${this._mobileTimeline('2024 — Present', 'Senior Full-Stack Developer', 'Leading cloud-native app development and mentoring.')}
        ${this._mobileTimeline('2022 — 2024', 'Full-Stack Developer', 'Built production apps, CI/CD pipelines, 90% test coverage.')}
        ${this._mobileTimeline('2021 — 2022', 'Frontend Developer', 'React apps, component libraries, state management.')}
        ${this._mobileTimeline('2020 — 2021', 'Junior Developer', 'First production app, open-source contributions.')}
      </div>

      <div class="mobile-section" data-anim>
        <span class="voxel-decoration">🌀</span>
        <h2>Contact</h2>
        <p>Ready to connect? Let's build something amazing together.</p>
        <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">
          <a href="mailto:hello@example.com" style="color:#4ade80;font-family:'Press Start 2P',monospace;font-size:0.5rem;text-decoration:none;">📧 hello@example.com</a>
          <a href="https://github.com" target="_blank" style="color:#4ade80;font-family:'Press Start 2P',monospace;font-size:0.5rem;text-decoration:none;">🐙 GitHub</a>
          <a href="https://linkedin.com" target="_blank" style="color:#4ade80;font-family:'Press Start 2P',monospace;font-size:0.5rem;text-decoration:none;">💼 LinkedIn</a>
        </div>
      </div>

      <div style="text-align:center;padding:20px;font-size:0.7rem;color:rgba(255,255,255,0.3);">
        <p>🎮 Visit on desktop for the full 3D experience!</p>
      </div>
    `;
    }

    _mobileProjectCard(title, desc, tags) {
        const tagHTML = tags.map(t =>
            `<span style="font-family:'Press Start 2P',monospace;font-size:0.35rem;background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.25);color:#c4b5fd;padding:3px 6px;border-radius:3px;">${t}</span>`
        ).join(' ');
        return `
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:12px;margin-bottom:10px;">
        <div style="font-family:'Press Start 2P',monospace;font-size:0.45rem;color:#4ade80;margin-bottom:4px;">${title}</div>
        <p style="font-size:0.8rem;color:rgba(255,255,255,0.55);margin-bottom:6px;">${desc}</p>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">${tagHTML}</div>
      </div>
    `;
    }

    _mobileSkill(name, level, color) {
        return `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="font-family:'Press Start 2P',monospace;font-size:0.4rem;min-width:90px;color:#e0e0e0;">${name}</span>
        <div style="flex:1;height:10px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;">
          <div style="width:${level}%;height:100%;background:${color};border-radius:3px;transition:width 1s ease;"></div>
        </div>
      </div>
    `;
    }

    _mobileTimeline(year, role, desc) {
        return `
      <div style="padding-left:16px;border-left:2px solid rgba(139,92,246,0.3);margin-bottom:14px;">
        <div style="font-family:'Press Start 2P',monospace;font-size:0.4rem;color:#4ade80;margin-bottom:2px;">${year}</div>
        <div style="font-family:'Press Start 2P',monospace;font-size:0.45rem;color:#a78bfa;margin-bottom:2px;">${role}</div>
        <p style="font-size:0.78rem;color:rgba(255,255,255,0.55);">${desc}</p>
      </div>
    `;
    }

    _animateOnScroll() {
        const sections = this.container.querySelectorAll('[data-anim]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(s => {
            s.style.opacity = '0';
            s.style.transform = 'translateY(20px)';
            s.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(s);
        });
    }

    static shouldUseFallback() {
        const isMobile = window.innerWidth < 768;
        const isLowPerf = !window.WebGLRenderingContext;
        return isMobile || isLowPerf;
    }
}
