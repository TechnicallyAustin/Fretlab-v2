# App Template Contract v1

The shared spec behind four starter templates. Any project stemmed off any template gets the same shapes, the same names, and the same flows. Stack changes; architecture does not.

| Template        | Slug           | Stack                                           |
| --------------- | -------------- | ----------------------------------------------- |
| MERN full stack | `tmpl-mern`    | React 19 + Vite, Express 5, MongoDB 7, Mongoose |
| React + Python  | `tmpl-fastapi` | React 19 + Vite, FastAPI, SQLModel, Postgres 16 |
| macOS app       | `tmpl-mac`     | SwiftUI, AppKit bridges, CoreKit package        |
| iOS app         | `tmpl-ios`     | SwiftUI, CoreKit package                        |

Templates 3 and 4 live in one workspace and share `CoreKit`.

---

## 1. The invariant

Every template ships these flows working end to end, against a real database, before it is considered done:

**Identity**

- Sign up, sign in, sign out
- Session restored on cold start, silent refresh on expiry
- Password reset request and completion
- Email verification
- Protected routes, public routes, role-gated routes

**Account**

- Read own profile
- Update own profile
- Upload and remove avatar
- Delete account

**Resource**

- One example resource (`Item`) with list, detail, create, edit, delete
- Pagination, search, sort on the list
- Optimistic update on edit, rollback on failure

**Files**

- Direct upload with progress
- Type and size validation server side
- Signed read URLs, delete

**Notifications**

- In-app list, unread count, mark read, mark all read
- Server push channel (SSE on web, APNs on Apple)
- Per-category preferences on the settings screen

**Every screen handles four states:** loading, empty, error, ready. An empty state names the action that fills it. An error state names what failed and what to do next.

---

## 2. Auth: one contract, two backends

`AUTH_MODE` selects the implementation. The frontend never learns which one is running.

```
AUTH_MODE=oidc    # Authentik, Authorization Code + PKCE
AUTH_MODE=local   # backend-issued JWT, no external IdP
```

Both modes expose the identical surface:

```
GET    /api/v1/auth/session      -> current user or 401
POST   /api/v1/auth/login        -> local: credentials.  oidc: returns authorize URL
GET    /api/v1/auth/callback     -> oidc only, exchanges code, sets session
POST   /api/v1/auth/refresh      -> rotates, both modes
POST   /api/v1/auth/logout       -> clears session, oidc also hits end_session
POST   /api/v1/auth/register     -> local only, 404 under oidc
POST   /api/v1/auth/password/reset
POST   /api/v1/auth/password/reset/confirm
POST   /api/v1/auth/verify/resend
GET    /api/v1/auth/verify/:token
```

**Token handling on web.** The backend is the confidential client. Access and refresh tokens stay server side; the browser holds an httpOnly, SameSite=Lax session cookie. No tokens in `localStorage`, ever. This keeps the two modes symmetric and keeps XSS from being an account takeover.

**Token handling on Apple.** `ASWebAuthenticationSession` for the OIDC leg, tokens in Keychain with `kSecAttrAccessibleAfterFirstUnlock`. Refresh happens in `AuthController`, never at a call site.

**Roles.** A `role` claim resolved from Authentik groups under OIDC, from the `users.role` column under local. Values: `owner`, `admin`, `member`. Route guards read the resolved role, not the raw claim.

**Why the fallback matters.** A template that hard-requires Authentik cannot be handed to anyone, demoed off the network, or run in CI. `AUTH_MODE=local` is the portable default; `oidc` is what production uses.

---

## 3. Wire format

Base path `/api/v1`. JSON only. UTC ISO-8601 timestamps.

