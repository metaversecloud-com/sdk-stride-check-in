import { useNavigate } from "react-router-dom";

// components
import { AdminSettings } from "./AdminSettings";
import { CheckInSummary } from "./CheckInSummary";

export const AdminView = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <button
        className="btn"
        onClick={() => navigate("/")}
        style={{ marginBottom: "16px" }}
      >
        ← Back
      </button>

      <AdminSettings />

      <hr style={{ margin: "16px 0" }} />

      <CheckInSummary />
    </div>
  );
};

export default AdminView;