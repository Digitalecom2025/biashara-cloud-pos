# LeadsStacks / Biashara Cloud POS - Project Status Report

Date: 2026-06-23  
Repository: `biashara-cloud-pos`  
Stack: Next.js App Router, TypeScript, Prisma, SQLite locally, PostgreSQL-ready schema for hosted deployment

## 1. Executive Summary

LeadsStacks / Biashara Cloud POS is now a broad MVP-to-demo-stage POS platform with a public marketing site, trial signup, business dashboard, POS sales, products, customers, debtors, purchases, suppliers, warehouse, stock adjustments, transfers, branches, HRM, finance, reports, subscriptions, settings, AI-style local insights, rewards, SMS-provider readiness, PWA shell, offline sales queue, offline sync engine, and Super Admin management.

The project has moved beyond a static demo. Most core operational modules persist to Prisma-backed database tables and are scoped by `businessId`. Real trial signups create fresh clean workspaces, while demo accounts remain available for presentation. The app is credible for client demonstrations and controlled pilot onboarding, but it is not yet production-hardened for paying customers at scale.

Estimated completion:

- Demo product readiness: 90%
- Pilot readiness: 70%
- Production readiness: 55%
- Overall project completion: 68%

Primary production gaps are authentication/session hardening, server-side authorization on every API route, package-limit enforcement beyond UI locking, payment activation workflow, robust tenant isolation validation, backups/monitoring, full offline-first inventory behavior, and provider integrations for SMS, M-Pesa, eTIMS, email and WhatsApp.

## 2. Completed Modules

| Module | Status | Tested by build/lint | Production ready | Notes |
|---|---:|---:|---:|---|
| Public landing page | Implemented | Yes | Mostly | Marketing page exists at `/`; landing page no longer imports `lucide-react`; package cards show Lite/Growth/Business/Enterprise. |
| Signup / 14-day trial | Implemented | Yes | Partially | `/signup` creates Business, default Branch, OWNER user, Subscription, settings and audit log. Needs email verification and production auth session. |
| Login | Implemented | Yes | Partially | Supports demo users and real trial users through `/api/auth/login`; uses bcrypt hashes for real users. Session storage is client-side. |
| Demo role login | Implemented | Yes | Demo-only | Admin, cashier, manager, stock clerk and accountant demo accounts exist in `lib/demo-auth.ts`. |
| Super Admin | Implemented | Yes | Partially | Env-based login, token, dashboard, businesses, trials, subscriptions, suspend/extend/activate actions. Needs HttpOnly server session/RBAC. |
| Dashboard | Implemented | Yes | Partially | Real-user clean-state dashboard and trial cards exist. Needs deeper KPI validation and plan enforcement. |
| Products | Implemented | Yes | Mostly | CRUD/deactivation and database persistence. Needs barcode scanning and advanced stock by location. |
| Sales/POS checkout | Implemented | Yes | Mostly | Cart, checkout, sale persistence, sale items, payments, stock reduction, debtor update, stock movement, audit log, offline sync duplicate prevention. |
| Customers | Implemented | Yes | Mostly | Add/edit/deactivate, profile page, balances and sales/payment history. |
| Debtors | Implemented | Yes | Mostly | Debt list and payment recording. Needs aging buckets/due dates for production credit control. |
| Suppliers | Implemented | Yes | Mostly | Add/edit/deactivate, profile page and purchase history. Supplier payment model is not separate. |
| Purchases | Implemented | Yes | Mostly | Purchase creation, purchase items, stock increase, supplier balances, audit/payment records. |
| Warehouse | Implemented | Yes | Partially | Product-level warehouse view. No true per-location inventory table yet. |
| Stock adjustments | Implemented | Yes | Mostly | Adjustment creation and stock movement history. |
| Transfers | Implemented | Yes | Partially | Transfer movements are recorded; product-level stock model means no full branch-stock balancing yet. |
| Branches | Implemented | Yes | Mostly | CRUD/deactivation, branch profile and branch dashboard. Needs stronger branch-level stock/sales isolation. |
| HRM / users | Implemented | Yes | Partially | User management data exists; no production password reset, invites or advanced HR workflows. |
| Finance / expenses | Implemented | Yes | Mostly | Expense CRUD/cancel and finance summaries. Needs accounting-grade chart of accounts and reconciliation. |
| Payment types | Implemented | Yes | Mostly | Payment method settings and summaries. No payment gateway integration. |
| Tax settings | Implemented | Yes | Partially | Settings persistence exists. eTIMS and official tax workflow are placeholders. |
| Reports | Implemented | Yes | Partially | Real DB-backed reports, CSV export and previews. PDF/report scheduling still basic. |
| Party reports | Implemented | Yes | Partially | Customer/supplier report data and CSV-style export. Statement PDFs use print-friendly approach where available. |
| Subscriptions | Implemented | Yes | Partially | Plans Lite/Growth/Business/Enterprise, trial switching, package UI, usage limits. No real billing or expiry lockout enforcement yet. |
| Settings | Implemented | Yes | Mostly | Business profile, IndustryOps, receipt/system settings persist. |
| AI Assistant | Implemented | Yes | Demo/local only | Rule-based database summaries. No external AI API by design. |
| IndustryOps | Implemented | Yes | Demo-ready | Static config and dashboard/settings presentation behavior. |
| Supermarket demo | Implemented | Yes | Demo-only | Presentation page for 4-till story. |
| PWA shell | Implemented | Yes | Partially | Manifest, icons, service worker, online/offline badge. Install button removed from top bar. |
| Offline sales queue | Implemented | Yes | MVP | IndexedDB storage, device ID, simulate offline mode, Sync Center. |
| Offline sync engine | Implemented | Yes | MVP | Pending/failed sales sync to `/api/sales`, idempotency via `offlineSyncId`. |
| Rewards | Implemented | Yes | MVP | Reward rule CRUD. No automatic earning/redemption engine yet. |
| SMS marketing | Implemented | Yes | Provider-ready only | SMS status/provider structure exists. Sending disabled until credentials. |

