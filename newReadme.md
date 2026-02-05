# Topia Check-In App

A check-in application built for the Topia platform that allows users to check in and tracks school rankings based on check-in counts.

## Features

- **User Check-In**: Users can check in once (or daily, configurable by admin)
- **School Rankings**: Displays a leaderboard of schools ranked by check-in count
- **Server-Rendered Leaderboard**: Dynamic SVG leaderboard showing top 3 schools with logos
- **Admin Panel**: Configure settings, view check-in summary, and reset data

## Tech Stack

### Client
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing

### Server
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Topia SDK** (@rtsdk/topia) - Topia platform integration

## Project Structure

```
├── client/                    # Frontend React app
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── AdminFloatingButton.tsx
│   │   │   ├── AdminSettings.tsx
│   │   │   ├── AdminView.tsx
│   │   │   ├── CheckInButton.tsx
│   │   │   ├── CheckInSummary.tsx
│   │   │   ├── LeaderboardSection.tsx
│   │   │   ├── SchoolRankings.tsx
│   │   │   └── ...
│   │   ├── context/           # React context for global state
│   │   ├── pages/             # Page components
│   │   │   ├── Home.tsx
│   │   │   └── Error.tsx
│   │   ├── utils/             # Utility functions
│   │   │   └── backendAPI.ts  # Axios instance for API calls
│   │   ├── App.tsx            # Main app component
│   │   └── main.tsx           # Entry point
│   ├── public/                # Static assets
│   └── vite.config.ts         # Vite configuration
│
├── server/                    # Backend Express server
│   ├── assets/                # Server-side assets
│   │   ├── school-logos/      # School logo images (PNG)
│   │   ├── missing-logo.svg   # Fallback logo
│   │   └── svg/               # SVG templates
│   ├── controllers/           # Route handlers
│   │   ├── handleCheckIn.ts
│   │   ├── handleGetRankings.ts
│   │   ├── handleGetLeaderboardImage.ts
│   │   ├── handleGetSettings.ts
│   │   ├── handleUpdateSettings.ts
│   │   ├── handleReset.ts
│   │   └── ...
│   ├── types/                 # TypeScript type definitions
│   │   └── DroppedAssetInterface.ts
│   ├── utils/                 # Utility functions
│   │   ├── generateLeaderboardSvg.ts
│   │   └── droppedAssets/
│   ├── routes.ts              # API route definitions
│   └── index.ts               # Server entry point
│
├── package.json               # Root package.json (npm workspaces)
└── .env                       # Environment variables
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Topia developer account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd single-check-in
   ```

2. **Install dependencies** (from root directory)
   ```bash
   npm install
   ```
   > Note: This project uses npm workspaces. Run `npm install` from the root, not from client/ or server/ individually.

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   API_KEY=your_api_key
   INSTANCE_DOMAIN=api.topia.io
   INSTANCE_PROTOCOL=https
   INTERACTIVE_KEY=your_interactive_key
   INTERACTIVE_SECRET=your_interactive_secret
   ```

   Get these values from your [Topia Developer Dashboard](https://topia.io/t/dashboard/integrations).

### Development

Run both client and server in development mode:

```bash
npm run dev
```

This starts:
- **Client**: http://localhost:3001 (Vite dev server)
- **Server**: http://localhost:3000 (Express server)

The client proxies `/api` requests to the server automatically.

### Building for Production

```bash
npm run build
```

This builds both client and server:
- Client: outputs to `client/build/`
- Server: compiles TypeScript to `server/dist/`

### Running in Production

```bash
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/game-state` | Get current game state and visitor info |
| GET | `/api/check-in` | Record a check-in for the current user |
| GET | `/api/has-checked-in` | Check if current user has already checked in |
| GET | `/api/checked-in-users` | Get list of all checked-in users |
| GET | `/api/settings` | Get app settings (public or full for admins) |
| PUT | `/api/settings` | Update app settings (admin only) |
| GET | `/api/rankings` | Get school rankings by check-in count |
| GET | `/api/leaderboard-image` | Get server-rendered SVG leaderboard |
| PUT | `/api/reset` | Reset all check-in data (admin only) |
| GET | `/api/system/health` | Health check endpoint |

## Configuration

### App Settings

Admins can configure the following settings:

| Setting | Type | Description |
|---------|------|-------------|
| `title` | string | Display title on the home page |
| `description` | string | Description text below the title |
| `checkInDaily` | boolean | `false` = one-time check-in, `true` = daily check-in |
| `showSchoolRankings` | boolean | Show/hide the school leaderboard |

### Data Object Structure

The app stores data in the Topia DroppedAsset's dataObject:

```typescript
{
  checkedInUsers: [
    {
      profileId: string,
      date: string,        // ISO date string
      schoolIds: string[],
      schoolNames: string[]
    }
  ],
  totalCheckIns: number,
  settings: {
    title: string,
    description: string,
    checkInDaily: boolean,
    showSchoolRankings: boolean
  }
}
```

## Adding School Logos

1. Place PNG logo files in `server/assets/school-logos/`
2. Name files using the school ID: `{schoolId}.png`
3. If a logo doesn't exist, `missing-logo.svg` is used as fallback