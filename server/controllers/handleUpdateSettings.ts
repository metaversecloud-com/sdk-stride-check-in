import { Request, Response } from "express";
import { errorHandler, getCredentials, getDroppedAsset, Visitor } from "../utils/index.js";
import { AppSettings, IDroppedAsset } from "../types/DroppedAssetInterface.js";
import { getDefaultSettings } from "../utils/droppedAssets/initializeDroppedAssetDataObject.js";
import { VisitorInterface } from "@rtsdk/topia";

export const handleUpdateSettings = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { visitorId, urlSlug } = credentials;

    const visitor: VisitorInterface = await Visitor.get(visitorId, urlSlug, { credentials });

    if (!visitor.isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Forbidden: Admin access required",
      });
    }

    const droppedAsset: IDroppedAsset = await getDroppedAsset(credentials);
    const currentSettings: AppSettings = droppedAsset.dataObject.settings || getDefaultSettings();

    // Validate settings payload exists
    const updates = req.body.settings;
    if (!updates || typeof updates !== "object") {
      return res.status(400).json({
        success: false,
        error: "Invalid settings payload",
      });
    }

    // Only extract allowed fields with type validation and sanitization
    const sanitizedSettings: Partial<AppSettings> = {};

    if (typeof updates.title === "string") {
      sanitizedSettings.title = updates.title.trim().slice(0, 100);
    }
    if (typeof updates.description === "string") {
      sanitizedSettings.description = updates.description.trim().slice(0, 500);
    }
    if (typeof updates.checkInDaily === "boolean") {
      sanitizedSettings.checkInDaily = updates.checkInDaily;
    }
    if (typeof updates.showSchoolRankings === "boolean") {
      sanitizedSettings.showSchoolRankings = updates.showSchoolRankings;
    }

    const newSettings: AppSettings = {
      ...currentSettings,
      ...sanitizedSettings,
    };

    await droppedAsset.updateDataObject({
      settings: newSettings,
    });

    await droppedAsset.fetchDataObject();

    return res.json({
      success: true,
      settings: droppedAsset.dataObject.settings,
    });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleUpdateSettings",
      message: "Error updating settings",
      req,
      res,
    });
  }
};