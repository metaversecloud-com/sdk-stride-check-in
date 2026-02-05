import { useNavigate } from "react-router-dom";

export const AdminFloatingButton = () => {
  const navigate = useNavigate();

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px" }}>
      <button className="btn" onClick={() => navigate("/admin")}>
        Admin
      </button>
    </div>
  );
};

export default AdminFloatingButton;