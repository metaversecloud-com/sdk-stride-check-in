import { DroppedAsset } from "@rtsdk/topia";

export interface CheckInRecord {
  profileId: string;
  date: string;
  schoolIds: string[];
  schoolNames: string[];
}

export interface AnalyticsRecord {
  visitorId: string;
  profileId: string;
  schoolIds: string[];
  schoolNames: string[];
  date: string;
}

export interface AppSettings {
  title: string;
  description: string;
  checkInDaily: boolean;
  showSchoolRankings: boolean;
}

export interface SchoolRanking {
  schoolId: string;
  schoolName: string;
  checkInCount: number;
  rank: number;
}

export interface IDroppedAsset extends DroppedAsset {
  dataObject: {
    checkedInUsers?: CheckInRecord[];
    totalCheckIns?: number;
    settings?: AppSettings;
    [key: string]: any;
  };
}