**Error envelope, every failure, no exceptions:**

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Display name must be under 64 characters.",
    "field": "display_name",
    "request_id": "01J8..."
  }
}
```

`code` is a stable machine string the client switches on. `message` is user-facing copy written per the rules in §7. `request_id` matches the server log line.

**Collection envelope:**

```json
{
  "data": [ ... ],
  "page": { "limit": 25, "offset": 0, "total": 184 }
}
```

**Status codes:** 200 read, 201 create, 204 delete, 400 malformed, 401 unauthenticated, 403 unauthorized, 404 missing, 409 conflict, 422 validation, 429 throttled.

Every mutating request carries `Idempotency-Key`. Every response carries `X-Request-Id`.

---

## 4. Data model baseline

Five entities, identical fields across Mongoose, SQLModel, and Core Data. Field names are snake_case on the wire in all four templates, including MERN. Consistency beats each ecosystem's habit.

**User** — `id`, `email`, `email_verified_at`, `display_name`, `avatar_file_id`, `role`, `external_id` (OIDC subject, null under local), `password_hash` (local only), `created_at`, `updated_at`, `deleted_at`

**Session** — `id`, `user_id`, `refresh_token_hash`, `user_agent`, `ip`, `expires_at`, `revoked_at`, `created_at`

**Item** — `id`, `owner_id`, `title`, `body`, `status` (`draft` | `active` | `archived`), `tags[]`, `created_at`, `updated_at`, `deleted_at`

**FileObject** — `id`, `owner_id`, `bucket_key`, `filename`, `content_type`, `bytes`, `checksum`, `created_at`

**Notification** — `id`, `user_id`, `category`, `title`, `body`, `link`, `read_at`, `created_at`

Soft delete via `deleted_at` on User and Item. Hard delete on Session and FileObject.

`Item` exists to be renamed. It is the seam where a real project starts: rename the entity, keep every wire, and the app still runs.

---

## 5. Frontend architecture law

Three levels, enforced by lint rules rather than discipline.

### L1 — Page

One per route. Owns data fetching, URL and query state, page-level layout, and error boundaries. Composes L2 sections and passes them data. Contains no primitive styling and no business logic beyond assembling props.

### L2 — Section

A coherent region of a page. Composes L3 elements. Receives data through props, owns only local interaction state (open, hovered, selected, draft input). Never fetches. Never reads the router.

### L3 — Element

Single purpose. Props in, events out. Pure presentation. May import HeroUI and other L3 elements. May not import the API client, the auth store, the router, or anything from L1 or L2. If an element needs data, its parent is wrong.

### Directory shape

```
src/
  pages/
    Dashboard/
      DashboardPage.tsx           L1
      sections/
        StatsSection.tsx          L2
        ActivityFeedSection.tsx   L2
      elements/
        StatTile.tsx              L3, page-local
  components/                     L3, shared
    Avatar.tsx
    EmptyState.tsx
    FieldError.tsx
  lib/
    api/                          typed client, one file per resource
    auth/                         session hook, guards
    hooks/
  theme/
```

**Promotion rule.** An element starts page-local. The moment a second page needs it, move it to `components/` in that same commit. Nothing lands in `components/` speculatively.

### Dependency direction

```
L1  ->  L2  ->  L3
L1  ->  lib/*
L2  ->  L3 only
L3  ->  L3 and HeroUI only
```

Enforced with `eslint-plugin-boundaries`. The rule is in the template; a violating import fails the build.

### Sizing guidance

An L1 file over ~150 lines is holding a section it should have extracted. An L3 file with a `useEffect` that talks to anything outside itself is an L2 in disguise.

---

## 6. HeroUI and theming

HeroUI v3, React 19, Tailwind CSS v4.

```bash
npm i @heroui/styles @heroui/react
```

```css
/* order matters */
@import "tailwindcss";
@import "@heroui/styles";
```

v3 needs no provider wrapper. Its compound API (`Card.Header`, `Card.Title`, `Card.Content`) is the L2/L3 boundary made literal: a section arranges the compound parts, an element is a configured leaf. v2 is on its way out, so both web templates start on v3.

**Theme tokens.** HeroUI semantic tokens are remapped to Bloom DS v2 dark values in `theme/heroui.css`, so a stemmed project looks like your work rather than default HeroUI. Components consume semantic names only. No raw hex in a component file.

| Semantic          | Value                    |
| ----------------- | ------------------------ |
| background        | `#060A10`                |
| surface           | `rgba(22,27,34,0.6)`     |
| surface-raised    | `#090D13`                |
| border            | `rgba(255,255,255,0.07)` |
| foreground        | `#E6EDF3`                |
| foreground-muted  | `#8B949E`                |
| foreground-subtle | `#6E7681`                |
| primary           | `#1F5C99`                |
| success           | `#3FB950`                |
| warning           | `#D29922`                |

