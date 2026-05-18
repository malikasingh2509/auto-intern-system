function ProfileCard({ user }) {
  return (
    <div
      style={{
        border: "1px solid gray",
        padding: "15px",
        marginBottom: "15px",
        borderRadius: "10px"
      }}
    >
      <h2>{user.name}</h2>

      <p>Email: {user.email}</p>

      <p>Skills: {user.skills}</p>

      <p>Experience: {user.experience}</p>

      <p>Domain: {user.domain}</p>
    </div>
  );
}

export default ProfileCard;