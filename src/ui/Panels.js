export class Panels {
  constructor() {
    this.overlay = document.getElementById('panel-overlay');
    this.panel = document.getElementById('panel');
    this.content = document.getElementById('panel-content');
    this.closeBtn = document.getElementById('panel-close');
    this.isOpen = false;
    this.closeCooldown = false; // Initialize cooldown state

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.close();
      });
    }
    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.close();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });

    this.sections = {
      about: this._aboutContent(),
      projects: this._projectsContent(),
      skills: this._skillsContent(),
      experience: this._experienceContent(),
      contact: this._contactContent(),
    };
  }

  open(sectionId) {
    if (!this.sections[sectionId]) return;
    this.content.innerHTML = this.sections[sectionId];
    this.overlay.style.display = 'flex';
    // Remember if user was in FPS before opening
    this.wasInFPS = !!document.pointerLockElement;
    this.isOpen = true;
    document.exitPointerLock();

    // Animate skill bars
    setTimeout(() => {
      this.content.querySelectorAll('.bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.width;
      });
    }, 100);
  }

  close() {
    this.overlay.style.display = 'none';
    this.isOpen = false;
    // Cooldown prevents the close-click from triggering a structure behind the button
    this.closeCooldown = true;
    setTimeout(() => { this.closeCooldown = false; }, 300);
    // Re-enter FPS if user was in it before opening the panel
    if (this.wasInFPS) {
      const canvas = document.querySelector('#canvas-container canvas');
      if (canvas) {
        setTimeout(() => canvas.requestPointerLock(), 100);
      }
    }
    this.wasInFPS = false;
  }

  // ─── SECTION CONTENT ──────────────────────────

  _aboutContent() {
    return `
      <h2>📖 About Me</h2>
      <p>Hey there! I'm a passionate <strong>Full-Stack Developer</strong> who loves building immersive digital experiences. With a background in both frontend elegance and backend robustness, I bring ideas to life through clean, scalable code.</p>
      <p>When I'm not coding, you'll find me exploring open-source projects, tinkering with game development, or diving deep into new technologies. I believe in writing code that not only works but tells a story.</p>
      <h3>🛠 What I Do</h3>
      <p>I specialize in building performant web applications, interactive 3D experiences, and developer tools. I'm passionate about user experience, performance optimization, and pushing the boundaries of what's possible on the web.</p>
      <h3>🎯 Philosophy</h3>
      <p><em>"Build things that make people go wow."</em></p>
    `;
  }

  _projectsContent() {
    return `
      <h2>🏰 Projects</h2>
      <div class="project-card">
        <h4>🌐 E-Commerce Platform</h4>
        <p>A full-featured e-commerce platform with real-time inventory, AI-powered recommendations, and seamless checkout. Handles 10K+ concurrent users.</p>
        <div class="tech-tags">
          <span class="tech-tag">React</span>
          <span class="tech-tag">Node.js</span>
          <span class="tech-tag">MongoDB</span>
          <span class="tech-tag">Redis</span>
          <span class="tech-tag">Stripe</span>
        </div>
      </div>
      <div class="project-card">
        <h4>🤖 AI Chat Assistant</h4>
        <p>An intelligent chatbot platform with natural language understanding, context retention, and multi-model support. Deployed across 50+ business clients.</p>
        <div class="tech-tags">
          <span class="tech-tag">Python</span>
          <span class="tech-tag">FastAPI</span>
          <span class="tech-tag">LangChain</span>
          <span class="tech-tag">PostgreSQL</span>
          <span class="tech-tag">Docker</span>
        </div>
      </div>
      <div class="project-card">
        <h4>📊 Real-Time Analytics Dashboard</h4>
        <p>A blazing-fast analytics dashboard processing millions of events with live visualizations, custom queries, and automated alerts.</p>
        <div class="tech-tags">
          <span class="tech-tag">TypeScript</span>
          <span class="tech-tag">Next.js</span>
          <span class="tech-tag">ClickHouse</span>
          <span class="tech-tag">WebSocket</span>
          <span class="tech-tag">D3.js</span>
        </div>
      </div>
      <div class="project-card">
        <h4>🎮 Multiplayer Game Engine</h4>
        <p>A lightweight browser-based multiplayer game engine with physics, networking, and asset management. Powers 3 published indie games.</p>
        <div class="tech-tags">
          <span class="tech-tag">Three.js</span>
          <span class="tech-tag">WebRTC</span>
          <span class="tech-tag">Rust</span>
          <span class="tech-tag">WASM</span>
        </div>
      </div>
    `;
  }

  _skillsContent() {
    const skills = [
      { name: 'JavaScript', level: 95, tier: 'diamond' },
      { name: 'TypeScript', level: 90, tier: 'diamond' },
      { name: 'React', level: 92, tier: 'diamond' },
      { name: 'Node.js', level: 88, tier: 'diamond' },
      { name: 'Python', level: 85, tier: 'gold' },
      { name: 'Three.js', level: 82, tier: 'gold' },
      { name: 'PostgreSQL', level: 80, tier: 'gold' },
      { name: 'Docker', level: 78, tier: 'gold' },
      { name: 'AWS', level: 75, tier: 'iron' },
      { name: 'Rust', level: 65, tier: 'iron' },
      { name: 'Go', level: 60, tier: 'iron' },
    ];

    const legend = `
      <div style="display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap;">
        <span style="font-family:'Press Start 2P';font-size:0.4rem;color:#22d3ee;">💎 Diamond = Expert</span>
        <span style="font-family:'Press Start 2P';font-size:0.4rem;color:#fbbf24;">🥇 Gold = Strong</span>
        <span style="font-family:'Press Start 2P';font-size:0.4rem;color:#9ca3af;">⛏️ Iron = Proficient</span>
      </div>
    `;

    const bars = skills.map(s => `
      <div class="skill-bar">
        <span class="skill-name">${s.name}</span>
        <div class="bar-bg">
          <div class="bar-fill ${s.tier}" style="width:0%" data-width="${s.level}%"></div>
        </div>
      </div>
    `).join('');

    return `<h2>⛏️ Skills Mine</h2>${legend}${bars}`;
  }

  _experienceContent() {
    return `
      <h2>🗼 Experience</h2>
      <div class="timeline-item">
        <div class="year">2024 — Present</div>
        <h3>Senior Full-Stack Developer</h3>
        <p>Leading development of cloud-native applications. Architecting microservices, mentoring junior developers, and driving technical decisions.</p>
      </div>
      <div class="timeline-item">
        <div class="year">2022 — 2024</div>
        <h3>Full-Stack Developer</h3>
        <p>Built and maintained multiple production applications. Implemented CI/CD pipelines, improved test coverage to 90%, and optimized database performance.</p>
      </div>
      <div class="timeline-item">
        <div class="year">2021 — 2022</div>
        <h3>Frontend Developer</h3>
        <p>Developed responsive web applications with React. Created reusable component libraries and implemented complex state management patterns.</p>
      </div>
      <div class="timeline-item">
        <div class="year">2020 — 2021</div>
        <h3>Junior Developer</h3>
        <p>Started my journey building web applications. Learned full-stack development, contributed to open-source projects, and shipped my first production app.</p>
      </div>
    `;
  }

  _contactContent() {
    return `
      <h2>🌀 Contact Portal</h2>
      <p>Ready to connect? Step through the portal and let's build something amazing together.</p>
      <a href="mailto:hello@example.com" class="contact-link">
        <span class="link-icon">📧</span>
        <span class="link-label">hello@example.com</span>
      </a>
      <a href="https://github.com" target="_blank" class="contact-link">
        <span class="link-icon">🐙</span>
        <span class="link-label">GitHub</span>
      </a>
      <a href="https://linkedin.com" target="_blank" class="contact-link">
        <span class="link-icon">💼</span>
        <span class="link-label">LinkedIn</span>
      </a>
      <a href="https://twitter.com" target="_blank" class="contact-link">
        <span class="link-icon">🐦</span>
        <span class="link-label">Twitter / X</span>
      </a>
      <a href="#" class="contact-link">
        <span class="link-icon">📄</span>
        <span class="link-label">Download Resume</span>
      </a>
    `;
  }
}
