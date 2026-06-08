export function generateCode(portfolio: any) {
  const primaryColor = portfolio.theme?.primaryColor || '#3b82f6';
  const isDark = portfolio.theme?.mode === 'dark';
  const vibe = portfolio.vibe || 'professional';

  let fontImport = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">';
  let fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  let vPrimary = primaryColor;
  let vBg = isDark ? '#09090b' : '#ffffff';
  let vText = isDark ? '#ffffff' : '#09090b';
  let vTextMuted = isDark ? '#a1a1aa' : '#71717a';
  let vCardBg = isDark ? '#18181b' : '#f4f4f5';
  let vBorder = isDark ? '#27272a' : '#e4e4e7';
  let sidebarBg = isDark ? 'rgba(24, 24, 27, 0.5)' : 'rgba(244, 244, 245, 0.5)';
  let headerBg = isDark ? '#18181b' : '#fafafa';
  let extraCss = '';

  // SVG icons for social links (inline, no external dependency)
  const githubSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>`;
  const twitterSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.739l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
  const linkedinSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`;
  const globeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;

  if (vibe === 'hacker') {
    fontImport = '<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">';
    fontFamily = "'Space Mono', monospace";
    vBg = isDark ? '#000000' : '#f0fdf4';
    vText = isDark ? '#a3e635' : '#166534';
    vTextMuted = isDark ? '#86efac' : '#15803d';
    vCardBg = isDark ? '#050505' : '#f0fdf4';
    vBorder = isDark ? `${vPrimary}44` : `${vPrimary}33`;
    sidebarBg = isDark ? '#000000' : '#f0fdf4';
    headerBg = isDark ? '#000000' : '#f0fdf4';
    extraCss = `
      h1, h2, h3 { font-family: 'Space Mono', monospace; text-transform: uppercase; letter-spacing: -1px; }
      .sidebar { border-left-width: 2px; border-left-color: ${vPrimary}; background: ${sidebarBg}; }
      .profile-img { box-shadow: 0 0 20px ${vPrimary}66; border-color: ${vPrimary}; }
      .section-title { color: ${vPrimary}; opacity: 0.7; }
    `;
  } else if (vibe === 'creative') {
    fontImport = '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap" rel="stylesheet">';
    fontFamily = "'Outfit', sans-serif";
    vBg = isDark ? '#1a1025' : '#fdf4fc'; 
    vText = isDark ? '#f0e6ff' : '#1a1025';
    vTextMuted = isDark ? '#c084fc' : '#9333ea';
    vCardBg = isDark ? '#1e0a35' : '#fdf4fc';
    vBorder = isDark ? '#4c1d95' : '#f5d0fe';
    sidebarBg = isDark ? 'linear-gradient(180deg, #3b0764, #4a044e)' : 'linear-gradient(180deg, #f5d0fe, #fce7f3)';
    headerBg = isDark ? 'linear-gradient(to right, #4f1a6b, #5a1764)' : 'linear-gradient(to right, #f5e7f8, #fae8f8)';
    extraCss = `
      h1 { 
        background: linear-gradient(to right, ${vPrimary}, ${vPrimary}aa); 
        -webkit-background-clip: text; 
        -webkit-text-fill-color: transparent; 
        background-clip: text;
      }
      .profile-img { border-color: ${vPrimary}80; box-shadow: 0 0 32px ${vPrimary}44; }
      .section-title { color: ${vPrimary}; opacity: 0.8; }
    `;
  }

  // 1. Generate index.html based on template
  let templateHtml = '';
  const fallbackImage = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop";
  
  if (portfolio.template === 'sidebar') {
    templateHtml = `
    <div class="sidebar-layout">
      <aside class="sidebar">
        <div class="sidebar-top">
          ${portfolio.profileImage ? `<div class="profile-wrapper"><img src="${portfolio.profileImage}" alt="Profile" class="profile-img" onerror="this.src='${fallbackImage}'"></div>` : ''}
          <h1 class="sidebar-title">${portfolio.name || 'Your Name'}</h1>
          <p class="sidebar-bio">${portfolio.bio || 'Your professional narrative starts here.'}</p>
        </div>
        <div class="social-links">
          ${portfolio.socialLinks?.github ? `<a href="${portfolio.socialLinks.github}" target="_blank" rel="noreferrer" title="GitHub">${githubSvg}</a>` : ''}
          ${portfolio.socialLinks?.twitter ? `<a href="${portfolio.socialLinks.twitter}" target="_blank" rel="noreferrer" title="Twitter">${twitterSvg}</a>` : ''}
          ${portfolio.socialLinks?.linkedin ? `<a href="${portfolio.socialLinks.linkedin}" target="_blank" rel="noreferrer" title="LinkedIn">${linkedinSvg}</a>` : ''}
          ${portfolio.socialLinks?.website ? `<a href="${portfolio.socialLinks.website}" target="_blank" rel="noreferrer" title="Website">${globeSvg}</a>` : ''}
        </div>
      </aside>
      <main class="content">
        <section class="projects-section">
          <div class="section-header">
            <h2 class="section-title">Featured Projects</h2>
            <div class="section-divider"></div>
          </div>
          <div class="project-list">
            ${portfolio.projects && portfolio.projects.length > 0 ? portfolio.projects.map((p: any) => `
            <a href="${p.link || '#'}" target="_blank" rel="noreferrer" class="project-card">
              <div class="project-image-wrapper">
                <img src="${p.imageUrl || fallbackImage}" alt="${p.title}" class="project-img" onerror="this.src='${fallbackImage}'">
                <div class="project-overlay"></div>
              </div>
              <div class="project-info">
                <div class="project-badge">Case Study</div>
                <h3>${p.title || 'Untitled Masterpiece'}</h3>
                <p>${p.description || 'Detailed project insights will appear here...'}</p>
                <div class="project-link-hint">View Project →</div>
              </div>
            </a>
            `).join('') : '<div class="empty-projects">Curating your masterpieces...</div>'}
          </div>
        </section>
      </main>
    </div>`;
  } else {
    templateHtml = `
    <div class="minimal-layout">
      <header class="header-section">
        ${portfolio.profileImage ? `<div class="header-image-wrapper"><img src="${portfolio.profileImage}" alt="Profile" class="header-img" onerror="this.src='${fallbackImage}'"></div>` : ''}
        <h1 class="main-title">${portfolio.name || 'Your Name'}</h1>
        <p class="main-bio">${portfolio.bio || 'Crafting digital experiences with precision and purpose.'}</p>
        <div class="social-links-main">
          ${portfolio.socialLinks?.github ? `<a href="${portfolio.socialLinks.github}" target="_blank" rel="noreferrer" class="social-icon" title="GitHub">${githubSvg}</a>` : ''}
          ${portfolio.socialLinks?.twitter ? `<a href="${portfolio.socialLinks.twitter}" target="_blank" rel="noreferrer" class="social-icon" title="Twitter">${twitterSvg}</a>` : ''}
          ${portfolio.socialLinks?.linkedin ? `<a href="${portfolio.socialLinks.linkedin}" target="_blank" rel="noreferrer" class="social-icon" title="LinkedIn">${linkedinSvg}</a>` : ''}
          ${portfolio.socialLinks?.website ? `<a href="${portfolio.socialLinks.website}" target="_blank" rel="noreferrer" class="social-icon" title="Website">${globeSvg}</a>` : ''}
        </div>
      </header>

      <section class="work-section">
        <div class="work-header">
          <h2 class="work-title">Work.</h2>
          <div class="work-divider"></div>
        </div>
        <div class="grid">
          ${portfolio.projects && portfolio.projects.length > 0 ? portfolio.projects.map((p: any) => `
          <a href="${p.link || '#'}" target="_blank" rel="noreferrer" class="card">
            <div class="card-image-wrapper">
              <img src="${p.imageUrl || fallbackImage}" alt="${p.title}" class="card-img" onerror="this.src='${fallbackImage}'">
              <div class="card-overlay">
                <span>Open Project</span>
              </div>
            </div>
            <div class="card-content">
              <h3 class="card-title">${p.title || 'Project Title'}</h3>
              <p class="card-description">${p.description || 'Synthesizing complex goals into elegant solutions.'}</p>
            </div>
          </a>
          `).join('') : '<div class="empty-state">Curating your masterpieces...</div>'}
        </div>
      </section>
    </div>`;
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${portfolio.name}'s Portfolio</title>
    <link rel="stylesheet" href="style.css">
    ${fontImport}
</head>
<body class="${isDark ? 'dark' : 'light'}">
    ${templateHtml}
    <footer class="footer">
        BUILT WITH PORTFOLIOBUILDER
    </footer>
</body>
</html>`;

  // 2. Generate comprehensive style.css matching LivePreview
const cssContent = `
:root {
    --primary: ${vPrimary};
    --bg: ${vBg};
    --text: ${vText};
    --text-muted: ${vTextMuted};
    --card-bg: ${vCardBg};
    --border: ${vBorder};
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    width: 100%;
    height: auto;
    font-family: ${fontFamily};
}

body {
    background-color: var(--bg);
    color: var(--text);
    line-height: 1.6;
    transition: background-color 0.3s ease, color 0.3s ease;
}

a {
    text-decoration: none;
    color: inherit;
    transition: all 0.3s ease;
}

h1, h2, h3, h4 {
    line-height: 1.2;
    margin: 0;
}

/* ========== MINIMAL LAYOUT ========== */
.minimal-layout {
    max-width: 1200px;
    margin: 0 auto;
    padding: 6rem 2rem;
}

.header-section {
    margin-bottom: 8rem;
    animation: fadeInUp 0.7s ease-out;
}

.header-image-wrapper {
    position: relative;
    display: inline-block;
    margin-bottom: 3rem;
}

.header-image-wrapper .header-img {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 48px;
    border: 3px solid white;
    box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.2);
    display: block;
    transform: rotate(3deg);
    transition: transform 0.5s ease;
}

.header-image-wrapper:hover .header-img {
    transform: rotate(0deg);
}

.header-image-wrapper::before {
    content: '';
    position: absolute;
    inset: -24px;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 50%;
    filter: blur(32px);
    opacity: 0;
    transition: opacity 1s ease;
    pointer-events: none;
}

.header-image-wrapper:hover::before {
    opacity: 1;
}

.main-title {
    font-size: clamp(3rem, 12vw, 9rem);
    font-weight: 900;
    letter-spacing: -3px;
    margin-bottom: 2rem;
    line-height: 0.85;
    animation: fadeInUp 0.7s ease-out 0.1s both;
}

.main-bio {
    font-size: clamp(1.5rem, 3vw, 2rem);
    max-width: 800px;
    color: var(--text-muted);
    margin-bottom: 3rem;
    font-weight: 500;
    line-height: 1.6;
    animation: fadeInUp 0.7s ease-out 0.2s both;
}

.social-links-main {
    display: flex;
    gap: 1.5rem;
    margin-top: 2rem;
    animation: fadeInUp 0.7s ease-out 0.3s both;
}

.social-icon {
    color: var(--text-muted);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
}

.social-icon:hover {
    color: var(--primary);
    transform: translateY(-4px);
}

.social-icon svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
}

