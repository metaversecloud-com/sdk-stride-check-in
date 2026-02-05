import { Request, Response } from "express";
import { errorHandler, getCredentials, getDroppedAsset, Visitor } from "../utils/index.js";
import { AppSettings, IDroppedAsset } from "../types/DroppedAssetInterface.js";
import { getDefaultSettings } from "../utils/droppedAssets/initializeDroppedAssetDataObject.js";
import { VisitorInterface } from "@rtsdk/topia";

export const handleGetSettings = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { visitorId, urlSlug } = credentials;

    const droppedAsset: IDroppedAsset = await getDroppedAsset(credentials);
    const visitor: VisitorInterface = await Visitor.get(visitorId, urlSlug, { credentials });

    const settings: AppSettings = droppedAsset.dataObject.settings || getDefaultSettings();

    if (visitor.isAdmin) {
      return res.json({
        success: true,
        settings,
      });
    }

    // Non-admins only see public settings
    return res.json({
      success: true,
      settings: {
        title: settings.title,
        description: settings.description,
        showSchoolRankings: settings.showSchoolRankings,
      },
    });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetSettings",
      message: "Error getting settings",
      req,
      res,
    });
  }
};