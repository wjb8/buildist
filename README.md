# Buildist

Buildist is an offline-first React Native app for managing civic infrastructure assets. It focuses on fast local data capture, QR-code workflows, and lightweight AI assistance that can translate natural language requests into structured Realm mutations.

## Overview

- **Platform:** Expo + React Native (TypeScript)
- **Persistence:** Realm with schema types for roads, vehicles, and inspections
- **AI Layer:** Optional OpenAI-powered assistant accessed via a thin proxy
- **QR Workflows:** Generate, scan, and resolve QR tags to locate assets quickly
- **Offline Philosophy:** All CRUD happens locally; sync/publish is deferred to future phases

## Feature Highlights

- Asset form for creating and editing roads/vehicles with validation and demo seeding
- Asset list with filtering, highlighting, and QR search support
- Inspection tracking primitives (detail view + form scaffolding)
- QR scanner + generator utilities for tagging assets in the field
- AI assistant UI that:
  1. Sends prompts to a proxy endpoint
  2. Shows the model’s proposed tool call
  3. Applies the change locally via Realm once approved
- Admin login that persists locally via Expo SecureStore until the user logs out

## Architecture

| Layer    | Details                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------- |
| UI       | Custom component library under `src/components`, shared styles in `src/styles`                                |
| State    | Local React state for screens, persistent data in Realm models (`src/storage`)                                |
| Data     | Models for `Road`, `Vehicle`, `Inspection`; handlers in `src/services/ai/handlers.ts` mutate Realm            |
| Services | QR helpers, AI service wrapper, demo data seeding                                                             |
| Server   | `server/assistantProxy.ts` plus `server/tools/*` define the tool schemas consumed by the OpenAI Responses API |

## Asset Data Model

### Road

- Required: `_id`, `name`, `condition`, `surfaceType`, `trafficVolume`, `createdAt`, `updatedAt`, `synced`
- Optional: `location`, `notes`, `qrTagId`, `length`, `width`, `lanes`, `speedLimit`

### Vehicle

- Required: `_id`, `name`, `identifier`, `condition`, `photoUris`, `createdAt`, `updatedAt`, `synced`
- Optional: `location`, `notes`, `qrTagId`, `mileage`, `hours`, `lastServiceDate`, `requiresService`, `priority`

### Inspections

- Required: `_id`, `assetId`, `inspector`, `description`, `score`, `timestamp`, `createdAt`, `updatedAt`, `synced`
- Optional: `maintenanceNeeded`, `nextDue`, `photos`, `issueType`, `priority`

## Local Development

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator

### Setup

```bash
git clone <repo>
cd buildist
npm install
cp .env.example .env   # define Expo + OpenAI vars
npm start              # launches Expo Dev Tools
```

Key env vars:

- `EXPO_PUBLIC_AI_PROXY_URL` – base URL of the deployed proxy (e.g., `https://your-app.vercel.app/api`)
- `EXPO_PUBLIC_OPENAI_ASSISTANT_ID` – optional Assistant ID if using the Assistants API
- `OPENAI_API_KEY` – used only on the proxy/server side

## AI Proxy Deployment (Vercel)

1. Ensure `api/assistantProxy.ts` re-exports `server/assistantProxy.ts` for Vercel’s routing.
2. Add `OPENAI_API_KEY` (and optional `OPENAI_MODEL`) via `vercel env add`.
3. Deploy with `vercel` (preview) and `vercel deploy --prod`.
4. Hit `https://<project>.vercel.app/api/assistantProxy` with a POST to confirm it returns content/tool proposals.
5. Update `EXPO_PUBLIC_AI_PROXY_URL` so the mobile app can reach the endpoint.

## Testing

```bash
npm test             # run Jest suite
npm run test:watch   # watch mode
npm run test:coverage
```

## Deployment Targets

- **Mobile:** `npm run ios`, `npm run android`, or `npm run web` for Expo Go/dev clients
- **Production builds:** `expo build:ios` / `expo build:android`
- **Serverless proxy:** Vercel Edge Function under `api/assistantProxy.ts`

## Production / Beta Release Considerations

### Local database (Realm)

- **Schema changes**: If you change any Realm model schema (e.g. `src/storage/models/assets/Asset.ts`, `src/storage/models/Inspection.ts`), you must **bump `schemaVersion`** in `src/storage/realm.ts`. After a Play Store release, plan migrations carefully—schema breaks can wipe user data if you “just reset”.
- **Seeding**: Keep demo seeding **seed-on-empty only** (do not reseed on every app start). Avoid any automatic “force reseed” behavior in beta/prod.
- **Data loss expectations**: All data is **on-device only** in Phase 1. Uninstalling the app, switching phones, or clearing storage will remove data. (Sync/backup is out of scope for Phase 1.)
- **Growth**: Inspections and photos can grow quickly. Photos are stored as **local URIs** (not blobs), but consider retention rules in later phases if testers generate lots of data.
- **Encryption** (optional but recommended for sensitive data): Consider enabling Realm encryption before a “real” production rollout. It’s much easier to decide early than after shipping.

### AI assistant (proxy)

- **Env vars**: Ensure `EXPO_PUBLIC_AI_PROXY_URL` is set for the build you ship. The proxy must have `OPENAI_API_KEY` configured.
- **Offline behavior**: Storage is offline-first; the AI assistant requires network access to the proxy. Make sure the UI fails gracefully when offline or when the proxy is down.
- **Abuse protection**: Add basic rate limiting / auth to the proxy before broad distribution (to prevent open endpoint abuse).

## Conventions

- Keep Realm schema definitions, AI tool schemas, and server tool definitions in sync.
- Treat `server/tools/*` as the canonical JSON schema for the OpenAI proxy.
- Memoize `AIService` instances in React components to avoid repeated instantiation.
