# FretLab App Implementation

This is a Figma Make app that implements the App Template Contract v1 with a local database using IndexedDB for data persistence.

## Features Implemented

- ✅ Authentication system with login/register flows
- ✅ Local database implementation using IndexedDB
- ✅ Users, Sessions, Items, Files, and Notifications entities
- ✅ CRUD operations for example resource (Items)
- ✅ Auth guards and route protection
- ✅ Database initialization and setup
- ✅ REST-like API layer for mock implementations

## Structure

The app follows the template contract's three-level architecture:

### L1 - Page Components
- `src/pages/` - One per route, own data fetching and page layout

### L2 - Section Components  
- `src/components/` - Reusable sections that compose L3 elements

### L3 - Element Components
- `src/components/` - Individual UI elements with no business logic

## Database Implementation

We implement a local database layer using IndexedDB in `src/lib/db/`:

- LocalDB class with methods for all entity types
- User, Session, Item, FileObject, Notification entities
- CRUD operations for each entity
- Proper handling of soft deletes

## Authentication

Authentication is handled through:
1. `src/lib/auth.tsx` - Auth context and hooks
2. `src/lib/api/index.ts` - API client mock
3. Login and register pages in `src/pages/`

## Usage

The app includes:

```bash
# Development server (already running)
npm run dev

# Build for production  
npm run build

# Preview build
npm run preview
```

## File Structure

```
src/
├── lib/
│   ├── db/              # Local database implementation
│   ├── auth.tsx         # Authentication context
│   └── api/             # API client layer
├── pages/
│   ├── LoginPage.tsx    # Login page
│   ├── RegisterPage.tsx # Registration page  
│   ├── ItemsPage.tsx    # Example resource page (used to demonstrate DB usage)
│   └── ...              # Other app pages
├── components/          # Reusable UI elements
└── routes.ts            # App routing configuration
```# Fretlab-v2