## 3. Routes / Pages

| Route | Purpose |
|---|---|
| `/` | Public landing/marketing page for LeadsStacks POS. |
| `/login` | Sign-in page for demo users and real trial/business users. |
| `/signup` | 14-day free trial signup and package preference capture. |
| `/dashboard` | Authenticated business dashboard, trial countdown, KPIs and onboarding actions. |
| `/sales` | POS register, cart, checkout, receipt and offline-sale fallback. |
| `/products` | Product list, add/edit/deactivate products. |
| `/products/{id}` | Product profile/detail page. |
| `/customers` | Customer list, add/edit/deactivate customers. |
| `/customers/{id}` | Customer profile, statement/history/actions. |
| `/debtors` | Debtor/due list and payment recording. |
| `/purchases` | Purchases list and add purchase workflow. |
| `/suppliers` | Supplier list, add/edit/deactivate suppliers. |
| `/suppliers/{id}` | Supplier profile and purchase history. |
| `/warehouse` | Product stock/warehouse overview and stock status. |
| `/stock-adjustments` | Stock adjustment form and adjustment history. |
| `/transfer` | Stock transfer creation/history. |
| `/branches` | Branch list, add/edit/deactivate branches. |
| `/branches/{id}` | Branch profile page. |
| `/branches/{id}/dashboard` | Branch-specific KPI/dashboard page. |
| `/hrm` | Staff/user management and roles display. |
| `/finance` | Finance/expenses page and summaries. |
| `/payment-types` | Payment method settings and totals. |
| `/tax-settings` | VAT/tax/business PIN settings. |
| `/reports` | General reports with report switching and exports. |
| `/party-reports` | Customer/supplier party reports and statements. |
| `/rewards` | Reward rule management. |
| `/sms-marketing` | SMS provider/status and marketing placeholder area. |
| `/subscriptions` | Package selection, trial/package status, usage and billing history. |
| `/settings` | Business profile, IndustryOps, receipt and system preferences. |
| `/ai-assistant` | Rule-based local AI insight page using database summaries. |
| `/sync-center` | IndexedDB offline sales queue and sync controls. |
| `/offline` | PWA offline fallback page. |
| `/supermarket-demo` | Presentation page for supermarket/4-till workflow. |
| `/super-admin/login` | Internal Super Admin login. |
| `/super-admin` | Super Admin overview dashboard. |
| `/super-admin/businesses` | Super Admin businesses table/actions. |
| `/super-admin/pending-approvals` | Legacy/new signups view. Manual approval is no longer normal flow. |
| `/super-admin/trials` | Super Admin trial management. |
| `/super-admin/subscriptions` | Super Admin package/subscription management. |
| `/super-admin/suspended` | Suspended accounts. |
| `/super-admin/settings` | Super Admin operational/settings panel. |
| `/{section}` | Generic dynamic route for mapped/placeholder sections, including generated route support. |

