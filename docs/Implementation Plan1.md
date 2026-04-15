# Meal Planner App Implementation Plan

This plan outlines the architecture, tech stack, and step-by-step implementation for the Meal Planner PWA.

## User Review Required

> [!IMPORTANT]
> **Backend Decision Needed**
> Before we write code, we need to decide on the backend architecture. Since this is a PWA (Progressive Web App) that works on mobile and web, offline capabilities are highly valuable. Here are three options:
>
> 1. **Option A: Local-First (Recommended for V1)**: We use IndexedDB (via `dexie` library) to store everything locally on the device first. The app is instantly entirely offline-capable. In a future version, we can easily add a cloud syncing layer. This is the fastest way to get the V1 working flawlessly on mobile.
> 2. **Option B: Backend-as-a-Service (Supabase or Firebase)**: We use Supabase (PostgreSQL) or Firebase. This gives us immediate cloud syncing across devices, but requires a bit more initial setup for auth and database schemas.
> 3. **Option C: Full-stack Next.js + SQLite/Postgres**: We use Next.js for both frontend and backend API endpoints. Good for SEO and unified codebase, but slightly more complex PWA offline caching than a pure client-side React app.
>
> *Please let me know which path you prefer!*

## Proposed Stack

- **Frontend Framework**: React 18 with TypeScript (via Vite).
- **Styling**: Vanilla CSS (using CSS Variables for theming and CSS Grid/Flexbox for layout).
- **PWA Capabilities**: `vite-plugin-pwa` for manifest generation and service worker caching.
- **Drag and Drop**: `@dnd-kit` (modern, lightweight, accessible DND library for React).
- **State Management**: React Context + lightweight custom hooks, or depending on the backend choice, the respective data fetching library.

## V1 Features & Architecture

### Layout & UI
- **Split View (Desktop)**: Calendar on the left (spanning the year), Meal Index on the right.
- **Mobile View**: Tabs or a drawer-based navigation to switch between Calendar and Meal Index, ensuring an app-like feel.
- **Modern Aesthetics**: Sleek dark/light mode, rounded corners, soft shadows, and CSS transitions for interactions.

### Calendar View
- A continuous scrollable calendar or paginated month/week view (we will build a custom CSS Grid).
- Each day shows the assigned meal.
- Clicking a day opens a modal or inline input to type/edit a meal.

### Meal Index
- A searchable library of meals.
- Items can be dragged from this index and dropped directly onto a day in the Calendar.

### Add-on-the-fly Logic
- When typing a meal directly into a day in the Calendar, we will check if it exists in the Meal Index.
- If not, a toast or inline prompt will ask: "Add '[Meal]' to your Meal Index?".

## Implementation Phases

### Phase 1: Foundation
1. Initialize Vite React TypeScript project.
2. Setup `vite-plugin-pwa` for mobile installability.
3. Establish global CSS variables for a modern design system.

### Phase 2: Database / State Setup
1. Implement the chosen backend option (e.g., Dexie schemas for `meals` and `planned_days`).

### Phase 3: Core Components
1. Build the **Meal Index** component (list view, search, add button).
2. Build the **Calendar Grid** component (date logic, rendering days).

### Phase 4: Drag and Drop & Interactivity
1. Integrate `@dnd-kit` to make Meal Index items draggable.
2. Define Calendar days as drop zones.
3. Implement the logic to update the database when a drop occurs.
4. Implement inline-editing on days and the "auto-add to index" prompt.

### Phase 5: Polish
1. Ensure mobile layout is perfect (touch targets, no horizontal scrolling).
2. Add micro-animations (hover states, drop feedback).

## Open Questions

1. Which backend path (Option A, B, or C) do you prefer?
2. For the 1-year calendar, do you envision an eternal scrolling list of weeks/months, or a standard month-by-month view that you page through?
