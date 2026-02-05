import { Request, Response } from "express";
import { errorHandler, getCredentials, getDroppedAsset, Visitor } from "../utils/index.js";
import { IDroppedAsset } from "../types/DroppedAssetInterface.js";
import { VisitorInterface } from "@rtsdk/topia";

export const handleGetCheckedInUsers = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { visitorId, urlSlug } = credentials;

    const visitor: VisitorInterface = await Visitor.get(visitorId, urlSlug, { credentials });

    if (!visitor.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Admin access required",
      });
    }

    const droppedAsset: IDroppedAsset = await getDroppedAsset(credentials);

    const { checkedInUsers = [], totalCheckIns = 0 } = droppedAsset.dataObject;

    return res.json({
      success: true,
      checkedInUsers,
      totalCheckIns,
    });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetCheckedInUsers",
      message: "Error getting checked-in users",
      req,
      res,
    });
  }
};