## 4. API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/login` | Real business-user login using bcrypt password hash, status checks and subscription metadata. |
| `POST` | `/api/trial-signups` | Creates auto-approved 14-day trial Business, Branch, OWNER User, Subscription, Settings, AuditLog and DemoRequest record. |
| `PATCH` | `/api/trial-signups/package` | Switches trial package without resetting trial dates. |
| `POST` | `/api/demo-requests` | Captures public setup/demo/contact requests. |
| `POST` | `/api/admin/login` | Super Admin credential validation using env values and signed token generation. |
| `GET` | `/api/admin/businesses` | Super Admin business/trial/subscription overview data. |
| `GET` | `/api/admin/trials` | Super Admin trial list data. |
| `PATCH` | `/api/admin/businesses/{id}/approve-trial` | Legacy/manual approval action for pending accounts. |
| `PATCH` | `/api/admin/businesses/{id}/suspend` | Suspend business/subscription/users. |
| `PATCH` | `/api/admin/businesses/{id}/extend-trial` | Extend trial by selected days. |
| `PATCH` | `/api/admin/businesses/{id}/activate-package` | Mark package active/paid and set renewal/amount. |
| `PATCH` | `/api/admin/businesses/{id}/change-package` | Change package plan. |
| `PATCH` | `/api/admin/businesses/{id}/subscription` | General subscription action endpoint. |
| `GET` | `/api/business/current` | Current business profile. |
| `PATCH` | `/api/business/current` | Update current business profile. |
| `GET` | `/api/businesses` | Business listing/support endpoint. |
| `GET, POST` | `/api/products` | List/create products. |
| `PATCH, DELETE` | `/api/products/{id}` | Update/deactivate product. |
| `GET, POST` | `/api/customers` | List/create customers. |
| `PATCH, DELETE` | `/api/customers/{id}` | Update/deactivate customer. |
| `GET` | `/api/debtors` | Debtor/due-list data. |
| `GET, POST` | `/api/sales` | List/create sales. POST handles sale transaction, payment, stock reduction, debt, stock movement, audit, offline idempotency. |
| `GET` | `/api/sales/{id}` | Sale detail. |
| `GET, POST` | `/api/payments` | List/create payment records. |
| `GET, POST` | `/api/suppliers` | List/create suppliers. |
| `PATCH, DELETE` | `/api/suppliers/{id}` | Update/deactivate supplier. |
| `GET, POST` | `/api/purchases` | List/create purchases, purchase items, stock increase and supplier balance updates. |
| `GET` | `/api/purchases/{id}` | Purchase detail. |
| `GET, POST` | `/api/branches` | List/create branches. |
| `PATCH, DELETE` | `/api/branches/{id}` | Update/deactivate branch. |
| `GET, POST` | `/api/users` | List/create business users. |
| `PATCH, DELETE` | `/api/users/{id}` | Update/deactivate user. |
| `GET` | `/api/warehouse` | Warehouse/product stock view. |
| `GET, POST` | `/api/stock-adjustments` | Stock adjustment list/create. |
| `GET, POST` | `/api/transfers` | Transfer movement list/create. |
| `GET, POST` | `/api/expenses` | List/create expenses. |
| `PATCH, DELETE` | `/api/expenses/{id}` | Update/cancel expense. |
| `GET` | `/api/finance/summary` | Finance dashboard totals. |
| `GET, POST` | `/api/payment-types` | List/create payment type settings. |
| `PATCH, DELETE` | `/api/payment-types/{id}` | Update/deactivate payment type. |
| `GET, POST` | `/api/tax-settings` | Load/save tax settings. |
| `GET, PATCH` | `/api/settings` | Load/save general settings. |
| `GET` | `/api/subscriptions/current` | Current subscription, plan and usage. |
| `PATCH` | `/api/subscriptions/current` | Update selected subscription package. |
| `GET` | `/api/subscriptions/usage` | Usage limit metrics. |
| `GET` | `/api/reports/summary` | Report summary cards. |
| `GET` | `/api/reports/sales` | Sales report rows. |
| `GET` | `/api/reports/products` | Product sales report rows. |
| `GET` | `/api/reports/stock` | Stock report rows. |
| `GET` | `/api/reports/purchases` | Purchase report rows. |
| `GET` | `/api/reports/expenses` | Expense report rows. |
| `GET` | `/api/reports/payments` | Payment method report rows. |
| `GET` | `/api/reports/cashiers` | Cashier report rows. |
| `GET` | `/api/reports/branches` | Branch report rows. |
| `GET` | `/api/party-reports` | Combined customer/supplier party report data. |
| `GET` | `/api/party-reports/customers` | Customer party report data. |
| `GET` | `/api/party-reports/suppliers` | Supplier party report data. |
| `GET` | `/api/party-reports/{id}` | Party statement/detail data. |
| `GET` | `/api/ai-assistant/summary` | Rule-based local AI summary from database records. |
| `GET, POST` | `/api/reward-rules` | List/create reward rules. |
| `PATCH, DELETE` | `/api/reward-rules/{id}` | Update/delete reward rules. |
| `GET` | `/api/sms/status` | SMS provider configuration status. |

