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
        gap: "1rem",
        background:
          "radial-gradient(60rem 40rem at 15% -10%, rgba(76,141,255,0.16), transparent 60%)," +
          "radial-gradient(50rem 36rem at 100% 20%, rgba(255,122,41,0.14), transparent 62%), #05070a",
        color: "#edf1f6",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.1)",
          borderTopColor: "#4c8dff",
          borderRightColor: "#ff7a29",
          animation: "pf-loading-spin 0.9s linear infinite",
        }}
      />
      <p style={{ fontSize: 13, letterSpacing: 2, textTransform: "uppercase", opacity: 0.7, fontFamily: "ui-monospace, monospace" }}>
        Loading world&hellip;
      </p>
      <style>{`@keyframes pf-loading-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