.work-section {
    animation: fadeInUp 0.7s ease-out 0.4s both;
}

.work-header {
    display: flex;
    align-items: center;
    gap: 2.5rem;
    margin-bottom: 4rem;
}

.work-title {
    font-size: clamp(2rem, 5vw, 4rem);
    font-weight: 900;
    letter-spacing: -2px;
    white-space: nowrap;
    color: var(--primary);
}

.work-divider {
    height: 2px;
    flex: 1;
    background-color: var(--primary);
    opacity: 0.2;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 3rem;
    padding-bottom: 4rem;
}

.card {
    display: block;
    border-radius: 40px;
    border: 1px solid var(--border);
    overflow: hidden;
    background: var(--card-bg);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
    transform: translateY(-32px);
    border-color: var(--primary);
    box-shadow: 0 48px 96px -32px rgba(0, 0, 0, 0.15);
}

.card-image-wrapper {
    position: relative;
    width: 100%;
    height: 256px;
    overflow: hidden;
}

.card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover .card-img {
    transform: scale(1.05);
}

.card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0.4));
    opacity: 0;
    transition: opacity 0.5s ease;
    display: flex;
    align-items: flex-end;
    padding: 1.5rem;
}

.card:hover .card-overlay {
    opacity: 1;
}

.card-overlay span {
    color: white;
    font-size: 0.75rem;
    font-weight: 900;
    letter-spacing: 0.2em;
    text-transform: uppercase;
}