## 5. Database

### Prisma datasource

- `prisma/schema.prisma`: SQLite datasource for local development.
- `prisma/schema.postgresql.prisma`: PostgreSQL deployment schema.
- `scripts/prisma-generate.cjs` chooses PostgreSQL client generation when `DATABASE_URL` starts with `postgres://` or `postgresql://`.

### Models

| Model | Purpose |
|---|---|
| `Business` | Tenant root. Owns branches, users, products, customers, suppliers, transactions, settings, subscriptions and logs. |
| `Branch` | Business outlet/till/location. Linked to users, products, sales, expenses and stock movements. |
| `User` | Staff/owner/cashier account. Optional `passwordHash`, role, status, branch and audit/sales relations. |
| `Product` | Inventory item with code, category, prices, stock, reorder level and location fields. |
| `Customer` | Customer account, total purchases and debt balance. |
| `Supplier` | Supplier/vendor account, total purchases and payable balance. |
| `Purchase` | Supplier purchase header. |
| `PurchaseItem` | Purchased product line items. |
| `Sale` | Sale header, payment totals, offline sync metadata and relations. |
| `SaleItem` | Sold product line items. |
| `Payment` | Payment records linked to sale/customer. |
| `Expense` | Expense transaction linked to business/branch. |
| `StockMovement` | Inventory movement history for sales, purchases, adjustments, damage and transfers. |
| `AuditLog` | System/business audit records. |
| `Subscription` | Package, status, trial and renewal state for a business. |
| `Setting` | Key-value business settings. |
| `RewardRule` | Loyalty/reward rule configuration. |
| `SmsLog` | Future SMS send log/status. |
| `DemoRequest` | Public request/setup/trial interest capture. |

### Key relationships

- `Business` is the tenant boundary. Most operational models have `businessId` and cascade on business deletion.
- `Branch` belongs to `Business`; users, products, sales, expenses and stock movements can attach to a branch.
- `User` belongs to `Business` and optionally `Branch`; user is cashier for `Sale` and actor for `AuditLog`.
- `Product` belongs to `Business`, optionally `Branch`; product is referenced by `SaleItem`, `PurchaseItem`, and `StockMovement`.
- `Customer` belongs to `Business`; linked to `Sale` and `Payment`; debt balance is updated by credit sales/payments.
- `Supplier` belongs to `Business`; linked to `Purchase`; balance is updated by purchase due amounts.
- `Sale` belongs to `Business`, `Branch`, `User`, optional `Customer`; owns `SaleItem` and `Payment`.
- `Purchase` belongs to `Business` and `Supplier`; owns `PurchaseItem`.
- `Subscription`, `Setting`, `RewardRule`, `SmsLog`, `AuditLog` belong to business.

### Highlighted domains

