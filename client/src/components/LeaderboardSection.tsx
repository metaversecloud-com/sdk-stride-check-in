import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

// components
import { SchoolRankings } from "./SchoolRankings";

export const LeaderboardSection = () => {
  const [searchParams] = useSearchParams();

  const leaderboardImageUrl = useMemo(() => {
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      params.set(key, value);
    });
    return `/api/leaderboard-image?${params.toString()}`;
  }, [searchParams]);

  return (
    <>
      <img
        src={leaderboardImageUrl}
        alt="School Leaderboard"
        style={{
          marginTop: "24px",
          maxWidth: "100%",
          height: "auto",
        }}
      />
      <SchoolRankings />
    </>
  );
};

export default LeaderboardSection;