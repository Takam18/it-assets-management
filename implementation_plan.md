# IT Asset Management System — Implementation Plan

A comprehensive, responsive, and scalable web application to track the full lifecycle of IT assets — from procurement through assignment, maintenance, and retirement.

## Tech Stack

| Layer | Technology | Rationale |
|:---|:---|:---|
| **Framework** | Next.js 15 (App Router) | Server Components, file-based routing, API routes |
| **Language** | TypeScript | End-to-end type safety for complex entity relationships |
| **ORM** | Prisma | Type-safe schema, migrations, seeding |
| **Database** | PostgreSQL | Enterprise-grade, supports native ENUMs, full concurrency |
| **Styling** | Vanilla CSS | Full control over dark glassmorphism design system |
| **Validation** | Zod | Runtime validation for all form inputs |

## Design System

**Theme: Dark Glassmorphism with Bento Grid Layout**

- **Background**: Deep gradient mesh (dark navy → indigo → purple)
- **Cards**: Semi-transparent glass panels (`rgba(255,255,255,0.06)`) with `backdrop-filter: blur(12px)` and 1px subtle borders
- **Typography**: Google Font — **Inter** (clean, modern, highly readable)
- **Colors**: Curated palette using HSL — cyan accents for primary actions, amber for warnings, rose for danger, emerald for success
- **Animations**: Subtle fade-ins, hover lifts, smooth transitions on all interactive elements
- **Layout**: Responsive sidebar + main content area with bento-style card grids

---

## User Review Required

> [!IMPORTANT]
> **No Authentication**: This plan does not include user authentication/authorization. The system is built as an internal tool accessible by all. If you need role-based access, let me know and I'll add Auth.js.

> [!IMPORTANT]
> **PostgreSQL**: The database is PostgreSQL. You'll need a running PostgreSQL instance (local or hosted via Supabase/Neon/Railway). Set the `DATABASE_URL` in `.env`. The schema maps your SQL 1:1 using Prisma syntax with native PostgreSQL ENUMs.

---

## Open Questions

1. **Search & Filtering**: Should the asset list support full-text search across all fields, or is column-based filtering sufficient for v1?
2. **Export**: Do you need CSV/PDF export functionality for asset reports?
3. **Notifications**: Should the system alert when warranties are about to expire or assets are overdue for return?

These are non-blocking — I'll proceed with a solid default (column filters, no export, no notifications) and we can add them later.

---

## Proposed Changes

### 1. Project Scaffolding

#### [NEW] Project initialization via `create-next-app`
- Initialize Next.js 15 with TypeScript, App Router, ESLint
- Install dependencies: `prisma`, `@prisma/client`, `zod`
- Configure `next.config.ts` for the project

---

### 2. Database Layer (Prisma)

#### [NEW] [schema.prisma](file:///c:/Users/takam/.gemini/antigravity-ide/scratch/IT-Assets-Management/prisma/schema.prisma)

All 8 tables from your SQL schema, translated to Prisma:

| SQL Table | Prisma Model | Key Fields |
|:---|:---|:---|
| `Locations` | `Location` | `id`, `siteName`, `address`, `city`, `country` |
| `Departments` | `Department` | `id`, `departmentName`, `managerId` |
| `Employees` | `Employee` | `id`, `firstName`, `lastName`, `email`, `status` |
| `Vendors` | `Vendor` | `id`, `vendorName`, `contactName`, `contactEmail`, `supportPhone` |
| `AssetCategories` | `AssetCategory` | `id`, `categoryName`, `description` |
| `Assets` | `Asset` | `id`, `assetTag`, `serialNumber`, `computerName`, `model`, `status`, `purchaseCost`, etc. |
| `AssetAssignments` | `AssetAssignment` | `id`, `assetId`, `employeeId`, `assignedDate`, `returnDate`, etc. |
| `MaintenanceLogs` | `MaintenanceLog` | `id`, `assetId`, `serviceDate`, `serviceType`, `cost`, etc. |

- All foreign key relationships preserved
- Enums defined: `EmployeeStatus`, `AssetStatus`, `ServiceType`
- Timestamps: `createdAt` on all tables

#### [NEW] [seed.ts](file:///c:/Users/takam/.gemini/antigravity-ide/scratch/IT-Assets-Management/prisma/seed.ts)
- Realistic seed data: 3 locations, 4 departments, 12 employees, 5 vendors, 6 categories, 20+ assets, assignments, and maintenance logs
- Enables a fully populated demo on first run

#### [NEW] [db.ts](file:///c:/Users/takam/.gemini/antigravity-ide/scratch/IT-Assets-Management/src/lib/db.ts)
- Singleton Prisma client instance (prevents hot-reload connection leaks in development)

