"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from "react";
import "./portfolio.css";
import { profileConfig } from "@/config/profile";
import { siteConfig } from "@/config/site";
import {
  CERTIFICATIONS,
  EXPERIENCE,
  PROJECTS,
  SKILLS,
  getTechStackByCategory,
} from "@/portfolio/portfolioContent";
import { isPlaceholder, type PortfolioCategory } from "@/portfolio/portfolioTypes";

/**
 * The 2D portfolio landing page. Section order (hero → about → 3D city
 * gateway → tech stack → skills → projects → experience →
 * certifications → contact) mirrors the structure of the reference
 * portfolio the user asked to follow (see docs/PORTFOLIO_CONTENT.md
 * "Attribution") — pattern only, no copied code/content. Every string
 * comes from config/content data files; placeholder (TODO_USER_INPUT)
 * entries render as honest "coming soon" notes, never as fabricated
 * detail.
 *
 * Motion layer (scroll reveal, cursor spotlight, card tilt, nav chrome)
 * is intentionally dependency-free: refs + IntersectionObserver +
 * rAF-throttled listeners, animating only transform/opacity so it stays
 * GPU-cheap and doesn't touch the /city bundle where the real R3F world
 * lives. All of it backs off under prefers-reduced-motion (see
 * portfolio.css).
 */
export function PortfolioPage() {
  const navRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let raf = 0;
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const doc = document.documentElement;
        const scrollTop = doc.scrollTop || document.body.scrollTop;
        const scrollable = doc.scrollHeight - doc.clientHeight;
        const pct = scrollable > 0 ? (scrollTop / scrollable) * 100 : 0;
        if (progressRef.current) progressRef.current.style.width = `${pct}%`;
        navRef.current?.classList.toggle("is-scrolled", scrollTop > 8);
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    function onMove(e: PointerEvent) {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        spotlightRef.current?.style.setProperty("--sx", `${e.clientX}px`);
        spotlightRef.current?.style.setProperty("--sy", `${e.clientY}px`);
      });
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pf-root">
      <div className="pf-spotlight" ref={spotlightRef} aria-hidden="true" />
      <div className="pf-progress" ref={progressRef} aria-hidden="true" />
      <Navbar navRef={navRef} />
      <main className="pf-container">
        <Hero />
        <CityGateway />
        <About />
        <TechStack />
        <Skills />
        <Projects />
        <Experience />
        <Certifications />
        <Contact />
      </main>
      <footer className="pf-footer">
        © {new Date().getFullYear()} {profileConfig.name} · Built with Next.js + React Three Fiber
      </footer>
    </div>
  );
}

/** Observes `ref` and flips `isIn` once the element first enters the viewport (one-shot, no re-hide on scroll-out). */
function useReveal<T extends HTMLElement = HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [isIn, setIsIn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || isIn) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsIn(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsIn(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isIn, threshold]);

  return { ref, isIn };
}

function revealClass(base: string, isIn: boolean, delay = 0) {
  return { className: `${base} pf-reveal${isIn ? " is-in" : ""}`, style: { "--pf-delay": `${delay}s` } as CSSProperties };
}

/** Cursor-tracked tilt + glow for project/certification cards — imperative CSS var writes, no re-renders. */
function handleCardMove(e: ReactMouseEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const px = (e.clientX - rect.left) / rect.width;
  const py = (e.clientY - rect.top) / rect.height;
  el.style.setProperty("--pf-rx", `${(px - 0.5) * 8}deg`);
  el.style.setProperty("--pf-ry", `${(0.5 - py) * 8}deg`);
  el.style.setProperty("--pf-mx", `${px * 100}%`);
  el.style.setProperty("--pf-my", `${py * 100}%`);
}
function handleCardLeave(e: ReactMouseEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  el.style.setProperty("--pf-rx", "0deg");
  el.style.setProperty("--pf-ry", "0deg");
}