- Tenant: `Business` is the main tenant model; data should be business-scoped.
- Subscription: `Subscription` plus duplicated business fields (`packagePlan`, `selectedPlan`, `trialPackage`, `subscriptionStatus`, dates) support trial and package workflow.
- User: `User.passwordHash` supports bcrypt login for real signup users.
- Sales: `Sale`, `SaleItem`, `Payment`, `StockMovement`, `Customer.debtBalance`, `Product.stock` work together in checkout.
- Products: `Product` tracks product identity, pricing, stock and basic warehouse placement.
- Customers: `Customer` stores balances and purchase/debt totals.
- Suppliers/purchases: `Supplier`, `Purchase`, `PurchaseItem` handle stock receiving and supplier balances.
- Payments: `Payment` stores sale/customer payments but supplier payments are not modeled separately.
- Sync: Offline sync metadata lives on `Sale` (`offlineSyncId`, `deviceId`, `syncedFromOffline`, `syncedAt`). Local queue lives in browser IndexedDB, not Prisma.

## 6. Authentication

### Current implementation

- Demo auth:
  - Hardcoded demo accounts in `lib/demo-auth.ts`.
  - Client-side localStorage session under `biashara.demoSession`.
  - Role-based sidebar filtering by allowed route list.

- Real business auth:
  - `/api/auth/login` looks up `User.email`, verifies `passwordHash` using `bcryptjs`, checks user/business/subscription status, updates `lastLoginAt`, and returns user/business/subscription payload.
  - Client stores business session in localStorage through `lib/business-session.ts`.
  - Cookie stores `biashara_business_id` and session type for server-side data helpers.

- Super Admin auth:
  - `/api/admin/login` validates `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD`.
  - Server creates HMAC token with TTL.
  - Client stores token in sessionStorage under `leadsstacks.superAdminSession`.
  - Admin API routes check `x-super-admin-token`.

### Missing production requirements

- HttpOnly, Secure, SameSite server-managed sessions or JWTs.
- CSRF strategy for state-changing requests.
- Middleware/server-side auth guard for protected routes.
- API-level authorization and RBAC on every business endpoint.
- Password reset, email verification, invite flow and account lockout.
- Rate limiting and brute-force protection.
- Audit trail for all sensitive user/admin actions.
- Strong tenant validation from authenticated server session, not client cookies/localStorage.
- Super Admin should not rely on browser sessionStorage token alone.

## 7. Offline Capabilities

### Current offline functionality

- Offline support is limited to POS sales.
- `lib/offline-sales.ts` creates an IndexedDB database `biashara-cloud-pos` with store `offline_sales`.
- Offline sale records include local ID, device ID, invoice, items, totals, payment method, status, attempts, errors and sync metadata.
- Sales/POS can save a completed sale locally when browser is offline, simulate-offline mode is enabled, or sale API is unreachable.
- Sync Center displays pending, synced and failed local sales.
- Simulate Offline Mode is stored in localStorage.

### Queue and sync implementation

- Queue statuses: `pending_sync`, `syncing`, `synced`, `failed`.
- `syncPendingOfflineSales()`:
  - Reads pending/failed records from IndexedDB.
  - Marks each as `syncing`.
  - Sends it to `POST /api/sales`.
  - Sends `offlineSyncId` and `deviceId`.
  - Marks synced records with server sale ID/invoice/synced timestamp.
  - Marks failures with error and attempt count.
- Duplicate prevention:
  - `Sale.offlineSyncId` is unique.
  - `/api/sales` can return existing sale instead of duplicating.

### Remaining offline-first work

- Offline product/customer cache with versioning.
- Local stock reservation and conflict handling.
- Branch/till sync conflict resolution.
- Offline customer creation and debtor payments.
- Offline purchase/stock adjustment support.
- Background sync API integration.
- Sync audit logs and admin visibility.
- Encrypted IndexedDB for sensitive local data.
- Device registration, revocation and per-device accountability.

## 8. PWA Status

- Manifest is implemented in `app/manifest.ts`.
- App name: `LeadsStacks POS`.
- Display mode: standalone.
- Theme/background colors configured.
- Icons exist in `public/icons`.
- Service worker exists at `public/sw.js`.
- `components/pwa-controls.tsx` registers the service worker and shows online/offline status.
- Service worker caches:
  - `/`
  - `/offline`
  - `/manifest.webmanifest`
  - app icons
  - static assets opportunistically