---

### 3. Validation Layer

#### [NEW] [validations.ts](file:///c:/Users/takam/.gemini/antigravity-ide/scratch/IT-Assets-Management/src/lib/validations.ts)
- Zod schemas for every entity: `LocationSchema`, `DepartmentSchema`, `EmployeeSchema`, `VendorSchema`, `AssetCategorySchema`, `AssetSchema`, `AssignmentSchema`, `MaintenanceLogSchema`
- Used for both client-side form validation and server action validation

---

### 4. Server Actions (API Layer)

Each entity gets a dedicated actions file with full CRUD operations.

#### [NEW] [src/actions/](file:///c:/Users/takam/.gemini/antigravity-ide/scratch/IT-Assets-Management/src/actions/)

| File | Operations |
|:---|:---|
| `locations.ts` | `getLocations`, `getLocation`, `createLocation`, `updateLocation`, `deleteLocation` |
| `departments.ts` | `getDepartments`, `getDepartment`, `createDepartment`, `updateDepartment`, `deleteDepartment` |
| `employees.ts` | `getEmployees`, `getEmployee`, `createEmployee`, `updateEmployee`, `deleteEmployee` |
| `vendors.ts` | `getVendors`, `getVendor`, `createVendor`, `updateVendor`, `deleteVendor` |
| `categories.ts` | `getCategories`, `getCategory`, `createCategory`, `updateCategory`, `deleteCategory` |
| `assets.ts` | `getAssets`, `getAsset`, `createAsset`, `updateAsset`, `deleteAsset`, `getAssetStats` |
| `assignments.ts` | `getAssignments`, `createAssignment`, `returnAsset` (check-in flow) |
| `maintenance.ts` | `getMaintenanceLogs`, `createMaintenanceLog` |

---

### 5. Design System & Global Styles

#### [NEW] [globals.css](file:///c:/Users/takam/.gemini/antigravity-ide/scratch/IT-Assets-Management/src/app/globals.css)

Complete design system with CSS custom properties:

```css
/* Color tokens, glass effects, typography, spacing, 
   animations, responsive breakpoints, component styles */
:root {
  --bg-primary: hsl(230, 25%, 8%);
  --bg-glass: rgba(255, 255, 255, 0.06);
  --glass-border: rgba(255, 255, 255, 0.1);
  --accent-cyan: hsl(190, 95%, 55%);
  --accent-emerald: hsl(160, 80%, 50%);
  --accent-amber: hsl(38, 95%, 55%);
  --accent-rose: hsl(350, 85%, 60%);
  /* ... 40+ design tokens */
}
```

---

### 6. Layout & Navigation

#### [NEW] [layout.tsx](file:///c:/Users/takam/.gemini/antigravity-ide/scratch/IT-Assets-Management/src/app/layout.tsx)
- Root layout with Inter font from Google Fonts
- SEO meta tags, viewport config
- Imports global CSS

#### [NEW] [Sidebar component](file:///c:/Users/takam/.gemini/antigravity-ide/scratch/IT-Assets-Management/src/components/Sidebar.tsx)
- Glassmorphic sidebar navigation
- Links: Dashboard, Assets, Employees, Assignments, Maintenance, Vendors, Locations, Departments, Categories
- Active route highlighting
- Collapsible on mobile (hamburger menu)

#### [NEW] [Header component](file:///c:/Users/takam/.gemini/antigravity-ide/scratch/IT-Assets-Management/src/components/Header.tsx)
- Page title + breadcrumbs
- Quick search bar
- Summary stats strip

---

### 7. Pages & Features

#### Dashboard (`/`)

#### [NEW] [src/app/page.tsx](file:///c:/Users/takam/.gemini/antigravity-ide/scratch/IT-Assets-Management/src/app/page.tsx)

**Bento grid dashboard with:**
- **KPI Cards**: Total Assets, Available, Assigned, In Repair, Retired
- **Asset Status Distribution**: Visual breakdown by status (colored bars/donuts)
- **Recent Assignments**: Latest 5 check-outs/check-ins
- **Warranty Alerts**: Assets with warranties expiring in 30 days
- **Assets by Category**: Breakdown chart
- **Recent Maintenance**: Latest 5 logs

---

#### Assets Module (`/assets`)

| Page | Path | Description |
|:---|:---|:---|
| [NEW] List | `/assets/page.tsx` | Filterable, sortable table with status badges, search |
| [NEW] Detail | `/assets/[id]/page.tsx` | Full asset profile: specs, assignment history, maintenance timeline |
| [NEW] Create | `/assets/new/page.tsx` | Multi-field form with dropdowns for category, vendor, location |
| [NEW] Edit | `/assets/[id]/edit/page.tsx` | Pre-filled edit form |