.card-content {
    padding: 2rem;
}

.card-title {
    font-size: 1.875rem;
    font-weight: 900;
    margin-bottom: 0.5rem;
    color: var(--primary);
    letter-spacing: -1px;
}

.card-description {
    font-size: 1.125rem;
    color: var(--text-muted);
    line-height: 1.6;
}

.empty-state {
    grid-column: 1 / -1;
    padding: 5rem 2rem;
    text-align: center;
    opacity: 0.4;
    font-size: 1.25rem;
    font-weight: 600;
}

/* ========== SIDEBAR LAYOUT ========== */
.sidebar-layout {
    display: flex;
    min-height: 100vh;
    flex-direction: row;
}

.sidebar {
    width: 400px;
    background: ${vibe === 'creative' ? (isDark ? 'linear-gradient(180deg, #3f1d5c, #4f1a6b)' : 'linear-gradient(180deg, #f5e7f8, #fae8f8)') : vibe === 'hacker' ? '#000000' : (isDark ? 'rgba(24, 24, 27, 0.5)' : 'rgba(244, 244, 245, 0.5)')};
    border-right: 1px solid var(--border);
    padding: 4rem 3rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: sticky;
    top: 0;
    height: 100vh;
    ${vibe === 'hacker' ? 'border-left: 2px solid #22c55e;' : ''}
}

.sidebar-top {
    flex: 1;
}

.profile-wrapper {
    position: relative;
    display: inline-block;
    margin-bottom: 2rem;
}

