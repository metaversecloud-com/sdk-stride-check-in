import { useContext, useState } from "react";

// context
import { GlobalDispatchContext } from "@/context/GlobalContext";

// utils
import { backendAPI, setErrorMessage } from "@/utils";

interface CheckInButtonProps {
  initialHasCheckedIn: boolean;
  onCheckInSuccess?: () => void;
}

export const CheckInButton = ({ initialHasCheckedIn, onCheckInSuccess }: CheckInButtonProps) => {
  const dispatch = useContext(GlobalDispatchContext);

  const [hasCheckedIn, setHasCheckedIn] = useState(initialHasCheckedIn);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const handleCheckIn = () => {
    setIsCheckingIn(true);

    backendAPI
      .get("/check-in")
      .then(() => {
        setHasCheckedIn(true);
        onCheckInSuccess?.();
      })
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => {
        setIsCheckingIn(false);
      });
  };

  if (hasCheckedIn) {
    return <div className="text-2xl font-semibold text-green-600">You have checked in</div>;
  }

  return (
    <button className="btn" disabled={isCheckingIn} onClick={handleCheckIn}>
      {isCheckingIn ? "Checking in..." : "Check In"}
    </button>
  );
};

export default CheckInButton;