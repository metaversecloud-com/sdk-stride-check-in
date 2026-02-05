import { Request, Response } from "express";
import { errorHandler, getCredentials, getDroppedAsset, Visitor } from "../utils/index.js";
import { IDroppedAsset } from "../types/DroppedAssetInterface.js";
import { VisitorInterface } from "@rtsdk/topia";

export const handleGetGameState = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { profileId, visitorId, urlSlug } = credentials;

    const droppedAsset: IDroppedAsset = await getDroppedAsset(credentials);

    const { checkedInUsers = {}, totalCheckIns = 0 } = droppedAsset.dataObject;

    const visitor: VisitorInterface = await Visitor.get(visitorId, urlSlug, { credentials });

    visitor.updateDataObject(
      {},
      {
        analytics: [{ analyticName: "starts", uniqueKey: profileId }],
      },
    );

    return res.json({
      success: true,
      gameState: {
        checkedInUsers,
        totalCheckIns,
      },
      visitor: { isAdmin: visitor.isAdmin },
    });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetGameState",
      message: "Error getting game state",
      req,
      res,
    });
  }
};
