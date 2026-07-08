# MOOV OS System Overview

## 1. System Positioning

MOOV OS is a logistics operating system prototype for managing international supply chain execution. The current prototype focuses on P1 capabilities: user and permission management, master data foundations, purchase order execution, workflow configuration, task visibility, exception handling, automation placeholders, and reporting placeholders.

The system is designed as an operational workspace rather than a marketing site. Users enter directly into a dashboard and navigate through a collapsible left sidebar. The interface prioritizes dense but readable tables, consistent CRUD behavior, and clear separation between main record fields and detailed sub information.

## 2. Application Architecture

The frontend is a React and TypeScript single page application built with Vite. State is currently stored in a local mock store, with structures prepared for later backend integration.

Core layers:

- Application shell: top navigation, collapsible left sidebar, language switcher, avatar menu, and page renderer.
- Page catalog: defines module groups, page IDs, labels, icons, and page types.
- Access control: calculates effective functional permissions from roles and effective data scope from organizations.
- Master data schema layer: defines fields, validations, primary IDs, and Main/Sub display levels for master data modules.
- Shared page components: reusable table, column filter, drawer form, confirmation dialog, and master data entity page.
- Mock data store: provides sample users, roles, organizations, data scopes, master data, PO data, workflow rules, and audit entries.

## 3. Navigation And Module Structure

Main module groups:

- System Management: IAM, workflow configuration, system configuration, audit log, file foundation.
- Master Data Center: Client, Business Partner, Carrier, Location, SKU, Equipment, Vessel/Voyage.
- Business Execution Center: PO Management, Space Allocation, Shipment/Booking Detail.
- Task Workbench: My Tasks, Team Tasks, SLA View, Manual Assignment.
- Exception And Quality: Exception Management, Exception SLA, Data Validation, Quality Check.
- Automation And Notification: Auto Validation, Email Template, Notification Record, RPA Reserved.
- Reports And Dashboards: Task Dashboard, Exception Dashboard, Workload Dashboard, Export Reserved.

The sidebar supports expanded and collapsed modes. The sidebar menu scrolls independently inside the viewport so all modules remain reachable on smaller screens.

## 4. UI And Interaction Standards

The application follows the MOOV brand palette:

- Primary blue: `#004F7C`
- Accent orange: `#FE5000`
- Page background: light operational gray
- Cards and table surfaces: white with subtle borders

Current layout standard:

- The post-login application uses natural page-level vertical scrolling.
- The top navigation bar is sticky so users keep context while scrolling.
- Wide tables use horizontal scrolling inside the table wrapper.
- The left sidebar menu has a thin, low-contrast scrollbar suitable for the dark blue background.
- Global scrollbars are thin and visible without becoming visually heavy.

Master data list pattern:

- Page header contains breadcrumb, title, description, and page-level actions.
- Table columns show only fields marked as `Main`.
- Each record has an expand arrow when `Sub` fields exist.
- Expanded rows display sub information in a structured detail grid.
- Table header filters use per-column dropdown search and multi-select.
- Top-level search boxes are not used on master data pages.

## 5. Master Data Model

The current master data center contains seven main pages:

- Client
- Business Partner
- Carrier
- Location
- SKU
- Equipment
- Vessel/Voyage

Vessel/Voyage is presented as one sidebar page with two tabs:

- Vessel: static vessel profile data.
- Voyage: frequently changing voyage schedule and status data.

Each master data module is schema-driven. The schema defines:

- Field key
- Field label
- Data type
- Required flag
- Primary key flag
- Add validation rule
- Edit validation rule
- Sample value
- UI display level: `Main` or `Sub`

Primary IDs are system-generated identifiers and are required for all records. Existing sample data has been filled with primary IDs and clean Main-field sample values so tables do not show empty primary key cells.

## 6. Permissions And Data Scope

The permission model uses two layers:

- Role controls functional access.
- Organization controls data access.

Functional permissions are calculated from all user roles as a union. Page visibility and page actions are based on View/Add/Modify/Delete permissions.

Data scope is calculated from all user organizations as a union. The first implementation supports client, country, and region scope. Admin users have full functional access and full data scope.

IAM Organization is source-agnostic. It supports manual groups in P1 and reserves fields for future organization-system integration, including source system, external organization ID, and sync status.

## 7. Current Data And Prototype Behavior

The current prototype uses local sample data for:

- Demo login accounts
- IAM users, roles, organizations, and data scopes
- Master data modules
- Purchase orders and PO detail tabs
- Workflow templates and milestone configuration
- Assignment rules and basic config
- Audit/session/login-history foundations

The local store is versioned. When the data structure changes significantly, the state version is increased so the browser refreshes to the new default sample data.

## 8. Backend Readiness

The prototype includes Supabase type definitions and SQL migrations for selected backend structures. The master data pages are still using the local mock store, but the UI is organized so a future backend adapter can replace local state without redesigning the pages.

Planned backend direction:

- Keep master schemas aligned with database tables.
- Enforce required fields and uniqueness server-side.
- Persist role permissions as JSONB.
- Persist IAM organizations and organization data scopes.
- Standardize country/region configuration for reliable data-scope filtering.

## 9. Known Prototype Boundaries

The current system is a UI/UX and workflow prototype. Some functions are intentionally reserved:

- External customer, supplier, and OHA login are not enabled in P1.
- Field-level permissions are not implemented.
- Some automation, report, and shipment pages are placeholders.
- Import/export is UI-level for some modules and may need backend integration later.
- URL query persistence for table state is not fully implemented yet.

## 10. Acceptance Snapshot

The current target behavior is:

- Users can navigate all modules from the sidebar.
- Sidebar and page scrolling behave naturally across common desktop viewports.
- Master data tables show clean Main fields and expandable Sub details.
- All sample master data records have system primary IDs.
- Role and organization access concepts are visible in IAM and ready for backend extension.
- The UI remains consistent with MOOV OS prototype standards.