Type: IBM Plex Sans for UI, IBM Plex Mono for identifiers, ports, hashes, and code.

The same table lives in `CoreKit/Theme.swift` as a `Theme` struct so the Apple apps read from one source of truth. When a token changes, it changes in two files and nowhere else.

**Responsive.** Single breakpoint set across both web templates: `sm 640 / md 768 / lg 1024 / xl 1280`. Layout shells are mobile first. The sidebar collapses to a bottom bar under `md`.

---

## 7. Interface copy rules

- Buttons name the outcome: "Save changes", not "Submit". The confirmation reuses the verb: "Changes saved".
- Errors state what happened and the next move. They do not apologize and they are never vague.
- Empty states are invitations, not shrugs. "No items yet. Create your first one."
- Sentence case throughout. No all-caps labels.
- No em dashes in any shipped copy.
- Name things the way a user would: "Notifications", not "Webhook config".

---

## 8. Apple workspace

```
app-templates-apple/
  project.yml                 XcodeGen, generates both targets
  Packages/
    CoreKit/
      Sources/CoreKit/
        Models/               mirrors §4 exactly
        Networking/           APIClient, Endpoint, ErrorEnvelope
        Auth/                 AuthController, KeychainStore, OIDCSession
        Uploads/              UploadTask, progress
        Notifications/        APNs registration, inbox store
        Theme/                Theme.swift, typography, spacing
      Tests/
  Apps/
    MacApp/                   Sources/, Resources/, Info.plist
    iOSApp/                   Sources/, Resources/, Info.plist
```

`xcodegen generate` produces the `.xcworkspace`. The project file is generated, never committed, which keeps merge conflicts out of it.

The three-level law holds on the Swift side too: `DashboardScreen` (L1) → `StatsSection` (L2) → `StatTile` (L3). L1 owns the `@StateObject` view models. L3 views take plain values and closures, no environment objects.

**Where the platforms diverge:** navigation (`NavigationSplitView` on macOS, `TabView` on iOS), window and scene handling, menu bar commands, keyboard shortcuts, file pickers. Everything else is shared. If platform-specific code appears outside those areas, it is a bug in the abstraction.

---

## 9. Definition of done

A template is not finished until all of these are true.

- [ ] `cp .env.example .env && docker compose up -d` produces a working app, no manual steps
- [ ] `AUTH_MODE=local` works with no external services running
- [ ] `AUTH_MODE=oidc` works against Authentik
- [ ] Seed script creates one owner, one member, twelve items, three notifications
- [ ] Every §1 flow demonstrable in the running app
- [ ] Boundary lint passes; a deliberate L3-imports-API violation fails the build
- [ ] Tests: auth flows, one CRUD round trip, one upload, error envelope shape
- [ ] Responsive from 375px to 1920px with no horizontal scroll
- [ ] Keyboard reachable, visible focus rings, `prefers-reduced-motion` respected
- [ ] README documents every env var and the rename-`Item` starting procedure
- [ ] Health endpoint, structured logs with request ids
- [ ] Deploys to Lab-v2: compose file, Traefik labels, `*.platform.local` hostname

---

## 10. Build order

1. **`tmpl-fastapi` first.** It is closest to the FretLab pattern already running, so it becomes the reference implementation. Everything ambiguous in this document gets resolved by reading its code.
2. **`tmpl-mern` second**, built to match `tmpl-fastapi` endpoint for endpoint. If a flow feels different in MERN, the contract is underspecified and gets amended here rather than forked.
3. **Apple workspace third.** `CoreKit` is written against the finished API contract, then both app targets on top of it.

Amend this document before amending a template. The contract is the product; the templates are four implementations of it.
