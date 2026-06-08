"use client";

import { Github, Twitter, Linkedin, Globe, PenTool } from "lucide-react";

export default function LivePreview({ portfolio, isPublic = false }: any) {
  const { name, bio, projects, socialLinks, theme, template, vibe = 'professional' } = portfolio;

  const primaryColor = theme?.primaryColor || '#3b82f6';
  const isDark = theme?.mode === 'dark';

  // ─── Vibe Config ───────────────────────────────────────────────────────────
  const getVibeConfig = () => {
    switch (vibe) {
      case 'hacker':
        return {
          accentColor: primaryColor,  // user-controlled; defaults to #22c55e when vibe selected
          bgColor: isDark ? '#000000' : '#f0fdf4',
          textColor: isDark ? '#a3e635' : '#166534',
          mutedColor: isDark ? '#86efac' : '#15803d',
          fontFamily: "'Courier New', Courier, monospace",
          borderColor: isDark ? '#14532d' : '#bbf7d0',
          sidebarBg: isDark ? '#000000' : '#f0fdf4',
          sidebarBorder: `2px solid ${primaryColor}`,
          sectionTitleColor: primaryColor,
          dividerColor: primaryColor,
          cardBg: isDark ? '#050505' : '#f0fdf4',
          cardBorderColor: isDark ? '#14532d' : '#bbf7d0',
          profileBorderColor: primaryColor,
          nameShadow: `0 0 40px ${primaryColor}44`,
        };
      case 'creative':
        return {
          accentColor: primaryColor,  // user-controlled; defaults to #ec4899 when vibe selected
          bgColor: isDark ? '#1a1025' : '#fdf4fc',
          textColor: isDark ? '#f0e6ff' : '#1a1025',
          mutedColor: isDark ? '#c084fc' : '#9333ea',
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          borderColor: isDark ? '#4c1d95' : '#f5d0fe',
          sidebarBg: isDark ? 'linear-gradient(180deg,#3b0764,#4a044e)' : 'linear-gradient(180deg,#f5d0fe,#fce7f3)',
          sidebarBorder: `1px solid ${primaryColor}`,
          sectionTitleColor: primaryColor,
          dividerColor: primaryColor,
          cardBg: isDark ? '#1e0a35' : '#fdf4fc',
          cardBorderColor: isDark ? '#4c1d95' : '#f5d0fe',
          profileBorderColor: primaryColor,
          nameShadow: `0 0 60px ${primaryColor}55`,
        };
      default: // professional
        return {
          accentColor: primaryColor,
          bgColor: isDark ? '#09090b' : '#ffffff',
          textColor: isDark ? '#ffffff' : '#09090b',
          mutedColor: isDark ? '#a1a1aa' : '#71717a',
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          borderColor: isDark ? '#27272a' : '#e4e4e7',
          sidebarBg: isDark ? 'rgba(24,24,27,0.5)' : 'rgba(244,244,245,0.5)',
          sidebarBorder: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
          sectionTitleColor: primaryColor,
          dividerColor: isDark ? '#27272a' : '#e4e4e7',
          cardBg: isDark ? '#18181b' : '#f9fafb',
          cardBorderColor: isDark ? '#27272a' : '#e4e4e7',
          profileBorderColor: primaryColor,
          nameShadow: 'none',
        };
    }
  };

  const vc = getVibeConfig();
  const fallbackImage = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop";

  const wrapperStyle: React.CSSProperties = {
    backgroundColor: vc.bgColor,
    color: vc.textColor,
    fontFamily: vc.fontFamily,
    transition: 'all 0.6s ease',
  };

  const wrapperClass = `transition-all duration-700 ${
    isPublic ? 'min-h-screen' : 'min-h-[90vh] rounded-2xl overflow-hidden shadow-2xl border'
  }`;

  // ─── SIDEBAR TEMPLATE ──────────────────────────────────────────────────────
  if (template === 'sidebar') {
    return (
      <div className={wrapperClass} style={{ ...wrapperStyle, borderColor: vc.borderColor }}>
        <div className="flex flex-col md:flex-row relative min-h-[inherit]">

          {/* Sidebar */}
          <aside
            className="md:w-1/3 md:min-h-full p-10 md:sticky md:top-0 md:h-screen flex flex-col justify-between transition-all md:border-r"
            style={{ background: vc.sidebarBg, border: vc.sidebarBorder, fontFamily: vc.fontFamily }}
          >
            <div className="animate-in fade-in slide-in-from-left-4 duration-1000">
              {portfolio.profileImage && (
                <div className="relative inline-block mb-8 group">
                  <div className="absolute -inset-1 rounded-full blur opacity-30 group-hover:opacity-80 transition duration-700"
                    style={{ background: `linear-gradient(135deg, ${vc.accentColor}, ${vc.mutedColor})` }}
                  />
                  <img
                    src={portfolio.profileImage}
                    alt="Profile"
                    className="relative w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-2xl border-4"
                    style={{ borderColor: vc.profileBorderColor }}
                    onError={(e: any) => e.target.src = fallbackImage}
                  />
                </div>
              )}

              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-tight" style={{ color: vc.accentColor }}>
                {name || "Your Name"}
                <span className="block w-12 h-1.5 mt-4 rounded-full" style={{ backgroundColor: vc.accentColor }} />
              </h1>

              <p className="text-lg leading-relaxed font-medium" style={{ color: vc.mutedColor }}>
                {bio || "Your professional narrative starts here. Describe your impact and vision."}
              </p>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 mt-10 md:mt-0 flex-wrap">
              {socialLinks?.github && <SocialIcon href={socialLinks.github} icon={<Github size={22} />} accentColor={vc.accentColor} textColor={vc.textColor} />}
              {socialLinks?.twitter && <SocialIcon href={socialLinks.twitter} icon={<Twitter size={22} />} accentColor={vc.accentColor} textColor={vc.textColor} />}
              {socialLinks?.linkedin && <SocialIcon href={socialLinks.linkedin} icon={<Linkedin size={22} />} accentColor={vc.accentColor} textColor={vc.textColor} />}
              {socialLinks?.website && <SocialIcon href={socialLinks.website} icon={<Globe size={22} />} accentColor={vc.accentColor} textColor={vc.textColor} />}
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 p-10 md:p-20 overflow-y-auto">
            <section>
              <div className="flex items-center gap-6 mb-16">
                <h2 className="text-sm font-black uppercase tracking-[0.3em]" style={{ color: vc.sectionTitleColor, opacity: 0.7 }}>
                  Featured Projects
                </h2>
                <div className="h-px flex-1" style={{ backgroundColor: vc.dividerColor }} />
              </div>

              <div className="flex flex-col gap-16 pb-20">
                {projects?.length > 0 ? projects.map((proj: any, idx: number) => (
                  <a key={idx} href={proj.link || "#"} target="_blank" rel="noreferrer"
                    className="block group flex flex-col lg:flex-row gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-700"
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    <div className="relative w-full lg:w-64 h-44 overflow-hidden rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500">
                      <img src={proj.imageUrl || fallbackImage} alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e: any) => e.target.src = fallbackImage}
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition duration-500" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border opacity-50"
                        style={{ borderColor: vc.accentColor, color: vc.accentColor }}>Case Study</div>
                      <h3 className="text-3xl font-black mb-4 tracking-tight group-hover:opacity-80 transition-opacity"
                        style={{ color: vc.accentColor }}>
                        {proj.title || "Untitled Masterpiece"}
                      </h3>
                      <p className="text-lg leading-relaxed max-w-2xl" style={{ color: vc.mutedColor }}>
                        {proj.description || "Detailed project insights will appear here..."}
                      </p>
                      <div className="mt-6 flex items-center gap-2 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: vc.accentColor }}>
                        View Project <Globe size={14} />
                      </div>
                    </div>
                  </a>
                )) : <EmptyProjects accentColor={vc.accentColor} />}
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  // ─── MINIMAL TEMPLATE ──────────────────────────────────────────────────────
  return (
    <div className={wrapperClass} style={{ ...wrapperStyle, borderColor: vc.borderColor }}>
      <div className={isPublic ? "max-w-6xl mx-auto p-8 md:p-24" : "p-10 md:p-20"}>

        <header className={isPublic ? "mb-40 mt-16" : "mb-24"}>
          {portfolio.profileImage && (
            <div className="relative inline-block mb-10 group animate-in zoom-in duration-1000">
              <div className="absolute -inset-4 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000"
                style={{ background: `linear-gradient(to tr, ${vc.accentColor}33, ${vc.mutedColor}33)` }}
              />
              <img
                src={portfolio.profileImage}
                alt="Profile"
                className="relative w-32 h-32 md:w-48 md:h-48 rounded-3xl object-cover shadow-2xl border-2 rotate-3 group-hover:rotate-0 transition-transform duration-500"
                style={{ borderColor: vc.profileBorderColor }}
                onError={(e: any) => e.target.src = fallbackImage}
              />
            </div>
          )}

          <h1
            className="text-6xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85] animate-in fade-in slide-in-from-bottom-8 duration-700"
            style={{ color: vc.textColor, textShadow: vc.nameShadow }}
          >
            {name || "Your Name"}
          </h1>

          {/* Accent bar under name */}
          <div className="w-20 h-1.5 rounded-full mb-8" style={{ backgroundColor: vc.accentColor }} />

          <p className="text-2xl md:text-3xl leading-relaxed max-w-3xl font-medium tracking-tight mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000"
            style={{ color: vc.mutedColor }}>
            {bio || "Crafting digital experiences with precision and purpose."}
          </p>

          {/* Social Links */}
          <div className="flex gap-8 mt-10">
            {socialLinks?.github && <SocialIcon href={socialLinks.github} icon={<Github size={28} />} accentColor={vc.accentColor} textColor={vc.textColor} large />}
            {socialLinks?.twitter && <SocialIcon href={socialLinks.twitter} icon={<Twitter size={28} />} accentColor={vc.accentColor} textColor={vc.textColor} large />}
            {socialLinks?.linkedin && <SocialIcon href={socialLinks.linkedin} icon={<Linkedin size={28} />} accentColor={vc.accentColor} textColor={vc.textColor} large />}
            {socialLinks?.website && <SocialIcon href={socialLinks.website} icon={<Globe size={28} />} accentColor={vc.accentColor} textColor={vc.textColor} large />}
          </div>
        </header>

        <section className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
          {/* Section Header */}
          <div className="flex items-center gap-10 mb-16">
            <h2 className="text-4xl font-black tracking-tighter whitespace-nowrap" style={{ color: vc.accentColor }}>
              Work.
            </h2>
            <div className="h-[2px] flex-1" style={{ backgroundColor: vc.dividerColor }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-32">
            {projects?.length > 0 ? projects.map((proj: any, idx: number) => (
              <a key={idx} href={proj.link || "#"} target="_blank" rel="noreferrer"
                className="block group relative p-10 rounded-[2.5rem] border transition-all duration-500 hover:shadow-2xl"
                style={{
                  backgroundColor: vc.cardBg,
                  borderColor: vc.cardBorderColor,
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = vc.accentColor)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = vc.cardBorderColor)}
              >
                <div className="relative h-64 mb-8 overflow-hidden rounded-3xl shadow-lg">
                  <img src={proj.imageUrl || fallbackImage} alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    onError={(e: any) => e.target.src = fallbackImage}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-black tracking-[0.2em] uppercase">Open Project</span>
                  </div>
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tight leading-tight group-hover:translate-x-1 transition-transform duration-300"
                  style={{ color: vc.accentColor }}>
                  {proj.title || "Project Title"}
                </h3>
                <p className="text-lg leading-relaxed" style={{ color: vc.mutedColor }}>
                  {proj.description || "Synthesizing complex goals into elegant solutions."}
                </p>
              </a>
            )) : <EmptyProjects accentColor={vc.accentColor} />}
          </div>
        </section>
      </div>
    </div>
  );
}

function SocialIcon({ href, icon, accentColor, textColor, large = false }: any) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`hover:-translate-y-1.5 transition-all duration-500 ${large ? 'opacity-40 hover:opacity-100' : 'opacity-60 hover:opacity-100'}`}
      style={{ color: textColor }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = accentColor)}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = textColor)}
    >
      {icon}
    </a>
  );
}

function EmptyProjects({ accentColor }: { accentColor: string }) {
  return (
    <div className="col-span-2 p-20 rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center text-center opacity-40"
      style={{ borderColor: accentColor }}>
      <PenTool className="w-12 h-12 mb-4" style={{ color: accentColor }} />
      <p className="text-xl font-bold tracking-tight">Curating your masterpieces...</p>
    </div>
  );
}
