import { Credentials, IDroppedAsset } from "../../types/index.js";
import { errorHandler } from "../errorHandler.js";
import { DroppedAsset } from "../topiaInit.js";
import { initializeDroppedAssetDataObject } from "./initializeDroppedAssetDataObject.js";

export const getDroppedAsset = async (credentials: Credentials) => {
  try {
    const { assetId, urlSlug } = credentials;

    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, { credentials });

    if (!droppedAsset) throw "Dropped asset not found";

    await droppedAsset.fetchDataObject();

    // Only initialize if data object doesn't have checkedInUsers yet
    if ((droppedAsset as IDroppedAsset).dataObject === undefined) {
      await initializeDroppedAssetDataObject(droppedAsset as IDroppedAsset);
      await droppedAsset.fetchDataObject();
    }

    return droppedAsset;
  } catch (error) {
    return errorHandler({
      error,
      functionName: "getDroppedAsset",
      message: "Error getting dropped asset",
    });
  }
};