---

#### Employees Module (`/employees`)

| Page | Path | Description |
|:---|:---|:---|
| [NEW] List | `/employees/page.tsx` | Employee directory with department/location filters |
| [NEW] Detail | `/employees/[id]/page.tsx` | Employee profile with assigned assets list |
| [NEW] Create | `/employees/new/page.tsx` | Create employee form |
| [NEW] Edit | `/employees/[id]/edit/page.tsx` | Edit employee form |

---

#### Assignments Module (`/assignments`)

| Page | Path | Description |
|:---|:---|:---|
| [NEW] List | `/assignments/page.tsx` | Assignment history with active/returned tabs |
| [NEW] Assign | `/assignments/new/page.tsx` | Check-out form: select asset + employee |
| [NEW] Return | `/assignments/[id]/return/page.tsx` | Check-in form: condition notes, actual return date |

---

#### Maintenance Module (`/maintenance`)

| Page | Path | Description |
|:---|:---|:---|
| [NEW] List | `/maintenance/page.tsx` | Maintenance log timeline |
| [NEW] Create | `/maintenance/new/page.tsx` | Log new maintenance: repair, upgrade, audit |

---

#### Reference Data Modules

| Module | Path | Pages |
|:---|:---|:---|
| Vendors | `/vendors` | List, Create, Edit |
| Locations | `/locations` | List, Create, Edit |
| Departments | `/departments` | List, Create, Edit |
| Categories | `/categories` | List, Create, Edit |

---

### 8. Shared UI Components

#### [NEW] [src/components/](file:///c:/Users/takam/.gemini/antigravity-ide/scratch/IT-Assets-Management/src/components/)

| Component | Purpose |
|:---|:---|
| `DataTable.tsx` | Reusable table with sorting, search, pagination |
| `StatusBadge.tsx` | Color-coded status pills (Available=cyan, Assigned=amber, etc.) |
| `GlassCard.tsx` | Reusable glassmorphic card wrapper |
| `FormField.tsx` | Styled input/select/textarea with error states |
| `Modal.tsx` | Confirmation dialogs (delete, etc.) |
| `KPICard.tsx` | Dashboard metric card with icon + trend |
| `EmptyState.tsx` | Friendly empty state illustration |
| `Toast.tsx` | Success/error notification toasts |
| `Pagination.tsx` | Page navigation for tables |

---

## File Structure Overview

```
IT-Assets-Management/
├── prisma/
│   ├── schema.prisma          # Database schema (8 models)
│   └── seed.ts                # Seed data
├── src/
│   ├── app/
│   │   ├── globals.css        # Design system + global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Dashboard
│   │   ├── assets/
│   │   │   ├── page.tsx       # Asset list
│   │   │   ├── new/page.tsx   # Create asset
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # Asset detail
│   │   │       └── edit/page.tsx
│   │   ├── employees/         # Same CRUD structure
│   │   ├── assignments/       # Assign + return flows
│   │   ├── maintenance/       # Log + list
│   │   ├── vendors/           # CRUD
│   │   ├── locations/         # CRUD
│   │   ├── departments/       # CRUD
│   │   └── categories/        # CRUD
│   ├── actions/               # Server actions (CRUD per entity)
│   ├── components/            # Shared UI components
│   └── lib/
│       ├── db.ts              # Prisma singleton
│       └── validations.ts     # Zod schemas
├── public/
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## Verification Plan

### Automated Tests

1. **Database**: Run `npx prisma db push` + `npx prisma db seed` — verify all tables created and data inserted
2. **Build**: Run `npm run build` — verify zero TypeScript/build errors
3. **Dev Server**: Run `npm run dev` — verify app loads at `http://localhost:3000`

### Manual Verification

1. **Dashboard**: Verify all KPI cards show correct counts from seed data
2. **Assets CRUD**: Create, edit, view, and delete an asset
3. **Assignment Flow**: Assign an asset to an employee → verify asset status changes to "Assigned" → return asset → verify status reverts to "Available"
4. **Maintenance**: Log a maintenance entry → verify it appears on the asset detail page
5. **Responsive**: Test on mobile viewport (375px) — sidebar collapses, tables scroll horizontally, forms stack vertically
6. **Reference Data**: Verify all CRUD operations for Vendors, Locations, Departments, Categories

---

## Estimated Scope

- **~50 files** across schema, actions, components, pages, and styles
- **8 database models** with full relational integrity
- **9 route groups** with CRUD pages
- **9 reusable UI components**
- **1 comprehensive design system**
