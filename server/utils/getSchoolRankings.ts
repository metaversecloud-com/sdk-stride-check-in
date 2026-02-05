import { SchoolRanking } from "../types/DroppedAssetInterface.js";

// Cava Schools and FLCAA Schools should count as a single school

const cavaSchools = [
  "5835", "1080", "2000", "5840", "1007", "2320", "1202", "1180", "1502"
];

const flccaSchools = ["6850", "5946", "5660"];

export const getSchoolRankings = (droppedAsset: any): SchoolRanking[] => {
  const checkedInUsers = droppedAsset.dataObject.checkedInUsers || [];
  const schoolCounts = new Map<string, { count: number; name: string }>();

  for (const record of checkedInUsers) {
    for (let i = 0; i < record.schoolIds.length; i++) {
      const schoolId = record.schoolIds[i];
      const schoolName = record.schoolNames[i] || schoolId;

      // Consolidate CAVA and FLCAA schools using first ID in each array
      let consolidatedId = schoolId;
      let consolidatedName = schoolName;
      if (cavaSchools.includes(schoolId)) {
        consolidatedId = cavaSchools[0];
        consolidatedName = "CAVA";
      } else if (flccaSchools.includes(schoolId)) {
        consolidatedId = flccaSchools[0];
        consolidatedName = "FLCAA";
      }

      const existing = schoolCounts.get(consolidatedId);
      if (existing) {
        existing.count++;
      } else {
        schoolCounts.set(consolidatedId, { count: 1, name: consolidatedName });
      }
    }
  }

  // Convert to array and sort by count descending
  const sortedSchools: SchoolRanking[] = Array.from(schoolCounts.entries())
    .map(([schoolId, data]) => ({
      schoolId,
      schoolName: data.name,
      checkInCount: data.count,
      rank: 0,
    }))
    .sort((a, b) => b.checkInCount - a.checkInCount);

  // Assign ranks with tie handling
  let currentRank = 1;
  for (let i = 0; i < sortedSchools.length; i++) {
    if (i > 0 && sortedSchools[i].checkInCount < sortedSchools[i - 1].checkInCount) {
      currentRank = i + 1;
    }
    sortedSchools[i].rank = currentRank;
  }

  return sortedSchools;
};