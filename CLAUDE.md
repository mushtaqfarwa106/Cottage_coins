# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cottage Coins is a finance management web application built with Next.js 16 (App Router) and React 19. The app provides features for tracking transactions, managing categories, generating reports, AI-powered forecasting, and email reports.

## Development Commands

### Core Commands
- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Create production build
- `npm start` - Run production server
- `npm run lint` - Run ESLint

## Tech Stack

- **Framework**: Next.js 16.0.1 with App Router
- **React**: 19.2.0
- **Styling**: Tailwind CSS v4 with PostCSS plugin (`@tailwindcss/postcss`)
- **UI Components**: Radix UI primitives with shadcn/ui (New York style)
- **Icons**: lucide-react
- **Utilities**: clsx, tailwind-merge, class-variance-authority
- **Animations**: tw-animate-css

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.js          # Root layout with sidebar + header
│   ├── page.js            # Landing/home page
│   ├── dashboard/         # Main dashboard view
│   ├── transactions/      # Transaction management
│   ├── categories/        # Category management
│   ├── reports/           # Financial reports
│   ├── forecast/          # AI forecasting
│   ├── email-reports/     # Email report configuration
│   ├── history/           # Transaction history
│   ├── settings/          # Application settings
│   └── logout/            # Logout route
├── components/
│   ├── ui/               # shadcn/ui components (JSX format)
│   └── layout/           # Layout components (sidebar, header)
├── hooks/                # Custom React hooks
│   └── use-mobile.js    # Mobile detection hook
└── lib/
    └── utils.js         # Utility functions (cn helper)
```

### Layout System

The application uses a global layout (`src/app/layout.js`) that wraps all pages with:
- **SidebarProvider**: Context provider for sidebar state
- **AppSidebar**: Left navigation sidebar with app navigation
- **DashboardHeader**: Top header bar
- **SidebarInset**: Main content area with automatic scrolling

All pages render within this layout, providing consistent navigation across routes.

### Navigation Structure

The sidebar navigation is defined in `src/components/layout/app-sidebar.jsx` with the following routes:
- Dashboard (`/dashboard`)
- Transactions (`/transactions`)
- Categories (`/categories`)
- Reports (`/reports`)
- AI Forecast (`/forecast`)
- Email Reports (`/email-reports`)
- History (`/history`)

Settings and Logout routes exist but are not in the main nav array.

### Styling System

- **Tailwind CSS v4** with new PostCSS plugin architecture
- Custom CSS variables defined in `src/app/globals.css` using `@theme inline`
- Dark mode support via custom variant: `@custom-variant dark (&:is(.dark *))`
- Utility function `cn()` in `src/lib/utils.js` combines clsx and tailwind-merge for conditional classes
- Inter font loaded via `next/font/google` with full weight range (100-900)

### shadcn/ui Configuration

Configuration in `components.json`:
- **Style**: New York
- **Format**: JSX (tsx: false)
- **RSC**: Enabled (rsc: true)
- **Icon Library**: lucide-react
- **Path aliases**: Uses `@/` prefix for imports
  - `@/components` → src/components
  - `@/lib` → src/lib
  - `@/hooks` → src/hooks
  - `@/ui` → src/components/ui

When adding new shadcn/ui components, they will be generated in JSX format in `src/components/ui/`.

## Code Conventions

### File Extensions
- Use `.js` for page files and utilities
- Use `.jsx` for component files

### Component Patterns
- Client components must use `"use client"` directive (e.g., sidebar uses `usePathname` hook)
- Server components are the default (no directive needed)
- All pages are server components by default unless client features are needed

### Import Aliases
Always use `@/` path aliases for imports:
```javascript
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AppSidebar } from "@/components/layout/app-sidebar"
```

### Styling
- Use the `cn()` utility from `@/lib/utils` to merge Tailwind classes
- Reference CSS variables defined in globals.css for theming
- Sidebar-specific colors use `--sidebar-*` variables

## Important Notes

- The root page (`src/app/page.js`) currently just displays "Dashboard" text - likely redirects to `/dashboard` in production
- Most route pages are placeholder pages with minimal content
- The app uses Next.js 16's App Router exclusively (no pages directory)
- ESLint config extends `eslint-config-next/core-web-vitals`