.profile-img {
    width: 128px;
    height: 128px;
    object-fit: cover;
    border-radius: 50%;
    border: 4px solid var(--primary);
    display: block;
    box-shadow: 0 0 32px rgba(0, 0, 0, 0.1);
}

.sidebar-title {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 900;
    color: var(--primary);
    margin-bottom: 1.5rem;
    letter-spacing: -2px;
}

.sidebar-bio {
    font-size: 1.125rem;
    color: var(--text-muted);
    line-height: 1.6;
    max-width: 100%;
}

.social-links {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.social-links a {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: var(--bg);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    text-decoration: none;
}

.social-links a:hover {
    background: var(--primary);
    color: ${isDark ? '#000000' : '#ffffff'};
    border-color: var(--primary);
    transform: translateY(-4px);
    box-shadow: 0 10px 20px ${vPrimary}33;
}

.social-links a svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
    transition: transform 0.3s ease;
}

.social-links a:hover svg {
    transform: scale(1.1);
}

.content {
    flex: 1;
    padding: 4rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.projects-section {
    flex: 1;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 4rem;
}

.section-title {
    font-size: 0.875rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    opacity: 0.4;
    white-space: nowrap;
}

.section-divider {
    height: 1px;
    flex: 1;
    background-color: var(--border);
}

.project-list {
    display: flex;
    flex-direction: column;
    gap: 4rem;
}

.project-card {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
    transition: all 0.3s ease;
}

.project-image-wrapper {
    position: relative;
    width: 280px;
    height: 180px;
    flex-shrink: 0;
    overflow: hidden;
    border-radius: 24px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.project-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.project-card:hover .project-img {
    transform: scale(1.1);
}

.project-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.2);
    opacity: 1;
    transition: all 0.5s ease;
}

.project-card:hover .project-overlay {
    background: rgba(0, 0, 0, 0);
    opacity: 0;
}

.project-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

.project-badge {
    display: inline-block;
    padding: 0.5rem 0.75rem;
    border-radius: 9999px;
    border: 1px solid var(--border);
    font-size: 0.625rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    margin-bottom: 1rem;
    opacity: 0.6;
    width: fit-content;
}

.project-info h3 {
    font-size: 2rem;
    font-weight: 900;
    margin-bottom: 1rem;
    letter-spacing: -1px;
    transition: color 0.3s ease;
}

.project-card:hover .project-info h3 {
    color: var(--primary);
}

.project-info p {
    font-size: 1.125rem;
    color: var(--text-muted);
    line-height: 1.6;
    max-width: 600px;
}

.project-link-hint {
    font-size: 0.875rem;
    font-weight: 700;
    opacity: 0;
    transform: translateX(-10px);
    transition: all 0.5s ease;
    margin-top: 1rem;
}

.project-card:hover .project-link-hint {
    opacity: 1;
    transform: translateX(0);
}

.empty-projects {
    padding: 4rem 2rem;
    text-align: center;
    opacity: 0.4;
    font-size: 1.125rem;
    font-weight: 600;
}

/* ========== FOOTER ========== */
.footer {
    text-align: center;
    padding: 2rem;
    opacity: 0.3;
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
}

/* ========== ANIMATIONS ========== */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(24px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ========== RESPONSIVE DESIGN ========== */
@media (max-width: 1200px) {
    .minimal-layout {
        padding: 4rem 1.5rem;
    }
    
    .grid {
        gap: 2rem;
    }
}

@media (max-width: 768px) {
    .header-section {
        margin-bottom: 4rem;
    }
    
    .header-image-wrapper .header-img {
        width: 140px;
        height: 140px;
    }
    
    .main-title {
        font-size: 2.5rem;
    }
    
    .main-bio {
        font-size: 1.125rem;
    }
    
    .work-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 2rem;
    }
    
    .work-title {
        font-size: 1.875rem;
    }
    
    .grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
    
    .sidebar-layout {
        flex-direction: column;
    }
    
    .sidebar {
        width: 100%;
        height: auto;
        position: static;
        border-right: none;
        border-bottom: 1px solid var(--border);
        padding: 2rem;
    }
    
    .content {
        padding: 2rem;
    }
    
    .project-card {
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .project-image-wrapper {
        width: 100%;
        height: 200px;
    }
}

@media (max-width: 480px) {
    .minimal-layout {
        padding: 2rem 1rem;
    }
    
    .main-title {
        font-size: 1.875rem;
    }
    
    .main-bio {
        font-size: 1rem;
        margin-bottom: 1.5rem;
    }
    
    .card-title {
        font-size: 1.25rem;
    }
    
    .sidebar {
        padding: 1.5rem;
    }
    
    .sidebar-title {
        font-size: 1.5rem;
    }
    
    .project-info h3 {
        font-size: 1.5rem;
    }
}

${extraCss}
`;

  return { html: htmlContent, css: cssContent };
}
