"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./portfolio.css";
import { profileConfig } from "@/config/profile";
import { siteConfig } from "@/config/site";
import { detectCapability, type CapabilityResult } from "@/engine/core/capability";
import { useLenis } from "./useLenis";
import {
  CERTIFICATIONS,
  EXPERIENCE,
  PROJECTS,
  TECH_STACK,
} from "@/portfolio/portfolioContent";
import { isPlaceholder, type PortfolioCategory, type ProjectEntry, type TechStackItem } from "@/portfolio/portfolioTypes";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const HeroCanvas = dynamic(() => import("./hero3d/HeroCanvas").then((m) => m.HeroCanvas), {
  ssr: false,
  // Keep the SVG circuit visible while the R3F/three.js chunk is still
  // downloading, so swapping showCanvas → true never produces a blank gap.
  loading: () => <HeroCircuitSvg />,
});

/**
 * The 2D portfolio landing page. Section order (hero → about → 3D city
 * gateway → tech stack → skills → projects → experience →
 * certifications → contact) mirrors the structure of the reference
 * portfolio the user asked to follow (see docs/PORTFOLIO_CONTENT.md
 * "Attribution") — pattern only, no copied code/content. Every string
 * comes from config/content data files; `TODO_USER_INPUT`/"pending"
 * entries render as honest "coming soon" states, never fabricated
 * detail (see docs/PRIVACY_REVIEW.md).
 *
 * Motion stack: Lenis (smooth scroll) + Framer Motion (section/card
 * reveals, micro-interactions) + GSAP/ScrollTrigger (stat count-ups,
 * timeline scroll-scrub) + React Three Fiber (hero PCB scene, bloom via
 * @react-three/postprocessing). The WebGL hero is client-only-mounted
 * post-hydration behind a `detectCapability()` check (same probe /city
 * uses) so unsupported/low-end/reduced-motion visitors transparently
 * get the CSS/SVG circuit fallback instead — see `Hero3D` below.
 */
export function PortfolioPage() {
  const navRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useLenis();

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

/** Shared Framer Motion fade-up-on-scroll variants; distances/durations collapse to ~0 under reduced motion. */
function useFadeUp(): Variants {
  const reduce = useReducedMotion();
  return {
    hidden: { opacity: 0, y: reduce ? 0 : 26 },
    show: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0.01 : 0.65, delay: reduce ? 0 : delay, ease: [0.16, 0.84, 0.44, 1] },
    }),
  };
}

const VIEWPORT = { once: true, amount: 0.15, margin: "0px 0px -60px 0px" } as const;

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

/**
 * Lightweight DOM particle burst (no particle library) for hex-card
 * hover. Particles are appended to `document.body` with viewport-fixed
 * coordinates rather than as children of the hex card, because the
 * card's clip-path hexagon would otherwise clip the burst at its edges.
 */
function spawnParticles(sourceEl: HTMLElement, color: string) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const rect = sourceEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < 10; i++) {
    const particle = document.createElement("span");
    particle.className = "pf-particle";
    const angle = Math.random() * Math.PI * 2;
    const dist = 26 + Math.random() * 34;
    particle.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    particle.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
    particle.style.background = color;
    particle.style.left = `${cx}px`;
    particle.style.top = `${cy}px`;
    document.body.appendChild(particle);
    particle.addEventListener("animationend", () => particle.remove());
  }
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

const TYPED_ROLES = [
  "Embedded Firmware Engineer",
  "BMS Developer",
  "EMS & SCADA Developer",
  "Industrial Automation Engineer",
];

/** Cycles through TYPED_ROLES with a type/pause/delete rhythm; renders the full phrase statically under reduced motion. */
function useTypewriter(phrases: string[]) {
  const reduce = useReducedMotion();
  const [text, setText] = useState("");

  useEffect(() => {
    // Reduced-motion text is derived directly in the return statement below
    // (no setState needed for that path) — this effect only drives the
    // type/delete timer loop, and every setText call inside it happens
    // from the async `tick` timeout callback, not synchronously in the
    // effect body.
    if (reduce) return;
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    function tick() {
      const phrase = phrases[phraseIndex] ?? "";
      if (!deleting) {
        charIndex++;
        setText(phrase.slice(0, charIndex));
        if (charIndex === phrase.length) {
          deleting = true;
          timeout = setTimeout(tick, 1500);
          return;
        }
        timeout = setTimeout(tick, 55);
      } else {
        charIndex--;
        setText(phrase.slice(0, charIndex));
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          timeout = setTimeout(tick, 300);
          return;
        }
        timeout = setTimeout(tick, 28);
      }
    }
    timeout = setTimeout(tick, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- phrases is a module-level constant array
  }, [reduce]);

  return reduce ? (phrases[0] ?? "") : text;
}