- Service worker avoids aggressive API caching.
- Offline fallback page exists at `/offline`.

Limitations:

- Install prompt button was removed from the top bar.
- Offline mode is shell/queue-focused, not full offline-first.
- No push notifications.
- No background sync registration.
- No app-update UX or cache version prompt.

## 9. Landing Page & Marketing

- Public homepage `/` is a LeadsStacks POS landing page with green/gold branding.
- Landing page highlights cloud POS, packages, features, IndustryOps and setup support.
- Landing page pricing uses simplified packages:
  - Lite
  - Growth
  - Business
  - Enterprise
- Premium has been removed from visible pricing.
- Landing page no longer imports `lucide-react`; icons are CSS/text badges.
- Setup/support form posts to `/api/demo-requests`.
- Signup CTA points to `/signup`.

Signup flow:

- `/signup` collects owner name, business name, phone, email, password, business type, users count, preferred package and message.
- Normal signups are auto-approved and immediately start a 14-day trial.
- Enterprise interest creates a Business trial on Business package and records Enterprise interest for Super Admin.
- Real users get a clean business workspace with only default minimum records.

## 10. Subscriptions

### Current implementation

- Plans are centralized in:
  - `lib/subscription-plans.ts`
  - `lib/package-access.ts`
- Active package set:
  - Lite
  - Growth
  - Business
  - Enterprise
- `/subscriptions` shows current plan, usage, payment history and package cards.
- Trial users can switch Lite/Growth/Business without resetting trial dates.
- Enterprise shows consultation/contact-sales behavior.
- UI feature locking exists in `AppShell`:
  - locked modules remain visible in sidebar with lock badge
  - locked pages show upgrade overview
  - actions are blocked by page replacement

### Missing items

14-day trial:

- Trial creation works.
- Countdown exists.
- Expiry handling is only partial; production-grade hard locking and notifications are not complete.

Package enforcement:

- UI locking exists.
- Server/API enforcement of plan limits is incomplete.
- User/branch/product limits are not fully enforced at create endpoints.

Payment activation:

- Super Admin can mark package active manually.
- No M-Pesa/card/bank payment confirmation integration.
- No invoices, receipts or subscription payment ledger model.

Expiry handling:

- Subscription access status helper exists.
- Expired/suspended login handling is partial.
- App-wide expired-trial blocking needs stricter policy and middleware/API checks.

## 11. Mobile App Readiness

### Capacitor/APK readiness

Readiness score: 55%

The app is PWA-capable and responsive enough for mobile web demos. It is not yet ready for a clean production Android APK without additional work.

Required before APK:

- Add Capacitor configuration and Android project.
- Confirm all pages work inside WebView.
- Replace browser-only assumptions where APK WebView differs.
- Harden offline storage behavior.
- Add native splash screen and icons.
- Add Android permissions plan.
- Test IndexedDB persistence on Android WebView.
- Add update/version strategy.
- Implement secure token storage or server session strategy.
- Test printing/PDF/download flows on Android.
- Decide whether APK uses hosted backend or bundled local/offline-first mode.

## 12. Deployment

### Vercel readiness

Vercel demo readiness: high.

Implemented:

- `DEPLOYMENT_VERCEL.md`
- `.env.example`
- `postinstall` Prisma generation script.
- PostgreSQL schema at `prisma/schema.postgresql.prisma`.
- Scripts:
  - `prisma:generate:postgres`
  - `prisma:push:postgres`
  - `prisma:seed:postgres`
- Service worker avoids API caching.

Vercel caveat:

- SQLite is not suitable for production deployment.
- PostgreSQL `DATABASE_URL` must be provided.
- Production auth/security is not yet complete.

### VPS readiness

VPS readiness: medium.

Needed:

- Node process manager such as PM2/systemd.
- PostgreSQL setup and backups.
- Reverse proxy with SSL.
- Environment secret management.
- Migration/deployment workflow.
- Logs, monitoring and error reporting.
- Scheduled backups and restore testing.

### Required environment variables

