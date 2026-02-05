import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { SchoolRanking } from "../types/DroppedAssetInterface.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to server assets folder (relative to server/utils)
const ASSETS_PATH = path.resolve(__dirname, "../assets");


// Cache for generated SVGs (keyed by assetId)
interface CacheEntry {
  svg: string;
  timestamp: number;
}
const svgCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30000; // 30 seconds




// Load leaderboard background image as base64
const getLeaderboardBackground = (): string => {
  const imagePath = path.join(ASSETS_PATH, "images", "leaderboard-image.png");
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    return `data:image/png;base64,${imageBuffer.toString("base64")}`;
  } catch {
    return "";
  }
};


const getLogoAsBase64 = (schoolId: string): string => {
  const logoPath = path.join(ASSETS_PATH, "school-logos", `${schoolId}.png`);
  const fallbackPath = path.join(ASSETS_PATH, "missing-logo.svg");

  try {
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      return `data:image/png;base64,${logoBuffer.toString("base64")}`;
    }
  } catch {
    // Fall through to fallback
  }

  // Use fallback
  try {
    const fallbackBuffer = fs.readFileSync(fallbackPath);
    return `data:image/svg+xml;base64,${fallbackBuffer.toString("base64")}`;
  } catch {
    // Return empty if even fallback fails
    return "";
  }
};

interface LeaderboardPosition {
  x: number;
  y: number;
  size: number;
}

// Positions for 1st, 2nd, 3rd place on the podium
const POSITIONS: LeaderboardPosition[] = [
  { x: 178, y: 80, size: 160 },    // 1st place (center, top)
  { x: 365, y: 210, size: 160 }, // 2rd place (right)
  { x: 20, y: 220, size: 160 },  // 3nd place (left)
];

const generateSvgContent = (rankings: SchoolRanking[]): string => {
  const top3 = rankings.slice(0, 3);

  // Generate image elements for each school
  const imageElements = top3.map((school, index) => {
    const pos = POSITIONS[index];
    if (!pos) return "";

    const logoDataUri = getLogoAsBase64(school.schoolId);
    if (!logoDataUri) return "";

    return `
    <image
      x="${pos.x}"
      y="${pos.y}"
      width="${pos.size}"
      height="${pos.size}"
      href="${logoDataUri}"
      preserveAspectRatio="xMidYMid meet"
    />`
  }).join("");

  const backgroundDataUri = getLeaderboardBackground();

  return `<svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 547 547" width="547" height="500">
  <!-- Podium background image -->
  <image
    x="0"
    y="200"
    height="328"
    width="547"
    href="${backgroundDataUri}"
    preserveAspectRatio="xMidYMid meet"
  />

  <!-- School logos -->
  ${imageElements}
</svg>`;
};

export const generateLeaderboardSvg = (assetId: string, rankings: SchoolRanking[]): string => {

  const now = Date.now();
  const cached = svgCache.get(assetId);

  // Return cached SVG if still valid
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.svg;
  }

  // Generate new SVG
  const svg = generateSvgContent(rankings);

  // Store in cache
  svgCache.set(assetId, { svg, timestamp: now });

  return svg;
};