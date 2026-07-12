export function LoadingScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        background: "#0b0d10",
        color: "#e7ebef",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "3px solid #2b3138",
          borderTopColor: "#7fb0ff",
          animation: "spin 0.9s linear infinite",
        }}
      />
      <p style={{ fontSize: 14, letterSpacing: 0.4, opacity: 0.8 }}>
        Loading world&hellip;
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
