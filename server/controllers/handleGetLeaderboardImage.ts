import { Request, Response } from "express";
import { errorHandler, getCredentials, getDroppedAsset } from "../utils/index.js";
import { IDroppedAsset, SchoolRanking } from "../types/DroppedAssetInterface.js";
import { getDefaultSettings } from "../utils/droppedAssets/initializeDroppedAssetDataObject.js";
import { generateLeaderboardSvg } from "../utils/generateLeaderboardSvg.js";
import { getSchoolRankings } from "../utils/getSchoolRankings.js";

export const handleGetLeaderboardImage = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const droppedAsset: IDroppedAsset = await getDroppedAsset(credentials);
    const settings = droppedAsset.dataObject.settings || getDefaultSettings();

    // Return empty SVG if rankings are disabled
    if (!settings.showSchoolRankings) {
      res.setHeader("Content-Type", "image/svg+xml");
      return res.send(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 314" width="256" height="314"></svg>`);
    }

    // Calculate rankings from check-in data
    const sortedSchools = getSchoolRankings(droppedAsset);

    // Generate SVG (uses internal caching)
    // @ts-ignore
    const svg = generateLeaderboardSvg(droppedAsset.id, sortedSchools, false);

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    return res.send(svg);
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetLeaderboardImage",
      message: "Error getting leaderboard image",

      req,
      res,
    });
  }
};