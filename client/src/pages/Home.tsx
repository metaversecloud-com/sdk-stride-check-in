import { useContext, useEffect, useState } from "react";

// components
import {
  AdminFloatingButton,
  CheckInButton,
  LeaderboardSection,
  PageContainer,
} from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";

// utils
import { backendAPI, setErrorMessage } from "@/utils";

interface PublicSettings {
  title?: string;
  description?: string;
  showSchoolRankings?: boolean;
}

const Home = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { hasInteractiveParams, hasSetupBackend } = useContext(GlobalStateContext);

  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [settings, setSettings] = useState<PublicSettings>({});

  useEffect(() => {
    if (hasInteractiveParams) {
      Promise.all([
        backendAPI.get("/has-checked-in"),
        backendAPI.get("/game-state"),
        backendAPI.get("/settings"),
      ])
        .then(([checkInResponse, gameStateResponse, settingsResponse]) => {
          setHasCheckedIn(checkInResponse.data.hasCheckedIn);
          setIsAdmin(gameStateResponse.data.visitor?.isAdmin || false);
          setSettings(settingsResponse.data.settings || {});
        })
        .catch((error) => {
          console.error("Error checking status", error);
          setErrorMessage(dispatch, error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [hasInteractiveParams]);

  if (!hasSetupBackend) return <div />;

  const title = settings.title || "Check In";
  const description = settings.description || "Check in now";

  return (
    <PageContainer isLoading={isLoading}>
      <div className="flex flex-col items-center justify-center mt-8">
        <h1 style={{ marginBottom: "12px" }}>{title}</h1>
        <p style={{ marginBottom: "20px" }}>{description}</p>

        <CheckInButton initialHasCheckedIn={hasCheckedIn} />

        {settings.showSchoolRankings && <LeaderboardSection />}
      </div>

      {isAdmin && <AdminFloatingButton />}
    </PageContainer>
  );
};

export default Home;