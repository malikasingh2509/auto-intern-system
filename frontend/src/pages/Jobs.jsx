import JobCard from "../components/JobCard";

function Jobs({ matchedJobs, userId }) {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "60px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "800", color: "#ffffff", marginBottom: "8px" }}>
          Aggregated Job Matches
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "16px" }}>
          AI-filtered opportunities ranked by ATS compatibility score.
        </p>
      </div>

      {matchedJobs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", backgroundColor: "#111827", borderRadius: "16px", border: "1px dashed #334155" }}>
          <p style={{ color: "#94a3b8", fontSize: "16px" }}>No matched jobs found. Please update your profile preferences.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {matchedJobs.map((job, index) => (
            <JobCard key={index} job={job} userId={userId} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Jobs;