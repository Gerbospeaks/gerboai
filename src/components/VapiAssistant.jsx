import { useVapi } from "@vapi-ai/web";
import { useEffect } from "react";

function VapiAssistant() {
  const { start, stop, isSessionActive } = useVapi();

  const startCall = () => {
    start({
      apiKey: "YOUR_PUBLIC_KEY_HERE",
      assistant: "YOUR_ASSISTANT_ID_HERE",
    });
  };

  return (
    <button
      onClick={isSessionActive ? stop : startCall}
      style={{
        position: "fixed",
        bottom: "30px",
        right: "30px",
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        backgroundColor: "#4F46E5",
        border: "none",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        color: "white",
        fontSize: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.2s ease",
      }}
      onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
      onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
    >
      {isSessionActive ? "✕" : "🎤"}
    </button>
  );
}

export default VapiAssistant;