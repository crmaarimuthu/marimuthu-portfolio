import Link from "next/link";
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
 * "Attribution" — pattern only, no copied code/content). Every string
 * comes from config/content data files; placeholder (TODO_USER_INPUT)
 * entries render as honest "coming soon" notes, never as fabricated
 * detail.
 */
export function PortfolioPage() {
  return (
    <div className="pf-root">
      <Navbar />
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

function Navbar() {
  return (
    <nav className="pf-nav">
      <div className="pf-nav-inner">
        <span className="pf-nav-name">{profileConfig.name}</span>
        <div className="pf-nav-links">
          <a href="#about">About</a>
          <a href="#tech">Tech Stack</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#experience">Experience</a>
          <a href="#contact">Contact</a>
          <Link href="/city">3D City</Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header className="pf-hero">
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
    </header>
  );
}

function CityGateway() {
  return (
    <section className="pf-section" id="city">
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
  return (
    <section className="pf-section" id="about">
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
  return (
    <section className="pf-section" id="tech">
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

function Skills() {
  return (
    <section className="pf-section" id="skills">
      <h2 className="pf-section-title">Skills</h2>
      <p className="pf-section-sub">Core areas of hands-on work.</p>
      <div>
        {SKILLS.map((skill) => (
          <div className="pf-skill-row" key={skill.id}>
            <span className="pf-skill-name">{skill.name}</span>
            {!isPlaceholder(skill.description) && (
              <span className="pf-skill-desc">{skill.description}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function Projects() {
  const realProjects = PROJECTS.filter((p) => !isPlaceholder(p.title));
  return (
    <section className="pf-section" id="projects">
      <h2 className="pf-section-title">Projects</h2>
      <p className="pf-section-sub">Selected engineering work.</p>
      {realProjects.length === 0 ? (
        <p className="pf-muted-note">
          Project write-ups are being prepared — meanwhile, try the interactive firmware demo in
          the <Link href="/city">3D city</Link>.
        </p>
      ) : (
        <div className="pf-card-grid">
          {realProjects.map((project) => (
            <div className="pf-card" key={project.id}>
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
          ))}
        </div>
      )}
    </section>
  );
}

function Experience() {
  const realExperience = EXPERIENCE.filter((e) => !isPlaceholder(e.organization));
  return (
    <section className="pf-section" id="experience">
      <h2 className="pf-section-title">Experience</h2>
      <p className="pf-section-sub">Career timeline.</p>
      {realExperience.length === 0 ? (
        <p className="pf-muted-note">Career timeline coming soon.</p>
      ) : (
        <div className="pf-timeline">
          {realExperience.map((entry) => (
            <div className="pf-timeline-item" key={entry.id}>
              <h3>
                {entry.title} · {entry.organization}
              </h3>
              <p className="pf-timeline-meta">
                {entry.startDate} — {entry.endDate}
              </p>
              <p style={{ margin: 0, color: "var(--pf-muted)", fontSize: 13.5 }}>{entry.summary}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Certifications() {
  return (
    <section className="pf-section" id="certifications">
      <h2 className="pf-section-title">Certifications</h2>
      {CERTIFICATIONS.length === 0 ? (
        <p className="pf-muted-note">No certifications listed yet.</p>
      ) : (
        <div className="pf-card-grid">
          {CERTIFICATIONS.map((cert) => (
            <div className="pf-card" key={cert.id}>
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
  return (
    <section className="pf-section" id="contact">
      <h2 className="pf-section-title">Contact</h2>
      <p className="pf-section-sub">Open to conversations about embedded systems and energy storage.</p>
      <div className="pf-contact-actions">
        <a href={`mailto:${siteConfig.email}`} className="pf-btn pf-btn-primary">
          {siteConfig.email}
        </a>
        <a href={siteConfig.githubUrl} target="_blank" rel="noopener noreferrer" className="pf-btn">
          GitHub Profile
        </a>
      </div>
    </section>
  );
}