function Hero() {
  const fadeUp = useFadeUp();
  const typed = useTypewriter(TYPED_ROLES);
  return (
    <header className="pf-hero">
      <motion.div className="pf-hero-content" initial="hidden" animate="show" custom={0} variants={fadeUp}>
        <span className="pf-hero-eyebrow">Firmware · BMS · BESS · EMS · SCADA</span>
        <h1 className="pf-hero-title">{profileConfig.name}</h1>
        <p className="pf-hero-role">{profileConfig.professionalTitle}</p>
        <p className="pf-hero-typed" aria-live="polite">
          <span className="pf-hero-typed-text">{typed}</span>
          <span className="pf-hero-caret" aria-hidden="true" />
        </p>
        <p className="pf-hero-tagline">{siteConfig.tagline}</p>
        <p className="pf-hero-location">📍 {profileConfig.publicLocationLabel}</p>
        <div className="pf-hero-actions">
          <a href="#projects" className="pf-btn pf-btn-primary">
            View Projects
          </a>
          {siteConfig.resumeUrl && (
            <a href={siteConfig.resumeUrl} className="pf-btn" download>
              Download Resume
            </a>
          )}
          <a href="#contact" className="pf-btn">
            Contact Me
          </a>
        </div>
      </motion.div>
      <Hero3D />
      <a href="#about" className="pf-scroll-cue" aria-label="Scroll to About section">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </header>
  );
}

/**
 * Client-only-enhanced hero visual: renders the static SVG circuit on
 * both the server render AND the first client render (so hydration
 * never mismatches), then swaps to the full R3F/bloom canvas in a
 * post-mount effect once `detectCapability()` confirms WebGL2 and the
 * visitor hasn't asked for reduced motion.
 */
function Hero3D() {
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => {
    // Mirrors the check()/subscribe pattern in engine/core/useDeviceClass.ts:
    // the capability probe only runs client-side (post-hydration), so the
    // first client render still matches the server's SVG-fallback markup.
    function check() {
      const capability: CapabilityResult = detectCapability();
      if (capability.supported && !capability.prefersReducedMotion) {
        setShowCanvas(true);
      }
    }
    check();
  }, []);

  return (
    <div className="pf-hero-visual" aria-hidden="true">
      {showCanvas ? <HeroCanvas /> : <HeroCircuitSvg />}
    </div>
  );
}

/** Decorative PCB motif standing in as the hero visual until/unless the WebGL canvas takes over. */
function HeroCircuitSvg() {
  return (
    <svg viewBox="0 0 320 320" style={{ width: "100%", height: "100%" }}>
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
  );
}

function CityGateway() {
  const fadeUp = useFadeUp();
  return (
    <motion.section
      className="pf-section"
      id="city"
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      custom={0}
      variants={fadeUp}
    >
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
    </motion.section>
  );
}

const STATS = [
  { label: "Technologies", value: TECH_STACK.length },
  { label: "Protocols", value: TECH_STACK.filter((t) => t.category === "communication").length },
  { label: "Project Domains", value: PROJECTS.length },
  { label: "Skill Categories", value: new Set(TECH_STACK.map((t) => t.category)).size },
];

function StatCounter({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce || typeof ScrollTrigger === "undefined") {
      el.textContent = String(value);
      return;
    }
    const counter = { val: 0 };
    const tween = gsap.to(counter, {
      val: value,
      duration: 1.4,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = String(Math.round(counter.val));
      },
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [value, reduce]);

  return (
    <div className="pf-stat">
      <span className="pf-stat-value" ref={ref}>
        0
      </span>
      <span className="pf-stat-label">{label}</span>
    </div>
  );
}

