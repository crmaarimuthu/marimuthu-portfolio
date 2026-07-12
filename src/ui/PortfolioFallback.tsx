import { profileConfig } from "@/config/profile";

/**
 * Lightweight, fully responsive 2D fallback shown when WebGL2 is
 * unavailable (see engine/core/capability.ts). Milestone 1 keeps this
 * minimal; Milestone 6/10 expand it with real portfolio content.
 */
export function PortfolioFallback({ reason }: { reason: string | null }) {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "1.5rem",
        textAlign: "center",
        fontFamily: "system-ui, sans-serif",
        background: "#0b0d10",
        color: "#e7ebef",
      }}
    >
      <h1 style={{ fontSize: "clamp(1.5rem, 5vw, 2.25rem)", margin: 0 }}>
        {profileConfig.name}
      </h1>
      <p style={{ fontSize: "clamp(1rem, 3vw, 1.25rem)", opacity: 0.85, margin: 0 }}>
        {profileConfig.professionalTitle}
      </p>
      <p style={{ maxWidth: 480, opacity: 0.7, fontSize: 14 }}>
        This browser doesn&apos;t support the interactive 3D experience
        {reason ? ` (${reason})` : ""}. A full portfolio fallback with
        projects and skills is planned for a later milestone.
      </p>
    </main>
  );
}
