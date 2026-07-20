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
        background:
          "radial-gradient(60rem 40rem at 15% -10%, rgba(76,141,255,0.16), transparent 60%)," +
          "radial-gradient(50rem 36rem at 100% 20%, rgba(255,122,41,0.14), transparent 62%), #05070a",
        color: "#edf1f6",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(1.5rem, 5vw, 2.25rem)",
          margin: 0,
          fontWeight: 800,
          background: "linear-gradient(100deg, #ffffff 20%, #4c8dff 65%, #ff7a29 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {profileConfig.name}
      </h1>
      <p style={{ fontSize: "clamp(1rem, 3vw, 1.25rem)", color: "#ff7a29", fontWeight: 600, margin: 0 }}>
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
