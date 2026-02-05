import { useContext, useEffect, useState } from "react";

// components
import { PageFooter, ConfirmationModal } from "@/components";

// context
import { GlobalDispatchContext } from "@/context/GlobalContext";

// utils
import { backendAPI, setErrorMessage } from "@/utils";

interface CheckInRecord {
  profileId: string;
  date: string;
  schoolIds: string[];
  schoolNames: string[];
}

export const CheckInSummary = () => {
  const dispatch = useContext(GlobalDispatchContext);

  const [checkedInUsers, setCheckedInUsers] = useState<CheckInRecord[]>([]);
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  const fetchCheckedInUsers = () => {
    setIsLoading(true);
    backendAPI
      .get("/checked-in-users")
      .then((response) => {
        setCheckedInUsers(response.data.checkedInUsers || []);
        setTotalCheckIns(response.data.totalCheckIns || 0);
      })
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCheckedInUsers();
  }, []);

  const handleToggleShowConfirmationModal = () => {
    setShowConfirmationModal(!showConfirmationModal);
  };

  const handleReset = async () => {
    setAreButtonsDisabled(true);
    backendAPI
      .put("/reset")
      .then(() => {
        fetchCheckedInUsers();
      })
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => setAreButtonsDisabled(false));
  };

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleString();
  };

  return (
    <div>
      <h3 style={{ marginBottom: "8px" }}>Check-In Summary</h3>
      <p>Total Check-Ins: <strong>{totalCheckIns}</strong></p>

      <hr style={{ margin: "16px 0" }} />

      <h4 style={{ marginBottom: "8px" }}>Checked-In Users</h4>

      {isLoading ? (
        <p>Loading...</p>
      ) : checkedInUsers.length === 0 ? (
        <p>No users have checked in yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ccc" }}>
                <th style={{ padding: "8px", textAlign: "left" }}>#</th>
                <th style={{ padding: "8px", textAlign: "left" }}>Profile ID</th>
                <th style={{ padding: "8px", textAlign: "left" }}>Date</th>
                <th style={{ padding: "8px", textAlign: "left" }}>School Name(s)</th>
              </tr>
            </thead>
            <tbody>
              {checkedInUsers.map((record, index) => (
                <tr key={record.profileId} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px" }}>{index + 1}</td>
                  <td style={{ padding: "8px" }}>{record.profileId}</td>
                  <td style={{ padding: "8px" }}>{formatDate(record.date)}</td>
                  <td style={{ padding: "8px" }}>
                    {record.schoolNames?.length > 0 ? record.schoolNames.join(", ") : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PageFooter>
        <button
          className="btn btn-danger"
          disabled={areButtonsDisabled}
          onClick={() => handleToggleShowConfirmationModal()}
        >
          Reset All Data
        </button>
      </PageFooter>

      {showConfirmationModal && (
        <ConfirmationModal
          title="Reset?"
          message="All player data will be erased."
          handleToggleShowConfirmationModal={handleToggleShowConfirmationModal}
          handleConfirm={handleReset}
        />
      )}
    </div>
  );
};

export default CheckInSummary;