import { errorHandler } from "../errorHandler.js";
import { AppSettings, IDroppedAsset } from "../../types/DroppedAssetInterface.js";

export const getDefaultSettings = (): AppSettings => ({
  title: "Check In",
  description: "Check in now",
  checkInDaily: false,
  showSchoolRankings: false,
});

export const initializeDroppedAssetDataObject = async (droppedAsset: IDroppedAsset) => {
  try {
    const lockId = `${droppedAsset.id}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
    await droppedAsset.setDataObject(
      {
        lock: { lockId },
        checkedInUsers: [],
        totalCheckIns: 0,
        settings: getDefaultSettings(),
      },
      { lock: { lockId, releaseLock: true } },
    );
    return;
  } catch (error) {
    errorHandler({
      error,
      functionName: "initializeDroppedAssetDataObject",
      message: "Error initializing dropped asset data object",
    });
    return await droppedAsset.fetchDataObject();
  }
};
