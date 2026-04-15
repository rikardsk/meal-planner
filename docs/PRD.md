# Product Requirements Document: Meal Planner PWA

A concise overview of the features, goals, and user experience requirements for the Meal Planner application.

## 1. Product Vision
To provide a seamless, high-performance, and offline-first experience for managing weekly meal plans. The application prioritizes speed of entry, clarity of categorization, and a premium "alive" interface.

## 2. Key Features

### 📅 Calendar View
- **Swedish Localization**: Month and day names in Swedish, Mon-Sun week structure.
- **Dynamic Interaction**: Select days to add meals via inline editing or drag-and-drop.
- **Visual Feedback**: Days are background-colored and icon-badged based on the meal's category.
- **Navigation**: Month-to-month browsing with a quick "Gå till idag" shortcut.
- **Week Copying**: Single-click "Kopiera föreg. vecka" feature to replicate meal plans instantly.

### 🍱 Meal Index
- **Persistent Library**: All created meals are saved for future use.
- **Categories**: Standardized categories (Kött, Fisk, Kyckling, Vego, Okänd) with distinct color systems.
- **Filtering**: Quick filters by category or historical weekday usage.
- **Topplista (Rankings)**: Toggle to sort meals by frequency of use rather than alphabetically.

### 🖱️ User Experience (UX)
- **Drag-and-Drop**: Drag meals from the index directly into calendar dates with a minimalist ghost preview.
- **Responsive Design**: Side-by-side split view on desktop; tabbed navigation on mobile.
- **Collapsible Sidebar**: Hamburger menu to hide/show the meal index for focused planning.
- **Animations**: Smooth sliding transitions and micro-interactions for a premium feel.

## 3. Technical Requirements
- **Offline Reliability**: Data must persist locally in the browser using IndexedDB.
- **PWA Capabilities**: Installable as a web app on mobile and desktop.
- **Zero-Latency Search**: Instant filtering of the meal library.
- **Automated Deployment**: Publicly accessible URL with synchronized updates from source code.

## 4. Design Aesthetics
- **Modern Typography**: High-readability sans-serif fonts (Outfit/Inter).
- **Glassmorphism**: Subtle use of transparency and shadows to create depth.
- **Dynamic Palette**: HSL-based colors that adapt between light and dark modes.
