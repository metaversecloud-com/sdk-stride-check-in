import { Request, Response } from "express";
import {
  errorHandler,
  getCredentials,
  getDroppedAsset,
  initializeDroppedAssetDataObject,
  Visitor,
} from "../utils/index.js";
import { IDroppedAsset } from "../types/DroppedAssetInterface.js";
import { VisitorInterface } from "@rtsdk/topia";

export const handleReset = async (req: Request, res: Response) => {
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

    await initializeDroppedAssetDataObject(droppedAsset);

    await droppedAsset.fetchDataObject();

    const { checkedInUsers, totalCheckIns } = droppedAsset.dataObject;

    return res.json({
      success: true,
      gameState: {
        checkedInUsers,
        totalCheckIns,
      },
    });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleReset",
      message: "Error resetting data object",
      req,
      res,
    });
  }
};