From `.env.example`:

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_DEMO_MODE`
- `NEXT_PUBLIC_APP_URL`
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`
- `NEXT_PUBLIC_SMS_ENABLED`
- `SMS_PROVIDER`
- `SMS_API_KEY`
- `SMS_USERNAME`
- `SMS_SENDER_ID`
- `NEXT_PUBLIC_SUPPORT_EMAIL`
- `NEXT_PUBLIC_SUPPORT_WHATSAPP`

Additional recommended production variables:

- `SESSION_SECRET`
- `AUTH_COOKIE_DOMAIN`
- `APP_ENV`
- `BACKUP_STORAGE_URL`
- `EMAIL_PROVIDER`
- `EMAIL_API_KEY`
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `ETIMS_*` credentials when integration begins

## 13. Security Review

### Current risks

- Client-side sessions stored in localStorage/sessionStorage.
- Business tenant context can be influenced by client cookies/session helpers.
- Many API routes need explicit authenticated server-side user verification.
- Demo accounts are hardcoded and should be disabled or isolated in production.
- Super Admin token is passed by client header and stored in sessionStorage.
- No rate limiting on login/signup/admin login.
- No CSRF protection for mutating requests.
- No email verification.
- No password reset/recovery flow.
- No formal permission engine beyond route/sidebar filtering.
- No server-enforced package limits on all create/update endpoints.
- Some mock data files remain for demo fallback behavior; ensure they are never shown to real accounts.
- SMS/M-Pesa/eTIMS/WhatsApp are not connected and should remain disabled until credential and security review.
- Audit logging exists but is not comprehensive for every sensitive action.

### Demo-only functionality to harden

- Demo login roles.
- Supermarket demo route.
- Rule-based AI assistant positioning.
- Local package activation/payment confirmation.
- Manual Super Admin subscription controls.
- IndexedDB offline queue without encrypted local data.

## 14. Remaining Work Roadmap

### Critical

1. Implement production authentication with HttpOnly cookies/server sessions.
2. Enforce tenant isolation and authorization in every API route.
3. Add API-level package and limit enforcement.
4. Complete expired/suspended subscription blocking policy.
5. Set up PostgreSQL migrations, backups and restore process.
6. Disable or isolate demo accounts in production.
7. Add rate limiting for login/signup/admin login.

### High Priority

1. Add payment activation workflow for subscriptions.
2. Add email verification and password reset.
3. Add production Super Admin RBAC and secure session.
4. Add supplier payment model and statement accuracy improvements.
5. Add true branch/location inventory model.
6. Add reporting validation and printable/PDF statements for production use.
7. Add audit logs for all destructive and financial actions.
8. Add SMS provider integration only after credential/security setup.

### Medium Priority

1. Build full offline product/customer cache and conflict handling.
2. Add device management for offline tills.
3. Add background sync support.
4. Add M-Pesa payment API integration.
5. Add eTIMS integration planning and tax invoice workflow.
6. Add Android Capacitor wrapper and mobile-specific QA.
7. Improve Super Admin analytics and client lifecycle tracking.

### Low Priority

1. Add advanced AI integrations after data/security foundation.
2. Add WhatsApp/social chats for Enterprise.
3. Add rewards automation and redemption workflows.
4. Add visual dashboards and forecasting.
5. Add export templates and branded PDF designs.

## 15. Client Demo Readiness

Score: 88 / 100

Ready for:

- Demos: Yes.
- Pilot customers: Yes, with controlled onboarding and clear expectation that auth/billing/integrations are MVP.
- Paying customers: Not yet without hardening auth, tenant isolation, backups and subscription/payment operations.
- Production scale: Not yet.

The product is strong enough to show real workflows and onboard a very controlled pilot. It should not be sold as production-grade SaaS until the critical security and operations gaps are closed.

## 16. Current Build / Stability Notes

Recent local verification before this report:

- `npm run lint` passed.
- `npm run build` passed.
- Landing page `lucide-react` stale-module crash path was fixed by removing all landing page `lucide-react` imports and clearing generated `.next/dev` cache.

Known caveats:

- Several internal POS pages still import `lucide-react`. Current reported runtime issue was landing-page-specific stale dev output, not a repository-wide Lucide removal.
- Some PowerShell route inventory commands may show dynamic routes differently than Next internally, but route files exist as listed above.

