import { useContext, useEffect, useState } from "react";

// context
import { GlobalDispatchContext } from "@/context/GlobalContext";

// utils
import { backendAPI, setErrorMessage } from "@/utils";

interface SchoolRanking {
  schoolId: string;
  schoolName: string;
  checkInCount: number;
  rank: number;
}

interface RankingsResponse {
  success: boolean;
  rankings: SchoolRanking[];
  enabled: boolean;
}

export const SchoolRankings = () => {
  const dispatch = useContext(GlobalDispatchContext);

  const [rankings, setRankings] = useState<SchoolRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    backendAPI
      .get<RankingsResponse>("/rankings")
      .then((response) => {
        if (response.data.success) {
          setRankings(response.data.rankings);
          setEnabled(response.data.enabled);
        }
      })
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => setIsLoading(false));
  }, []);

  // Don't render if disabled or still loading
  if (isLoading || !enabled) {
    return null;
  }

  // Empty state
  if (rankings.length === 0) {
    return (
      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <h3 style={{ marginBottom: "8px" }}>School Rankings</h3>
        <p style={{ color: "#666" }}>No check-ins yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "24px" }}>
      <h3 style={{ marginBottom: "12px", textAlign: "center" }}>School Rankings</h3>
      <div
        style={{
          maxWidth: "400px",
          margin: "0 auto",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {rankings.map((school, index) => (
          <div
            key={school.schoolId}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              borderBottom: index < rankings.length - 1 ? "1px solid #e0e0e0" : "none",
              backgroundColor: school.rank <= 3 ? "#f8f9fa" : "white",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: school.rank === 1 ? "#ffd700" : school.rank === 2 ? "#c0c0c0" : school.rank === 3 ? "#cd7f32" : "#e0e0e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                marginRight: "12px",
                fontSize: "14px",
              }}
            >
              {school.rank}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "500" }}>{school.schoolName}</div>
            </div>
            <div style={{ fontWeight: "bold", color: "#666" }}>
              {school.checkInCount} {school.checkInCount === 1 ? "check-in" : "check-ins"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchoolRankings;