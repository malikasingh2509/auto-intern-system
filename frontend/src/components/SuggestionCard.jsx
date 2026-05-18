function SuggestionCard({ suggestion }) {
  return (
    <div
      style={{
        border: "1px solid #1e293b",
        borderLeft: "4px solid #f97316",
        padding: "20px",
        borderRadius: "12px",
        backgroundColor: "#111827",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        transition: "all 0.2s ease"
      }}
    >
      <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "700", color: "#ffffff" }}>
        {suggestion.title}
      </h3>
      <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8", lineHeight: "1.5" }}>
        {suggestion.message}
      </p>
    </div>
  );
}

export default SuggestionCard;