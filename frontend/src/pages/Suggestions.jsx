import SuggestionCard from "../components/SuggestionCard";

function Suggestions({ suggestions }) {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
      <h1 style={{ marginBottom: "8px", fontSize: "32px", fontWeight: "800", color: "#ffffff" }}>
        AI Profile Suggestions
      </h1>
      <p style={{ color: "#94a3b8", fontSize: "16px", marginBottom: "32px" }}>
        Dynamic AI recommendations to optimize your ATS resume scoring and expand platform reach.
      </p>

      {suggestions && suggestions.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {suggestions.map((suggestion, index) => (
            <SuggestionCard key={index} suggestion={suggestion} />
          ))}
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#111827",
            border: "2px dashed #1e293b",
            borderRadius: "16px",
            padding: "40px",
            textAlign: "center",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
          <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#ffffff", margin: "0 0 8px 0" }}>
            Profile Fully Optimized!
          </h3>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 auto", maxWidth: "480px" }}>
            Fantastic job! Your profile details are complete, technical keywords are fully optimized, and you have connected all external professional career channels.
          </p>
        </div>
      )}
    </div>
  );
}

export default Suggestions;