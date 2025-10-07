# Truck Optimize – Frontend v2

A modern, dark-themed logistics command center for truck routing, inventory management, and midday operations. Built with React, TypeScript, Vite, and twin.macro.

## Features

### 🗓️ Day Planner
- Interactive Google Maps with job pins
- Drag-and-drop job reordering
- CSV import for bulk job creation
- Job form with validation (location, items, priority, time windows)
- Overtime defer modal (feature-flagged)
- Export to CSV/PDF

### 📦 Inventory & Fleet
- Tree-view inventory with nested folders
- Drag-and-drop for organizing items
- Star/favorite items for quick access
- Fleet management with truck status tracking
- CRUD operations for items and trucks

### 🚛 Midday Operations
- 3-stop cadence visualization per truck
- "Mark 3 Complete" action
- "Send Next 3" WhatsApp stub (feature-flagged)
- Curfew warnings
- Real-time truck status monitoring

### 📊 Dashboards
- Key metrics (jobs completed, on-time %, avg times)
- Utilization by truck (bar chart)
- Jobs completed vs deferred trend (line chart)
- Location heatmap overlay (feature-flagged)

## Tech Stack

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: TailwindCSS (dark-only) + twin.macro + Emotion
- **State**: Zustand + TanStack Query
- **Forms**: react-hook-form + zod
- **Maps**: Google Maps JS API
- **Charts**: Recharts
- **Mocking**: MSW (Mock Service Worker)
- **UI Components**: Custom shadcn/ui components

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your Google Maps API key
# VITE_GOOGLE_MAPS_API_KEY=your_actual_key_here
```

### Development

```bash
# Start dev server with MSW mocking
npm run dev

# App will be available at http://localhost:8080
```

The app will automatically load seed data from `src/lib/msw/seeds/` and use MSW to mock all API calls.

### Building for Production

```bash
# Type check and build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── app/                  # (Reserved for future use)
├── components/           # Shared UI components
│   ├── ui/              # shadcn/ui components
│   ├── Layout.tsx       # Main layout with tabs
│   └── DatePicker.tsx   # Top-right date selector
├── features/            # (Reserved for feature-specific components)
├── lib/
│   ├── api/            # API client and TanStack Query hooks
│   ├── msw/            # MSW handlers and seed data
│   └── store/          # Zustand stores
├── pages/              # Route pages (Plan, Inventory, Ops, Dash)
├── types/              # TypeScript types
├── config/             # Environment and feature flags
└── styles/             # twin.macro setup
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5173/mock
VITE_GOOGLE_MAPS_API_KEY=your_key_here
VITE_WEBHOOK_NEXT3_URL=https://example.com/whatsapp-stub
VITE_FEATURE_FLAGS={"overtimeModal":true,"whatsappStub":true,"heatmap":true}
```

### Feature Flags
- `overtimeModal`: Show/hide overtime defer modal
- `whatsappStub`: Enable "Send Next 3" webhook button
- `heatmap`: Show location heatmap on dashboard

## Switching from MSW to Real Backend

The API layer is designed for easy backend swapping:

1. **Update `.env`**: Change `VITE_API_BASE_URL` to your real API endpoint
   ```env
   VITE_API_BASE_URL=https://api.yourbackend.com
   ```

2. **API endpoints** are defined in `src/lib/api/hooks.ts`:
   - `GET /jobs?date=YYYY-MM-DD`
   - `POST /jobs`
   - `PATCH /jobs/:id`
   - `DELETE /jobs/:id`
   - `POST /jobs/:id/defer`
   - `GET /trucks`
   - `PATCH /trucks/:id`
   - `GET /inventory`
   - `POST /inventory`
   - `PATCH /inventory/:id`
   - `DELETE /inventory/:id`
   - `POST /ops/mark-3-complete`
   - `POST /ops/send-next-3`
   - `GET /metrics/summary?from=&to=`

3. **Types** are centralized in `src/types/index.ts` for easy backend alignment

4. **Query keys** are in `src/lib/api/hooks.ts` for cache invalidation

## Dark-Only Theme

The app uses a dark logistics theme with:
- Deep slate/navy backgrounds
- Electric blue accents for actions
- Amber warnings for curfews/overtime
- Green for success states
- Cyan for active/in-progress states

Colors are defined in `src/index.css` and `tailwind.config.ts` using HSL values with CSS variables.

## Data Flow

1. **Date Selection**: Top-right date picker updates Zustand store (`useDateStore`)
2. **API Calls**: TanStack Query hooks fetch data based on selected date
3. **MSW Interception**: In development, MSW intercepts requests and returns seed data
4. **Optimistic Updates**: Mutations use optimistic updates with automatic rollback on error
5. **Toast Notifications**: Success/error feedback via Sonner

## CSV Import Format

For bulk job import, use this CSV structure:

```csv
location_name,address,action,items,priority,earliest,latest,service_minutes_override,notes
Downtown Depot,123 Main St,pickup,"item-1,item-2",1,08:00,10:00,30,Use dock B
```

## Testing Strategy

- **Unit tests**: Vitest for critical components (JobForm, drag-and-drop)
- **Integration tests**: MSW-based API hook testing
- **E2E tests**: Playwright smoke tests for all 4 tabs

(Test setup to be completed in next iteration)

## Known Limitations

- No authentication/authorization (single interface for all roles)
- Static truck locations (only updated via 3-stop cadence)
- No real-time WebSocket updates
- Heatmap requires Google Maps API key
- CSV export not yet implemented

## Roadmap

- [ ] Complete Google Maps integration with pins and clustering
- [ ] Implement drag-and-drop for job reordering
- [ ] Add CSV import/export functionality
- [ ] Build overtime defer modal
- [ ] Add inventory tree drag-and-drop
- [ ] Implement reassign job drawer
- [ ] Add audit log drawer
- [ ] Complete test suite (Vitest + Playwright)
- [ ] Add Docker support

## Contributing

This is an internal project. Contact the team lead before making changes.

## License

Proprietary - All rights reserved
