import { Request, Response } from "express";
import {
  Visitor,
  errorHandler,
  getCredentials,
  getDroppedAsset,
} from "../utils/index.js";
import { CheckInRecord, IDroppedAsset } from "../types/DroppedAssetInterface.js";
import { getDefaultSettings } from "../utils/droppedAssets/initializeDroppedAssetDataObject.js";

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const canCheckIn = (
  existingCheckIn: CheckInRecord | undefined,
  checkInDaily: boolean,
  now: Date
): boolean => {
  if (!existingCheckIn) return true;
  if (!checkInDaily) return false;
  return !isSameDay(new Date(existingCheckIn.date), now);
};

const getUpdatedCheckedInUsers = (
  checkedInUsers: CheckInRecord[],
  existingCheckIn: CheckInRecord | undefined,
  newRecord: CheckInRecord
): CheckInRecord[] => {
  if (!existingCheckIn) {
    return [...checkedInUsers, newRecord];
  }
  return checkedInUsers.map((record) =>
    record.profileId === newRecord.profileId ? newRecord : record
  );
};

const fireToast = (
  visitor: ReturnType<typeof Visitor.create>,
  title: string,
  text: string
) => {
  visitor.fireToast({ title, text }).catch((error) =>
    errorHandler({
      error,
      functionName: "handleCheckIn",
      message: "Error firing toast",
    })
  );
};

export const handleCheckIn = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { profileId, urlSlug, visitorId } = credentials;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: "Profile ID is required to check in",
      });
    }

    const schoolIds = req.query.schoolIds
      ? String(req.query.schoolIds).split(",")
      : [];
    const schoolNames = req.query.schoolNames
      ? String(req.query.schoolNames).split(",")
      : [];

    const visitor = Visitor.create(visitorId, urlSlug, { credentials });
    const droppedAsset: IDroppedAsset = await getDroppedAsset(credentials);

    const { checkedInUsers = [], totalCheckIns = 0, settings } = droppedAsset.dataObject;
    const appSettings = settings || getDefaultSettings();
    const checkInDaily = appSettings.checkInDaily;

    const existingCheckIn = checkedInUsers.find(
      (record: CheckInRecord) => record.profileId === profileId
    );

    const now = new Date();

    // Check if user can check in
    if (!canCheckIn(existingCheckIn, checkInDaily, now)) {
      const message = checkInDaily
        ? "You have already checked in today!"
        : "You have already checked in!";
      fireToast(visitor, "Already Checked In", message);
    } else {
      // Build the check-in record
      const newRecord: CheckInRecord = {
        profileId,
        date: now.toISOString(),
        schoolIds,
        schoolNames,
      };

      const updatedCheckedInUsers = getUpdatedCheckedInUsers(
        checkedInUsers,
        existingCheckIn,
        newRecord
      );

      await droppedAsset.updateDataObject(
        {
          checkedInUsers: updatedCheckedInUsers,
          totalCheckIns: totalCheckIns + 1,
        },
        {
          analytics: [
            {
              analyticName: "checkIn",
              // @ts-ignore - analytics accepts custom properties
              visitorId,
              profileId,
              schoolIds,
              schoolNames,
            },
          ],
        }
      );

      fireToast(visitor, "Successfully Checked In", "You have successfully checked in!");
    }

    await droppedAsset.fetchDataObject();

    return res.json({
      success: true,
      gameState: droppedAsset.dataObject,
    });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleCheckIn",
      message: "Error recording check-in",
      req,
      res,
    });
  }
};