function About() {
  const fadeUp = useFadeUp();
  return (
    <motion.section
      className="pf-section"
      id="about"
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      custom={0}
      variants={fadeUp}
    >
      <span className="pf-section-kicker">01 / About</span>
      <h2 className="pf-section-title">About</h2>
      <p style={{ maxWidth: 640, color: "var(--pf-muted)" }}>{siteConfig.about}</p>
      <div className="pf-stats-grid">
        {STATS.map((stat) => (
          <StatCounter key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </div>
    </motion.section>
  );
}

const TECH_CATEGORIES: Array<{ id: PortfolioCategory; label: string }> = [
  { id: "embedded", label: "Firmware & Platforms" },
  { id: "programming", label: "Programming" },
  { id: "communication", label: "Communication Protocols" },
  { id: "energy-systems", label: "Energy Systems" },
  { id: "scada", label: "SCADA & Industrial Standards" },
  { id: "linux-tooling", label: "Linux" },
  { id: "tools", label: "Tools" },
  { id: "cloud", label: "Cloud" },
];

function getTechStackByCategory(category: PortfolioCategory): TechStackItem[] {
  return TECH_STACK.filter((item) => item.category === category);
}

function TechStack() {
  const fadeUp = useFadeUp();
  return (
    <motion.section
      className="pf-section"
      id="tech"
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      custom={0}
      variants={fadeUp}
    >
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
    </motion.section>
  );
}

const CATEGORY_META: Record<PortfolioCategory, { label: string; glyph: string; color: string }> = {
  embedded: { label: "Firmware", glyph: "FW", color: "#4c8dff" },
  communication: { label: "Communication", glyph: "CM", color: "#ff7a29" },
  "energy-systems": { label: "Energy Systems", glyph: "EN", color: "#34d399" },
  programming: { label: "Programming", glyph: "PG", color: "#4c8dff" },
  tools: { label: "Tools", glyph: "TL", color: "#a78bfa" },
  "linux-tooling": { label: "Linux", glyph: "LX", color: "#ff7a29" },
  cloud: { label: "Cloud", glyph: "CL", color: "#38bdf8" },
  scada: { label: "SCADA", glyph: "SC", color: "#f472b6" },
};

function HexCard({ category, items, index }: { category: PortfolioCategory; items: TechStackItem[]; index: number }) {
  const meta = CATEGORY_META[category];
  const fadeUp = useFadeUp();
  return (
    <motion.div
      className="pf-hex-card"
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      custom={index * 0.06}
      variants={fadeUp}
      style={{ "--hex-color": meta.color } as CSSProperties}
      onMouseEnter={(e) => spawnParticles(e.currentTarget, meta.color)}
    >
      <span className="pf-hex-glyph">{meta.glyph}</span>
      <span className="pf-hex-label">{meta.label}</span>
      <span className="pf-hex-count">{items.length} technologies</span>
      <span className="pf-hex-items">{items.map((i) => i.name).join(" · ")}</span>
    </motion.div>
  );
}

const CATEGORY_ORDER: PortfolioCategory[] = [
  "embedded",
  "communication",
  "energy-systems",
  "programming",
  "tools",
  "linux-tooling",
  "cloud",
  "scada",
];

function Skills() {
  const fadeUp = useFadeUp();
  return (
    <motion.section
      className="pf-section"
      id="skills"
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      custom={0}
      variants={fadeUp}
    >
      <span className="pf-section-kicker">03 / Skills</span>
      <h2 className="pf-section-title">Skills</h2>
      <p className="pf-section-sub">Core domains of hands-on work — hover a card.</p>
      <div className="pf-hex-grid">
        {CATEGORY_ORDER.map((cat, i) => (
          <HexCard category={cat} items={getTechStackByCategory(cat)} index={i} key={cat} />
        ))}
      </div>
    </motion.section>
  );
}

const PROJECT_STATUS_LABEL: Record<ProjectEntry["status"], string> = {
  TODO_USER_INPUT: "Pending",
  "details-pending": "Write-up Pending",
  completed: "Completed",
  "in-progress": "In Progress",
  archived: "Archived",
};

function ProjectCard({ project, index }: { project: ProjectEntry; index: number }) {
  const fadeUp = useFadeUp();
  const meta = project.category !== "generic" ? CATEGORY_META[project.category] : undefined;
  const pending = isPlaceholder(project.summary);
  return (
    <motion.div
      className="pf-card"
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      custom={index * 0.08}
      variants={fadeUp}
      onMouseMove={handleCardMove}
      onMouseLeave={handleCardLeave}
      style={meta ? ({ "--pf-card-accent": meta.color } as CSSProperties) : undefined}
    >
      <div className="pf-card-band" style={meta ? { background: `linear-gradient(120deg, ${meta.color}33, transparent)` } : undefined} />
      <span className="pf-badge pf-badge-accent">{PROJECT_STATUS_LABEL[project.status]}</span>
      <h3>{project.title}</h3>
      <p>{pending ? "Full write-up, architecture and metrics coming soon." : project.summary}</p>
      {project.technologies.length > 0 && (
        <div className="pf-tech-grid">
          {project.technologies.map((tech) => (
            <span className="pf-chip" key={tech}>
              {tech}
            </span>
          ))}
        </div>
      )}
      {(project.githubUrl || project.liveUrl || project.architectureUrl || project.docsUrl) && (
        <div className="pf-card-links">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              Live Demo
            </a>
          )}
          {project.architectureUrl && (
            <a href={project.architectureUrl} target="_blank" rel="noopener noreferrer">
              Architecture
            </a>
          )}
          {project.docsUrl && (
            <a href={project.docsUrl} target="_blank" rel="noopener noreferrer">
              Docs
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}

function Projects() {
  const fadeUp = useFadeUp();
  const realProjects = PROJECTS.filter((p) => !isPlaceholder(p.title));
  return (
    <motion.section
      className="pf-section"
      id="projects"
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      custom={0}
      variants={fadeUp}
    >
      <span className="pf-section-kicker">04 / Projects</span>
      <h2 className="pf-section-title">Projects</h2>
      <p className="pf-section-sub">Selected engineering work — full write-ups in progress.</p>
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
    </motion.section>
  );
}

function TimelineItem({ entry, index }: { entry: (typeof EXPERIENCE)[number]; index: number }) {
  const fadeUp = useFadeUp();
  return (
    <motion.li
      className="pf-timeline-item"
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      custom={index * 0.1}
      variants={fadeUp}
    >
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
    </motion.li>
  );
}

/** GSAP ScrollTrigger scrub: the connecting "mission" line fills as you scroll through the timeline. */
function useTimelineScrub(ref: RefObject<HTMLUListElement | null>) {
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || typeof ScrollTrigger === "undefined") return;
    const tween = gsap.fromTo(
      el,
      { "--pf-timeline-fill": "0%" },
      {
        "--pf-timeline-fill": "100%",
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 60%", scrub: 0.6 },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [ref, reduce]);
}

function Experience() {
  const fadeUp = useFadeUp();
  const listRef = useRef<HTMLUListElement | null>(null);
  useTimelineScrub(listRef);
  const realExperience = EXPERIENCE.filter((e) => !isPlaceholder(e.organization));
  return (
    <motion.section
      className="pf-section"
      id="experience"
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      custom={0}
      variants={fadeUp}
    >
      <span className="pf-section-kicker">05 / Experience</span>
      <h2 className="pf-section-title">Experience</h2>
      <p className="pf-section-sub">Career timeline.</p>
      {realExperience.length === 0 ? (
        <p className="pf-muted-note">Career timeline coming soon.</p>
      ) : (
        <ul className="pf-timeline" ref={listRef} style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {realExperience.map((entry, i) => (
            <TimelineItem entry={entry} index={i} key={entry.id} />
          ))}
        </ul>
      )}
    </motion.section>
  );
}

function Certifications() {
  const fadeUp = useFadeUp();
  return (
    <motion.section
      className="pf-section"
      id="certifications"
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      custom={0}
      variants={fadeUp}
    >
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
    </motion.section>
  );
}

function Contact() {
  const fadeUp = useFadeUp();
  return (
    <motion.section
      className="pf-section"
      id="contact"
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      custom={0}
      variants={fadeUp}
    >
      <span className="pf-section-kicker">07 / Contact</span>
      <h2 className="pf-section-title">Contact</h2>
      <p className="pf-section-sub">Open to conversations about embedded systems, BMS/BESS/EMS and SCADA.</p>
      <div className="pf-hologram-panel">
        <div className="pf-hologram-scanline" aria-hidden="true" />
        <div className="pf-contact-actions">
          <a href={`mailto:${siteConfig.email}`} className="pf-btn pf-btn-primary">
            {siteConfig.email}
          </a>
          <a href={siteConfig.linkedinUrl} target="_blank" rel="noopener noreferrer" className="pf-btn">
            LinkedIn
          </a>
          <a href={siteConfig.githubUrl} target="_blank" rel="noopener noreferrer" className="pf-btn">
            GitHub
          </a>
          {siteConfig.instagramUrl && (
            <a href={siteConfig.instagramUrl} target="_blank" rel="noopener noreferrer" className="pf-btn">
              Instagram
            </a>
          )}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${profileConfig.mapLatitude},${profileConfig.mapLongitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="pf-btn"
          >
            📍 {profileConfig.city}, {profileConfig.state}
          </a>
        </div>
      </div>
    </motion.section>
  );
}
