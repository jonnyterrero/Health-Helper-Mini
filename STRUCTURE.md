# Project Structure

## Overview

This Next.js app follows the App Router architecture with a clean separation of concerns.

```
v0-nutrition-symptoms-and-remedies/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with navigation
│   ├── page.tsx             # Dashboard/home page
│   ├── globals.css          # Global styles
│   ├── nutrition/           
│   │   └── page.tsx         # Nutrition tracking page
│   ├── exercise/            
│   │   └── page.tsx         # Exercise tracking page
│   ├── predictions/         
│   │   └── page.tsx         # ML predictions page
│   └── remedies/            
│       └── page.tsx         # Remedy tracker page
│
├── components/              # Reusable React components
│   ├── Navigation.tsx       # Top navigation bar
│   ├── PredictionCard.tsx   # Symptom prediction card
│   └── QuickStart.tsx       # Sample data loader
│
├── lib/                     # Utility functions & business logic
│   ├── predictions.ts       # ML prediction algorithm
│   ├── storage.ts           # localStorage utilities
│   └── sampleData.ts        # Sample data for quick start
│
├── public/                  # Static assets (if any)
│
├── package.json             # Dependencies
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── next.config.js          # Next.js configuration
├── .gitignore              # Git ignore rules
├── README.md               # Project documentation
├── DEPLOYMENT.md           # Deployment guide
└── STRUCTURE.md            # This file
```

## Key Files Explained

### App Router Pages

- **`app/page.tsx`** - Main dashboard with quick stats and today's predictions
- **`app/nutrition/page.tsx`** - Nutrition and symptom tracking with forms
- **`app/exercise/page.tsx`** - Exercise logging with CSV import support
- **`app/predictions/page.tsx`** - ML predictions with trend analysis charts
- **`app/remedies/page.tsx`** - Remedy effectiveness tracker

### Components

- **`Navigation.tsx`** - Responsive nav bar with active state
- **`PredictionCard.tsx`** - Displays individual symptom predictions with severity colors
- **`QuickStart.tsx`** - Modal to load sample data for demo purposes

### Libraries

- **`predictions.ts`** - Core ML algorithm that calculates symptom probabilities
- **`storage.ts`** - localStorage wrapper with TypeScript types
- **`sampleData.ts`** - Pre-defined sample entries for testing

## Data Flow

1. **User Input** → Forms in pages (Nutrition, Exercise, Remedies)
2. **Storage** → Data saved to localStorage via `storage.ts`
3. **Prediction** → `predictions.ts` analyzes data and calculates probabilities
4. **Display** → Components render predictions, charts, and insights

## TypeScript Types

All data structures are strongly typed:

```typescript
// Nutrition Entry
interface NutritionEntry {
  id: string;
  date: string;
  meal: string;
  foods: string[];
  symptoms: string[];
  severity: number;
  sleep: number;
  stress: number;
  caffeine: boolean;
}

// Exercise Entry
interface ExerciseEntry {
  id: string;
  date: string;
  type: string;
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  recovery: number;
  notes: string;
}

// Remedy
interface Remedy {
  id: string;
  name: string;
  type: 'medication' | 'supplement' | 'lifestyle' | 'food';
  effectiveness: number;
  usageCount: number;
  conditions: string[];
  notes: string;
}
```

## Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Custom Colors** - Primary blue palette in `tailwind.config.ts`
- **Responsive Design** - Mobile-first with `md:` breakpoints
- **Gradients** - Modern gradient backgrounds for visual appeal

## State Management

- **Client-side State** - React `useState` hooks
- **Persistence** - Browser localStorage
- **No Global State** - Each page manages its own state
- **URL State** - Next.js router for navigation

## Charts & Visualizations

- **Recharts** - For trend analysis and correlation charts
- **Line Charts** - 7-day trend visualization
- **Bar Charts** - Factor-symptom correlations
- **Responsive** - All charts adapt to screen size

## Adding New Features

### Add a New Page

1. Create `app/new-page/page.tsx`
2. Add route to `Navigation.tsx`
3. Import necessary utilities from `lib/`

### Add a New Data Type

1. Define interface in `lib/storage.ts`
2. Add CRUD functions (save, get, update)
3. Create corresponding UI components

### Extend Prediction Algorithm

1. Update `lib/predictions.ts`
2. Add new factors and conditions
3. Adjust probability calculations
4. Update visualization components

## Performance

- **Code Splitting** - Automatic with Next.js App Router
- **Client Components** - Interactive features use `'use client'`
- **Optimized Rendering** - Only re-render on data changes
- **Lazy Loading** - Charts load only when visible

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires:
- ES6+ support
- LocalStorage API
- CSS Grid & Flexbox