function Navbar({ navRef }: { navRef: RefObject<HTMLElement | null> }) {
  return (
    <nav className="pf-nav" ref={navRef}>
      <div className="pf-nav-inner">
        <span className="pf-nav-name">{profileConfig.name}</span>
        <div className="pf-nav-links">
          <a href="#about">About</a>
          <a href="#tech">Tech Stack</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#experience">Experience</a>
          <a href="#contact">Contact</a>
          <Link href="/city" className="pf-nav-cta">
            3D City
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  const { ref, isIn } = useReveal<HTMLDivElement>();
  return (
    <header className="pf-hero">
      <div {...revealClass("pf-hero-content", isIn)} ref={ref}>
        <span className="pf-hero-eyebrow">Firmware · Embedded Systems · Energy Storage</span>
        <h1 className="pf-hero-title">{profileConfig.name}</h1>
        <p className="pf-hero-role">{profileConfig.professionalTitle}</p>
        <p className="pf-hero-tagline">{siteConfig.tagline}</p>
        <p className="pf-hero-location">📍 {profileConfig.publicLocationLabel}</p>
        <div className="pf-hero-actions">
          <Link href="/city" className="pf-btn pf-btn-primary">
            Enter the 3D City →
          </Link>
          <a href={siteConfig.githubUrl} target="_blank" rel="noopener noreferrer" className="pf-btn">
            GitHub
          </a>
          <a href={`mailto:${siteConfig.email}`} className="pf-btn">
            Email
          </a>
        </div>
      </div>
      <HeroCircuit />
      <a href="#about" className="pf-scroll-cue" aria-label="Scroll to About section">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </header>
  );
}

/** Decorative PCB motif standing in for the "animated 3D board" brief — pure SVG/CSS, zero runtime cost. */
function HeroCircuit() {
  return (
    <div className="pf-hero-visual" aria-hidden="true">
      <svg viewBox="0 0 320 320">
        <rect x="20" y="20" width="280" height="280" rx="24" fill="none" stroke="rgba(255,255,255,0.08)" />
        <path className="pf-circuit-trace is-blue" d="M104 60 H160 V96 H216" />
        <path className="pf-circuit-trace is-orange" d="M248 136 V180 H156 V220" />
        <path className="pf-circuit-trace is-blue" d="M72 80 V160 H118" />
        <path className="pf-circuit-trace is-orange" d="M40 60 H24 V260 H118" />

        <rect className="pf-circuit-chip" x="40" y="40" width="64" height="40" rx="6" fill="rgba(76,141,255,0.12)" stroke="#4c8dff" strokeWidth="1.2" />
        <text x="72" y="64" textAnchor="middle" fill="#cfe0ff" fontSize="11" fontFamily="ui-monospace, monospace">MCU</text>

        <rect className="pf-circuit-chip is-delay-1" x="216" y="96" width="64" height="40" rx="6" fill="rgba(255,122,41,0.12)" stroke="#ff7a29" strokeWidth="1.2" />
        <text x="248" y="120" textAnchor="middle" fill="#ffd9bd" fontSize="11" fontFamily="ui-monospace, monospace">CAN</text>

        <rect className="pf-circuit-chip is-delay-2" x="118" y="220" width="76" height="44" rx="6" fill="rgba(76,141,255,0.1)" stroke="#4c8dff" strokeWidth="1.2" />
        <text x="156" y="246" textAnchor="middle" fill="#cfe0ff" fontSize="11" fontFamily="ui-monospace, monospace">BMS</text>

        <circle className="pf-circuit-node" cx="160" cy="96" r="3.5" fill="#4c8dff" />
        <circle className="pf-circuit-node" cx="118" cy="160" r="3.5" fill="#ff7a29" style={{ animationDelay: "0.4s" }} />
        <circle className="pf-circuit-node" cx="24" cy="260" r="3.5" fill="#4c8dff" style={{ animationDelay: "0.8s" }} />
        <circle className="pf-circuit-node" cx="248" cy="180" r="3.5" fill="#ff7a29" style={{ animationDelay: "1.2s" }} />
      </svg>
    </div>
  );
}

function CityGateway() {
  const { ref, isIn } = useReveal<HTMLElement>();
  return (
    <section {...revealClass("pf-section", isIn)} ref={ref} id="city">
      <div className="pf-city-card">
        <div>
          <h3>🏙️ Explore the interactive 3D office</h3>
          <p>
            This portfolio is also a playable world: walk through an embedded engineering office,
            talk to the team, sit at my workstation, and run a simulated firmware build/flash that
            blinks a real virtual GPIO LED.
          </p>
        </div>
        <Link href="/city" className="pf-btn pf-btn-primary">
          Launch →
        </Link>
      </div>
    </section>
  );
}

function About() {
  const { ref, isIn } = useReveal<HTMLElement>();
  return (
    <section {...revealClass("pf-section", isIn)} ref={ref} id="about">
      <span className="pf-section-kicker">01 / About</span>
      <h2 className="pf-section-title">About</h2>
      <p style={{ maxWidth: 640, color: "var(--pf-muted)" }}>{siteConfig.about}</p>
    </section>
  );
}

const TECH_CATEGORIES: Array<{ id: PortfolioCategory; label: string }> = [
  { id: "embedded", label: "Embedded Development" },
  { id: "communication", label: "Communication Protocols" },
  { id: "energy-systems", label: "Energy Systems" },
  { id: "linux-tooling", label: "Linux & Tooling" },
];

function TechStack() {
  const { ref, isIn } = useReveal<HTMLElement>();
  return (
    <section {...revealClass("pf-section", isIn)} ref={ref} id="tech">
      <span className="pf-section-kicker">02 / Tech Stack</span>
      <h2 className="pf-section-title">Tech Stack</h2>
      <p className="pf-section-sub">Technologies I work with, by domain.</p>
      {TECH_CATEGORIES.map((category) => (
        <div className="pf-tech-category" key={category.id}>
          <h4>{category.label}</h4>
          <div className="pf-tech-grid">
            {getTechStackByCategory(category.id).map((item) => (
              <span className="pf-chip" key={item.id}>
                {item.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

const CATEGORY_GLYPH: Record<PortfolioCategory, string> = {
  embedded: "EM",
  communication: "CM",
  "energy-systems": "EN",
  "linux-tooling": "LX",
};

function SkillCard({ skill, index }: { skill: (typeof SKILLS)[number]; index: number }) {
  const { ref, isIn } = useReveal<HTMLDivElement>();
  return (
    <div {...revealClass("pf-skill-card", isIn, index * 0.06)} ref={ref}>
      <span className="pf-skill-glyph" aria-hidden="true">
        {CATEGORY_GLYPH[skill.category]}
      </span>
      <span className="pf-skill-name">{skill.name}</span>
      {!isPlaceholder(skill.description) && <span className="pf-skill-desc">{skill.description}</span>}
    </div>
  );
}

function Skills() {
  const { ref, isIn } = useReveal<HTMLElement>();
  return (
    <section {...revealClass("pf-section", isIn)} ref={ref} id="skills">
      <span className="pf-section-kicker">03 / Skills</span>
      <h2 className="pf-section-title">Skills</h2>
      <p className="pf-section-sub">Core areas of hands-on work.</p>
      <div className="pf-skills-grid">
        {SKILLS.map((skill, i) => (
          <SkillCard skill={skill} index={i} key={skill.id} />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project, index }: { project: (typeof PROJECTS)[number]; index: number }) {
  const { ref, isIn } = useReveal<HTMLDivElement>();
  return (
    <div
      {...revealClass("pf-card", isIn, index * 0.08)}
      ref={ref}
      onMouseMove={handleCardMove}
      onMouseLeave={handleCardLeave}
    >
      <span className="pf-badge pf-badge-accent">{project.status}</span>
      <h3>{project.title}</h3>
      <p>{project.summary}</p>
      <div className="pf-tech-grid">
        {project.technologies.map((tech) => (
          <span className="pf-chip" key={tech}>
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}

function Projects() {
  const { ref, isIn } = useReveal<HTMLElement>();
  const realProjects = PROJECTS.filter((p) => !isPlaceholder(p.title));
  return (
    <section {...revealClass("pf-section", isIn)} ref={ref} id="projects">
      <span className="pf-section-kicker">04 / Projects</span>
      <h2 className="pf-section-title">Projects</h2>
      <p className="pf-section-sub">Selected engineering work.</p>
      {realProjects.length === 0 ? (
        <p className="pf-muted-note">
          Project write-ups are being prepared — meanwhile, try the interactive firmware demo in
          the <Link href="/city">3D city</Link>.
        </p>
      ) : (
        <div className="pf-card-grid">
          {realProjects.map((project, i) => (
            <ProjectCard project={project} index={i} key={project.id} />
          ))}
        </div>
      )}
    </section>
  );
}

function TimelineItem({ entry, index }: { entry: (typeof EXPERIENCE)[number]; index: number }) {
  const { ref, isIn } = useReveal<HTMLLIElement>();
  return (
    <li {...revealClass("pf-timeline-item", isIn, index * 0.1)} ref={ref}>
      <span className="pf-timeline-marker" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3>
        {entry.title} · {entry.organization}
      </h3>
      <p className="pf-timeline-meta">
        {entry.startDate} — {entry.endDate}
      </p>
      <p style={{ margin: 0, color: "var(--pf-muted)", fontSize: 13.5 }}>{entry.summary}</p>
    </li>
  );
}

function Experience() {
  const { ref, isIn } = useReveal<HTMLElement>();
  const realExperience = EXPERIENCE.filter((e) => !isPlaceholder(e.organization));
  return (
    <section {...revealClass("pf-section", isIn)} ref={ref} id="experience">
      <span className="pf-section-kicker">05 / Experience</span>
      <h2 className="pf-section-title">Experience</h2>
      <p className="pf-section-sub">Career timeline.</p>
      {realExperience.length === 0 ? (
        <p className="pf-muted-note">Career timeline coming soon.</p>
      ) : (
        <ul className="pf-timeline" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {realExperience.map((entry, i) => (
            <TimelineItem entry={entry} index={i} key={entry.id} />
          ))}
        </ul>
      )}
    </section>
  );
}

function Certifications() {
  const { ref, isIn } = useReveal<HTMLElement>();
  return (
    <section {...revealClass("pf-section", isIn)} ref={ref} id="certifications">
      <span className="pf-section-kicker">06 / Certifications</span>
      <h2 className="pf-section-title">Certifications</h2>
      {CERTIFICATIONS.length === 0 ? (
        <p className="pf-muted-note">No certifications listed yet.</p>
      ) : (
        <div className="pf-card-grid">
          {CERTIFICATIONS.map((cert) => (
            <div className="pf-card" key={cert.id} onMouseMove={handleCardMove} onMouseLeave={handleCardLeave}>
              <h3>{cert.name}</h3>
              <p>
                {cert.issuer} · {cert.issuedDate}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Contact() {
  const { ref, isIn } = useReveal<HTMLElement>();
  return (
    <section {...revealClass("pf-section", isIn)} ref={ref} id="contact">
      <span className="pf-section-kicker">07 / Contact</span>
      <h2 className="pf-section-title">Contact</h2>
      <p className="pf-section-sub">Open to conversations about embedded systems and energy storage.</p>
      <div className="pf-contact-panel">
        <div className="pf-contact-actions">
          <a href={`mailto:${siteConfig.email}`} className="pf-btn pf-btn-primary">
            {siteConfig.email}
          </a>
          <a href={siteConfig.githubUrl} target="_blank" rel="noopener noreferrer" className="pf-btn">
            GitHub Profile
          </a>
        </div>
      </div>
    </section>
  );
}
