# Tech Stack: Meal Planner PWA

A short and concise overview of the technologies, libraries, and tools used to build this application.

## Core Framework & Language
- **React 18**: Frontend library for building the component-based user interface.
- **TypeScript**: Used for type-safety and improved developer experience.
- **Vite**: Modern, ultra-fast build tool and development server.

## Data & Persistence
- **Dexie.js**: A minimalist wrapper for **IndexedDB**, providing reliable offline-first storage within the browser.
- **dexie-react-hooks**: Enables seamless integration between Dexie databases and React state.

## User Interface & Experience
- **@dnd-kit**: A modern drag-and-drop toolkit used for moving meals from the index to the calendar.
- **Lucide React**: Clean and consistent icon set used for navigation and categorization.
- **Vanilla CSS**: Leveraged CSS Variables and modern Flex/Grid layouts for a premium, custom design without heavy utility frameworks.
- **clsx**: Utility for managing conditional CSS classes.

## Logic & Utilities
- **date-fns**: Comprehensive library for handling complex date calculations, localized Swedish weeks, and calendar logic.

## Deployment & DevOps
- **GitHub Actions**: Automated CI/CD pipeline that builds and deploys the application to **GitHub Pages** on every push to the `main` branch.
