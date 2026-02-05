import { useContext, useEffect, useState } from "react";

// context
import { GlobalDispatchContext } from "@/context/GlobalContext";

// utils
import { backendAPI, setErrorMessage } from "@/utils";

interface AppSettings {
  title: string;
  description: string;
  checkInDaily: boolean;
  showSchoolRankings: boolean;
}

const defaultSettings: AppSettings = {
  title: "Check In",
  description: "Check in now",
  checkInDaily: false,
  showSchoolRankings: false,
};

export const AdminSettings = () => {
  const dispatch = useContext(GlobalDispatchContext);

  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const fetchSettings = () => {
    backendAPI
      .get("/settings")
      .then((response) => {
        if (response.data.settings) {
          setSettings(response.data.settings);
        }
      })
      .catch((error) => setErrorMessage(dispatch, error));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = () => {
    setIsSavingSettings(true);
    backendAPI
      .put("/settings", { settings })
      .then((response) => {
        if (response.data.settings) {
          setSettings(response.data.settings);
        }
      })
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => setIsSavingSettings(false));
  };

  return (
    <div>
      <h3 style={{ marginBottom: "8px" }}>Settings</h3>
      <div style={{ marginBottom: "16px" }}>
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
            Title
          </label>
          <input
            type="text"
            value={settings.title}
            onChange={(e) => setSettings({ ...settings, title: e.target.value })}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
            Description
          </label>
          <textarea
            value={settings.description}
            onChange={(e) => setSettings({ ...settings, description: e.target.value })}
            rows={3}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
            Check-In Mode
          </label>
          <div style={{ display: "flex", gap: "16px" }}>
            <label style={{ display: "flex", alignItems: "center" }}>
              <input
                type="radio"
                name="checkInDaily"
                checked={!settings.checkInDaily}
                onChange={() => setSettings({ ...settings, checkInDaily: false })}
                style={{ marginRight: "8px" }}
              />
              Once (users can only check in one time)
            </label>
            <label style={{ display: "flex", alignItems: "center" }}>
              <input
                type="radio"
                name="checkInDaily"
                checked={settings.checkInDaily}
                onChange={() => setSettings({ ...settings, checkInDaily: true })}
                style={{ marginRight: "8px" }}
              />
              Daily (users can check in once per day)
            </label>
          </div>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={settings.showSchoolRankings}
              onChange={(e) => setSettings({ ...settings, showSchoolRankings: e.target.checked })}
              style={{ marginRight: "8px" }}
            />
            <span style={{ fontWeight: "bold" }}>Show School Rankings</span>
          </label>
          <p style={{ fontSize: "12px", color: "#666", marginTop: "4px", marginLeft: "24px" }}>
            Display a leaderboard of schools ranked by check-in count on the home page
          </p>
        </div>

        <button
          className="btn"
          onClick={handleSaveSettings}
          disabled={isSavingSettings}
        >
          {isSavingSettings ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;