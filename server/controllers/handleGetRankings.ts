import { Request, Response } from "express";
import { errorHandler, getCredentials, getDroppedAsset } from "../utils/index.js";
import { IDroppedAsset, SchoolRanking } from "../types/DroppedAssetInterface.js";
import { getDefaultSettings } from "../utils/droppedAssets/initializeDroppedAssetDataObject.js";
import { getSchoolRankings } from "../utils/getSchoolRankings.js";

interface CacheEntry {
  rankings: SchoolRanking[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30000; // 30 seconds

export const handleGetRankings = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const droppedAsset: IDroppedAsset = await getDroppedAsset(credentials);
    const settings = droppedAsset.dataObject.settings || getDefaultSettings();

    // Return empty if rankings are disabled
    if (!settings.showSchoolRankings) {
      return res.json({
        success: true,
        rankings: [],
        enabled: false,
      });
    }

    // Check cache
    const cacheKey = droppedAsset.id;
    // @ts-ignore
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return res.json({
        success: true,
        rankings: cached.rankings,
        enabled: true,
      });
    }

    // Calculate rankings from check-in data
    const sortedSchools = getSchoolRankings(droppedAsset);

    // Update cache
    //@ts-ignore
    cache.set(cacheKey, {
      rankings: sortedSchools,
      timestamp: now,
    });

    return res.json({
      success: true,
      rankings: sortedSchools,
      enabled: true,
    });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetRankings",
      message: "Error getting rankings",
      req,
      res,
    });
  }
};