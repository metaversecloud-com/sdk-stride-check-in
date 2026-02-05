import { Request, Response } from "express";
import { errorHandler, getCredentials, getDroppedAsset } from "../utils/index.js";
import { CheckInRecord, IDroppedAsset } from "../types/DroppedAssetInterface.js";
import { getDefaultSettings } from "../utils/droppedAssets/initializeDroppedAssetDataObject.js";

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const handleHasCheckedIn = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { profileId } = credentials;

    const droppedAsset: IDroppedAsset = await getDroppedAsset(credentials);

    const { checkedInUsers = [], settings } = droppedAsset.dataObject;
    const appSettings = settings || getDefaultSettings();
    const checkInDaily = appSettings.checkInDaily;

    const checkInRecord = checkedInUsers.find(
      (record: CheckInRecord) => record.profileId === profileId
    );

    let hasCheckedIn = Boolean(checkInRecord);

    if (checkInDaily && checkInRecord) {
      const lastCheckInDate = new Date(checkInRecord.date);
      const now = new Date();
      hasCheckedIn = isSameDay(lastCheckInDate, now);
    }

    return res.json({
      success: true,
      hasCheckedIn,
      checkInRecord: checkInRecord || null,
    });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleHasCheckedIn",
      message: "Error checking user check-in status",
      req,
      res,
    });
  }
};