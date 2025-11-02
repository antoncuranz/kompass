# CLAUDE.md

## Project Overview

Local-first travel planning PWA using Jazz-tools for state management and collaboration. Backend microservice in `../backend` provides flight/train lookup and geocoding.

## Commands

```bash
npm run dev              # Dev server with Turbopack
npm run build            # Production build
npm start                # Serve built app (npx serve)
npm run format           # Format with Prettier
npm run format:check     # Check formatting
```

## Architecture

### Jazz-tools State Management

**Ref**: https://jazz.tools/llms-full.txt

- CoValue schema in `src/schema.ts` defines all models
- No store.ts - state fully managed by Jazz
- Models: `Trip`, `Activity`, `Accommodation`, `Transportation` (discriminated union: Flight/Train/Generic)
- Account root contains trips list
- Real-time sync via WebSocket peer: `ws://127.0.0.1:4200`
- Auth: Jazz passkey + passphrase only (no guest mode)

### Next.js Structure

- App Router with dynamic routes: `/[slug]/itinerary`, `/[slug]/map`, `/[slug]/cost`
- Slug = Jazz trip ID
- API proxy: `/api/*` → `BACKEND_URL/api/*`
- Client-side only (no SSR with Jazz)

### Backend Integration

- POST `/api/v1/flights` - Flight lookup (IATA codes)
- GET `/api/v1/geocoding/location?query=` - Geocoding
- Train station search endpoints
- Backend enriches data with coordinates, flight details

### Key Patterns

- Forms: react-hook-form + Zod schemas
- UI: basecn components (shadcn based on BaseUI) + Tailwind 4 (PostCSS-based)
  - **Ref**: https://basecn.dev/llms.txt
- Maps: Mapbox/MapLibre GL

### Transportation Model

Discriminated union with `type` field:

- `"flight"`: Uses `Airport` + `FlightLeg` with IATA codes
- `"train"`: Uses `TrainStation` + `TrainLeg` with station IDs
- `"generic"`: Simple from/to/duration

All locations store lat/lng coordinates.
