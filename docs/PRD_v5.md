## **Product Requirements Document** 

Scalable POS & Inventory Management Platform for Hotels & Restaurants 

## **Version 5.0** 

Date 2026-07-06 Status For evaluation / implementation 

## **Changes in v5** 

Introduces four new capability areas on top of v2's foundation: expanded Authentication & Security (self-service password recovery, change password, brute-force account lockout); richer Product Management (categories, size variants, combo meals); expanded Inventory & Procurement (supplier records, inter-branch stock transfer, damage/wastage adjustment); a more flexible POS/Billing flow (hold & resume, split bills, multiple payment methods per bill); a new Customer Management module (profiles and purchase history); and two new management reports (Sales by Payment Method, Cashier Performance). RBAC, data model, and architecture are revised throughout so every new feature is properly scoped, permissioned, and audited. 

## **Changes Summary (v2** → **v5)** 

|**Module**|**Existing (v2)**|**New in v5**|**Why It Adds Value**|
|---|---|---|---|
|Authentication &<br>Security|Login, Logout, JWT Auth,<br>Secure Sessions, Session<br>Expiry|Forgot Password, Change<br>Password, Account Lockout (5<br>attempts / 15 min)|Improves account recovery,<br>strengthens security, protects<br>against brute-force attacks.|
|Role-Based Access<br>Control|Super Admin, Admin, Cashier,<br>Ingredient Access Override|New capabilities mapped onto<br>existing 3 roles; no new roles added|Existing RBAC is extended, not<br>redesigned — avoids role bloat.|
|Product<br>Management|Product / Menu CRUD|Product Categories, Product<br>Variants (S/M/L), Combo Meals|Better menu organization, easier<br>billing, supports promotions.|
|Inventory<br>Management|Product & Ingredient<br>Inventory, Auto Deduction,<br>Low Stock Alerts|Supplier Management, Stock<br>Transfer Between Branches, Stock<br>Adjustment (Damage/Wastage)|Improves procurement, inventory<br>accuracy, and operational<br>efficiency.|
|Branch<br>Management|Multi-Branch Support, Branch<br>Scoping|Stock Transfer Between Branches<br>(shared with Inventory)|Balances inventory across<br>branches, reduces unnecessary<br>purchases.|
|POS / Billing|Cart, Billing, Discounts,<br>Receipt Generation|Hold & Resume Orders, Split Bills,<br>Multiple Payment Methods in One<br>Bill|Supports common restaurant<br>billing scenarios; improves<br>convenience.|
|Payments|Record Cash, Card, UPI<br>Payments|Multiple payment methods recorded<br>against a single bill|Customers can split payment<br>across cash, card, and UPI.|
|Customer<br>Management|Not available|Customer Profiles, Customer<br>Purchase History|Better service; foundation for a<br>future loyalty program.|
|Reporting &<br>Analytics|Sales Summary, Top Selling<br>Items, Low Stock Report|Sales by Payment Method, Cashier<br>Performance Report|Gives owners better financial and<br>staff-performance insight.|



POS & Inventory Management Platform — PRD v5.0 

Page 1 

|**Module**|**Existing (v2)**|**New in v5**|**Why It Adds Value**|
|---|---|---|---|
|Kitchen Ingredients<br>/ RBAC / User<br>Mgmt / Audit Log /<br>Architecture|As in v2|No structural changes|Already comprehensive; new<br>features layer on cleanly.|



POS & Inventory Management Platform — PRD v5.0 

Page 2 

## **1. Purpose & Background** 

Hotels and restaurants need a single system to take orders, generate bills, track inventory, manage procurement and staff, and run multiple branches — while controlling who can do what. This document defines a focused, production-grade slice of such a platform, extended in v5 with account-recovery security, richer product modeling, supplier and inter-branch stock operations, flexible billing, and lightweight customer tracking. 

The platform follows proven POS patterns — multi-outlet billing, role-based staff access, live stock deduction on sale, and now supplier-backed procurement and customer relationship basics. We deliberately scope the build so that everything described here is actually implemented and demonstrable, not aspirational. 

_**Guiding principle:** Everything documented here is built. Nothing is built that isn't documented._ 

## **2. Scope** 

## **2.1 In Scope (built)** 

- G[Authentication with secure sessions (JWT in http-only cookies) and proper logout.] 

- G **[[New]]**[ Forgot Password (time-limited, single-use reset token) and Change Password (requires current password).] 

- G **[[New]]**[ Account Lockout after 5 consecutive failed login attempts, for 15 minutes; every lock/unlock is audited.] 

- G[Role-Based Access Control with exactly 3 roles: SUPER_ADMIN, ADMIN, CASHIER.] 

- G[Route protection on both frontend and backend — no privilege escalation via URL or browser back button.] 

- G[Multi-branch support; users and inventory scoped to branches.] 

- G[Product / menu catalog management.] 

- G **[[New]]**[ Product Categories, Product Variants (Small/Medium/Large, each with its own price & stock), and Combo] Meals (bundled products/variants at a special price). 

- G[Inventory with automatic stock deduction on sale and low-stock alerts.] 

- G **[[New]]**[ Supplier Management — maintain supplier records linked to products/ingredients.] 

- G **[[New]]**[ Stock Transfer Between Branches — request, approve, and complete inter-branch stock movement,] atomically and audited. 

- G **[[New]]**[ Stock Adjustment for Damage/Wastage — reason-coded stock write-off, audited.] 

- G[POS billing flow: cart ][→][ order ][→][ bill ][→][ payment ][→][ receipt.] 

- G **[[New]]**[ Hold & Resume Orders — park an in-progress cart and resume it later without data loss.] 

- G **[[New]]**[ Split Bills and Multiple Payment Methods in one bill (e.g. part cash, part card).] 

- G[Kitchen Ingredients management — track raw kitchen supplies (Sugar, Milk, Fruits, etc.) separately from sellable] products, with access controlled by a per-user toggle. 

- G **[[New]]**[ Customer Management — lightweight Customer Profiles and Customer Purchase History linked to orders.] 

- G[Reporting dashboard (sales summary, top items, low stock) and an audit log.] 

- G **[[New]]**[ Sales by Payment Method and Cashier Performance reports.] 

## **2.2 Out of Scope** 

- G[Customer-facing online ordering (Swiggy/Zomato style), KDS, reservations.] 

POS & Inventory Management Platform — PRD v5.0 

Page 3 

- G[Loyalty programs and rewards — Customer Profiles/Purchase History (new in v5) lay the groundwork but no] points/rewards engine is built. 

- G[Payment gateway integration — payments (including split/multiple methods) are recorded, not processed.] 

- G[Native mobile apps (responsive web only); more than 3 roles.] 

- G[Outbound transactional email/SMS delivery for password reset — the reset token/link is generated and validated by] the API; actual delivery uses a stubbed/logged notifier for the demo rather than a production email service. 

POS & Inventory Management Platform — PRD v5.0 

Page 4 

## **3. Assumptions & Decisions** 

|**#**|**Assumption / Decision**|**Reasoning / Tradeoff**|
|---|---|---|
|A1|Exactly 3 hierarchical roles drive baseline permissions; a<br>small set of per-user feature overrides may grant extra<br>access on top of the role.|Roles remain the default and source of truth. A narrow<br>hasIngredientsAccess toggle is allowed as an additive<br>override. Tradeoff: slightly more nuanced than pure<br>role-derived RBAC, but avoids role bloat.|
|A2|One business (tenant), multiple branches.|Demonstrates branch scoping without full<br>multi-tenancy complexity.|
|A3|JWT in http-only, secure, SameSite cookie.|Prevents XSS token theft; clean server-side logout.|
|A4|Stock decremented in a MongoDB transaction at billing, on<br>stock transfer, and on stock adjustment.|(extended v5)Inventory integrity under concurrent<br>sales, transfers, and write-offs.|
|A5|Payments recorded (cash/card/UPI), not charged; a single<br>bill may now record more than one payment record.|(extended v5)Avoids gateway scope;<br>split/multi-method billing logic still fully shown. Payment<br>moves from 1:1 to 1:many against Order.|
|A6|Soft-delete + audit log for sensitive records.|Traceability and data integrity over hard deletes.|
|A7 (new<br>v5)|Account lockout: 5 consecutive failed login attempts locks<br>the account for 15 minutes; a successful login or lockout<br>expiry clears the counter.|Balances security (mitigates<br>brute-force/credential-stuffing) against usability;<br>matches common industry defaults. Super Admin can<br>manually unlock in the interim.|
|A8 (new<br>v5)|Supplier Management and Stock Transfer/Adjustment<br>follow the same permission tier as existing Inventory<br>management: SUPER_ADMIN and ADMIN only.|Consistent with existing inventory permissions (no new<br>permission tier introduced); a Cashier with ingredients<br>access is not implicitly granted stock-transfer or<br>supplier rights.|
|A9 (new<br>v5)|Product Variants are modeled as child records of a parent<br>Product (each variant has its own price and per-branch<br>stock); Combo Meals are a Product flagged as a bundle<br>referencing component products/variants.|Keeps a single Product collection instead of forking the<br>schema; billing and inventory deduction logic can treat<br>a variant/combo line item uniformly.|
|A10<br>(new v5)|Customer Profiles are optional at billing time — a cashier<br>may still complete a walk-in sale with no customer<br>attached.|Avoids forcing data capture that slows down the<br>counter; purchase history simply accumulates for<br>customers who are linked.|
|A11<br>(new v5)|Hold & Resume orders are stored server-side against the<br>branch, not just in browser memory.|Survives page reloads/device changes and lets any<br>authorized cashier on the branch resume a held order.|



POS & Inventory Management Platform — PRD v5.0 

Page 5 

## **4. Roles & Permissions (RBAC Matrix)** 

Roles are hierarchical: SUPER_ADMIN ⊃ ADMIN ⊃ CASHIER. 

|**Capability**|**SUPER_ADMIN**|**ADMIN**|**CASHIER**|
|---|---|---|---|
|Manage branches (create/edit)||||
|Manage users & assign roles||cashiers, own branch||
|View all branches||own only|own only|
|Manage products / menu||||
|[New]Manage product categories, variants & combo<br>meals||||
|Manage inventory / restock||||
|[New]Manage suppliers||||
|[New]Initiate / approve stock transfer between branches||(own branch as origin or<br>destination)||
|[New]Record stock adjustment (damage/wastage)||||
|Manage kitchen ingredients|||only if hasIngredientsAccess|
|Grant a cashier ingredients access||(own branch)||
|Create bills / take orders||||
|[New]Hold & resume an order||||
|[New]Split a bill / record multiple payment methods on<br>one bill||||
|Apply discounts|||capped≤10%|
|Void / refund a bill||||
|[New]Create / view customer profiles & purchase history|||(create & view only, at<br>billing)|
|View reports (all branches)||||
|View reports (own branch), incl.[New]Sales by Payment<br>Method & Cashier Performance||||
|View audit log||||
|[New]Use Forgot/Change Password (own account)||||
|[New]Manually unlock a locked account||||



## **Enforcement is layered** 

- 1 **[Backend (source of truth):]**[ every API route guarded by authenticate + authorize(...roles) + branch-scope] middleware. A cashier hitting an admin endpoint gets 403 regardless of UI. 

- 2 **[Frontend:]**[ protected routes redirect unauthorized users; menu items hidden by role.] 

- 3 **[Data scope:]**[ non-super-admins can only read/write rows belonging to their assigned branch. Stock transfers are] the one operation that legitimately touches two branches at once, and are permitted only when the actor is SUPER_ADMIN or an ADMIN of either the source or destination branch. 

POS & Inventory Management Platform — PRD v5.0 

Page 6 

- 4 **[Per-user override:]**[ the ingredients endpoints additionally check the user's hasIngredientsAccess flag, so a cashier] passes only when their role or their explicit grant allows it. The override can only widen access, never bypass branch scope. 

- 5 **[[New]][ Account state gate:]**[ authentication itself is additionally gated by account state — a locked account (5 failed] attempts within the lockout window) is rejected with a 423-style locked response regardless of credential correctness, until the 15-minute window elapses or a Super Admin unlocks it. 

POS & Inventory Management Platform — PRD v5.0 

Page 7 

## **5. Key Functional Requirements** 

## **5.1 Authentication & Session Safety** 

- I **[FR-1]**[ Login with email + bcrypt-hashed password.] 

- I **[FR-2]**[ On success, server sets an http-only cookie containing a short-lived JWT.] 

- I **[FR-3]**[ Logout clears the cookie server-side; the token is invalidated.] 

- I **[FR-4]**[ (back-button requirement) After logout, the browser Back button must not restore an authenticated page.] Achieved by: SPA re-validates session on mount via GET /api/auth/me → redirect to /login if unauthenticated; Cache-Control: no-store on authenticated responses; and a logged-in user navigating back to /login is auto-redirected to their dashboard. 

- I **[FR-5]**[ Idle/expired sessions force re-login.] 

- I **[FR-5a ][(new v5)]**[ Forgot Password: user requests a reset via email; the API issues a single-use, time-limited (15] minute) reset token, independent of whether the email exists (no account-enumeration signal in the response). 

- I **[FR-5b ][(new v5)]**[ Reset Password: submitting a valid, unexpired token with a new password (meeting the existing] bcrypt/complexity rules) invalidates the token and all existing sessions for that user. 

- I **[FR-5c ][(new v5)]**[ Change Password: an authenticated user supplies their current password plus a new password;] current password is re-verified server-side before the change is accepted. 

I **[FR-5d ][(new v5)]**[ Account Lockout: 5 consecutive failed login attempts for the same account lock it for 15 minutes;] the failure counter resets on a successful login or once the lockout window expires. Lockout and any manual Super Admin unlock are audit logged. 

## **5.2 POS Billing** 

- I **[FR-6]**[ Cashier adds branch products (including variants and combo meals) to a cart and adjusts quantities.] 

- I **[FR-7]**[ System computes subtotal, tax (configurable %), discount, and grand total.] 

- I **[FR-8]**[ On "Pay", the system atomically creates the order, decrements stock (including each combo's component] items), records the payment(s), and returns a printable receipt. 

- I **[FR-9]**[ Billing fails cleanly (rolls back) if any item is out of stock.] 

- I **[FR-9a ][(new v5)]**[ Hold & Resume: a cashier can hold an in-progress cart (stored server-side against the branch with] a reference code); any authorized cashier on that branch can later resume it, restoring items and quantities exactly as held. 

- I **[FR-9b ][(new v5)]**[ Split Bills: a single order's total can be divided into two or more bills (e.g. by seat or by amount);] each resulting bill follows the normal payment and receipt flow independently. 

- I **[FR-9c ][(new v5)]**[ Multiple Payment Methods in One Bill: a bill may be settled with more than one payment record] (e.g. part cash, part card); the system rejects payment if the sum of recorded amounts does not equal the bill total. 

## **5.3 Inventory & Procurement** 

- I **[FR-10]**[ Each product (and each variant) has a per-branch stock quantity and a reorder threshold.] 

- I **[FR-11]**[ Sales auto-decrement stock; restocks increment it (audited).] 

- I **[FR-12]**[ Items at/below threshold appear in a Low Stock list and dashboard alert.] 

- I **[FR-12a ][(new v5)]**[ Supplier Management: SUPER_ADMIN/ADMIN maintain supplier records (name, contact, linked] products/ingredients) used during restocking. 

POS & Inventory Management Platform — PRD v5.0 

Page 8 

- I **[FR-12b ][(new v5)]**[ Stock Transfer Between Branches: SUPER_ADMIN/ADMIN request a transfer of a] 

product/ingredient quantity from one branch to another; on approval, stock is atomically decremented at the source and incremented at the destination in a single MongoDB transaction, with the transfer state (requested/approved/completed) and actor audited. 

- I **[FR-12c ][(new v5)]**[ Stock Adjustment (Damage/Wastage): SUPER_ADMIN/ADMIN record a reason-coded stock] write-off (damage, wastage, expiry, other) that decrements stock and is audit logged with the actor, reason, and quantity. 

## **5.4 Multi-Branch** 

- I **[FR-13]**[ Super admin creates branches and assigns users/products.] 

- I **[FR-14]**[ Admin/cashier operate strictly within their branch.] 

- I **[FR-14a ][(new v5)]**[ A Stock Transfer is the sole cross-branch write operation; it is permitted only for SUPER_ADMIN,] or an ADMIN of the source or destination branch, and both branch IDs are validated on every step of the transfer. 

## **5.5 Reporting** 

- I **[FR-15]**[ Dashboard shows today's sales, order count, top-selling items, and low-stock count — scoped by role.] 

- I **[FR-15a ][(new v5)]**[ Sales by Payment Method: breakdown of revenue collected per method (cash/card/UPI) across] split/multiple-payment bills, scoped by role exactly as existing reports (Super Admin: all branches, Admin: own branch). 

- I **[FR-15b ][(new v5)]**[ Cashier Performance Report: per-cashier totals (bills processed, revenue, average bill value,] discount rate) for a selected period, scoped by role exactly as existing reports. 

## **5.6 Audit & Integrity** 

- I **[FR-16]**[ Sensitive actions (user create, role change, void, restock, ingredients-access grant) are written to an] immutable audit log. 

- I **[FR-16a]**[ (clarified v2) Every bill carrying a discount > 0% is logged with a DISCOUNT_OVERRIDE entry — not only] cashier overrides above the ≤10% cap. This gives a complete, reviewable trail of all price reductions; the entry records the actor, role, and rate so legitimate vs. exceptional discounts are distinguishable at review time. 

- I **[FR-16b ][(new v5)]**[ Account lockout/unlock, password changes and resets, supplier record changes, stock transfers,] and stock adjustments are all written to the same immutable audit log, with the same actor/action/entity/timestamp/metadata shape as existing entries. 

## **5.7 Kitchen Ingredients** 

- I **[FR-17]**[ Maintain a per-branch catalog of raw kitchen ingredients (e.g. Sugar, Milk, Fruits) with quantity and unit, kept] separate from sellable products. 

- I **[FR-18]**[ Super Admin and Admin always manage ingredients; a Cashier may manage them only when granted the] hasIngredientsAccess flag. 

- I **[FR-19]**[ Admins toggle a cashier's hasIngredientsAccess from the Admin panel (own branch); the grant/revoke is] audited. 

## **5.8 Product Management (new in v5)** 

- I **[FR-20]**[ Products can be organized into Categories (e.g. Beverages, Mains, Desserts) for menu browsing and] reporting. 

POS & Inventory Management Platform — PRD v5.0 

Page 9 

- I **[FR-21]**[ A Product may define Variants (e.g. Small/Medium/Large), each with its own price and its own per-branch] stock entry; the cart and receipt always reference the specific variant sold. 

- I **[FR-22]**[ A Product may be flagged as a Combo Meal, referencing two or more component products/variants at a] bundled price; selling a combo deducts stock from each underlying component. 

## **5.9 Customer Management (new in v5)** 

- I **[FR-23]**[ A cashier may optionally attach an existing or newly created Customer Profile (name, phone, optional email)] to an order. 

- I **[FR-24]**[ Customer Purchase History lists a customer's past orders (date, branch, items, total), viewable by] SUPER_ADMIN/ADMIN, and by CASHIER at the point of billing to assist service. 

- I **[FR-25]**[ Customer Profiles are branch-agnostic (a customer can be recognized across branches of the same] business), consistent with the single-tenant assumption (A2). 

POS & Inventory Management Platform — PRD v5.0 

Page 10 

## **6. Non-Functional Requirements** 

|**Area**|**Requirement**|
|---|---|
|Scalability|Stateless API (JWT)→horizontally scalable behind a load balancer. Branch-scoped queries and indexed<br>references, now including suppliers, customers, and stock-transfer documents. MongoDB Atlas scales the<br>data tier independently.|
|Maintainability|Modular layered architecture (routes→controllers→services→models). One concern per module,<br>including new suppliers/, stock-transfers/, customers/ modules.|
|Reliability|Multi-document transactions for billing/stock,stock transfer, andstock adjustment; graceful error<br>responses; input validation on every endpoint, including split-bill amount reconciliation.|
|Security|bcrypt hashing, http-only/SameSite cookies, RBAC middleware, schema validation, rate-limited login,<br>account lockout (5/15 min), andsingle-use time-limited password-reset tokens.|
|Data integrity|Referential consistency, soft deletes, audit log, transactional writes;split-bill totals and multi-method<br>payment sums are validated against the order total before a bill is marked paid.|
|Usability|Responsive web UI, role-aware navigation, sub-second billing flow;held orders persist across<br>sessions/devices for the branch.|



POS & Inventory Management Platform — PRD v5.0 

Page 11 

## **7. System Architecture** 

```
+--------------+  HTTPS / cookie   +--------------------------------+
|  React SPA   | -----------------> |     Node.js + Express API     |
| (role-aware  | <----------------- |  auth . rbac . billing        |
|   routing)   |       JSON         |  inventory . suppliers        |
+--------------+                    |  stock-transfers . customers  |
                                     |  products . reports . audit  |
                                     +---------------+----------------+
                                                     | Mongoose (transactions)
                                          +----------v-----------+
                                          |     MongoDB Atlas     |
                                          |   cloud replica set   |
                                          +------------------------+
```

Tech stack (chosen for fast, production-grade delivery): 

- G **[Frontend:]**[ React + React Router + Vite.] 

- G **[Backend:]**[ Node.js + Express.] 

- G **[Database:]**[ MongoDB Atlas — cloud-hosted, managed replica set, accessed via the Mongoose ODM. The replica] set enables multi-document ACID transactions for atomic billing + stock deduction, and now for stock transfer and stock adjustment. 

- G **[Auth:]**[ JWT in http-only cookies, bcrypt password hashing, plus ][single-use time-limited tokens][ for password reset.] 

- G **[Notifications (new v5):]**[ a thin notifier abstraction generates the password-reset link; for this build it logs/returns] the link rather than integrating a production SMTP provider (see Out of Scope, 2.2). 

- G **[Layered backend modules:]**[ auth/, rbac/ (middleware), branches/, users/, products/ (categories, variants,] combos), inventory/, suppliers/, stock-transfers/, ingredients/, billing/ (hold-resume, split, multi-payment), customers/, reports/, audit/. 

POS & Inventory Management Platform — PRD v5.0 

Page 12 

## **8. Data Model (core entities)** 

```
Business 1---* Branch 1---* User (role + hasIngredientsAccess,
                                    failedLoginAttempts, lockUntil)
    |
    |--* Category (name)
    |
    |--* Product (categoryRef, isCombo, comboItems[])
    |      |--* Variant (name, price)  1---1  Inventory(stock, reorderLevel) [per branch]
    |
    |--* Ingredient (name, quantity, unit, reorderLevel)
    |
    |--* Supplier (name, contact, linkedProducts[], linkedIngredients[])
    |
    |--* StockTransfer (fromBranch, toBranch, items[], status,
    |                     requestedBy, approvedBy)
    |
    |--* StockAdjustment (branch, item, type[damage/wastage],
    |                       quantity, reason, actor)
    |
    |--* Customer (name, phone, email?) --* Order (purchase history)
    |
    |--* Order 1---* OrderItem
    |       1---* Payment (method, amount)   [1-to-many: split / multi-method]
    |       1---1 HeldOrderRef (optional, while status = HELD)
    |
    PasswordResetToken (user, token, expiresAt, used)
    AuditLog (actor, action, entity, timestamp, metadata)
```

Collections in MongoDB: businesses, branches, users, categories, products, variants, ingredients, suppliers, stocktransfers, stockadjustments, customers, orders, payments, passwordresettokens, auditlogs. Inventory remains embedded/related to Product/Variant and Ingredient documents. Indexes on branchId, email, customer.phone, and createdAt support branch-scoped queries and reporting. 

_**Note on A5:** Payment moves from a 1-to-1 relationship with Order (v2) to 1-to-many (v5), to support split bills and multiple payment methods on a single bill; existing single-payment bills remain a valid special case with exactly one Payment record._ 

POS & Inventory Management Platform — PRD v5.0 

Page 13 

## **9. Milestones** 

|**#**|**Milestone**|**Output**|
|---|---|---|
|M1|Repo scaffold, schema, seed data|Runnable backend + Atlas connection|
|M2|Auth + RBAC middleware + back-button safety +[New]Forgot/Change<br>Password + Account Lockout|Secure login/logout with account recovery &<br>brute-force protection|
|M3|Products +[New]Categories/Variants/Combo Meals + inventory CRUD|Full catalog & stock|
|M4|POS billing with transactional stock deduction +[New]Hold & Resume,<br>Split Bills, Multiple Payment Methods|Working, flexible bills|
|M5|[New]Supplier Management + Stock Transfer + Stock Adjustment|Procurement & inter-branch stock<br>operations|
|M6|[New]Customer Management (profiles & purchase history)|Lightweight CRM foundation|
|M7|Reporting dashboard (incl.[New]Sales by Payment Method, Cashier<br>Performance) + audit log|Role-scoped insights|
|M8|Frontend SPA + role-aware routing|End-to-end demo|
|M9|README, seed credentials, demo script|Documentation|



## **10. Acceptance Criteria** 

How the evaluator verifies the build: 

- 1[Logging in as each of the 3 roles shows only permitted UI and API access.] 

- 2[A cashier calling an admin-only API returns 403.] 

- 3[After logout, the browser Back button does not reveal a protected page.] 

- 4[A logged-in user visiting /login is redirected to their dashboard.] 

- 5[Selling an item (including a variant or combo) reduces its stock; selling out-of-stock fails atomically.] 

- 6[Low-stock items surface on the dashboard.] 

- 7[Reports (including Sales by Payment Method and Cashier Performance) are branch-scoped per role.] 

- 8[Sensitive actions appear in the audit log, and every discounted bill produces a DISCOUNT_OVERRIDE entry.] 

- 9[A cashier can access ingredients only after an Admin enables hasIngredientsAccess; revoking it returns access to] 403. 

- 10[[New]][ After 5 consecutive failed login attempts, the account locks for 15 minutes; further correct-password attempts] during the lockout are still rejected as locked, and the lock clears automatically after 15 minutes or via Super Admin unlock. 

- 11[[New]][ Forgot Password issues a single-use, time-limited token that successfully resets the password once and is] rejected on reuse or after expiry; Change Password rejects an incorrect current password. 

- 12[[New]][ Creating a Product Variant or Combo Meal and selling it produces the correct bill price and deducts stock] from the correct variant/underlying components. 

- 13[[New]][ A Stock Transfer between two branches atomically decrements the source and increments the destination,] and appears in the audit log for both branches. 

POS & Inventory Management Platform — PRD v5.0 

Page 14 

- 14[[New]][ A Stock Adjustment (damage/wastage) decrements stock with a recorded reason and appears in the audit] log. 

- 15[[New]][ An order can be held and later resumed with its items/quantities intact; a bill can be split and/or settled with] multiple payment methods whose amounts sum exactly to the bill total (mismatches are rejected). 

- 16[[New]][ A Customer Profile's purchase history correctly lists their past linked orders across branches.] 

- 17[Git history shows meaningful, incremental commits.] 

POS & Inventory Management Platform — PRD v5.0 

Page 15 

## **11. Security & Permissions Summary** 

|**Threat**|**Mitigation**|
|---|---|
|Token theft via XSS|JWT stored in http-only cookie — inaccessible to JS.|
|Privilege escalation|Backend authorize() middleware on every route; UI gating is cosmetic only.|
|Cross-branch data access|Branch-scope middleware filters every query by the user's branchId; the sole exception,<br>Stock Transfer, explicitly validates both the source and destination branchId on every step.|
|Stale auth after logout|Server-side cookie clear + no-store caching + session re-validation on mount.|
|Brute-force / credential-stuffing login|[New]Rate-limited login endpoint; bcrypt work factor; Account Lockout after 5 failed<br>attempts for 15 minutes, audit logged.|
|Password-reset abuse / account<br>enumeration|[New]Single-use, time-limited (15 min) reset tokens; identical API response whether or not<br>the email exists; token invalidates all existing sessions on use; every reset/change is audit<br>logged.|
|Fraudulent stock transfer or write-off|[New]SUPER_ADMIN/ADMIN only, atomic multi-document transactions, immutable audit<br>trail recording actor, branches, quantities, and reason.|
|Inventory race conditions|Atomic multi-document transactions on the Atlas replica set, now covering billing, stock<br>transfer, and stock adjustment.|
|Split-bill / multi-payment total<br>mismatch|[New]Server validates that recorded payment amounts sum exactly to the bill total before<br>marking it paid; partial/incorrect sums are rejected.|



## **12. Future Extensions (post-evaluation roadmap)** 

Deliberately out of the current scope, but the architecture leaves clean seams for: 

- G[Kitchen Display System (KDS) — orders already model line items; a real-time socket channel can fan them to a] kitchen screen. 

- G[Payment gateway — the Payment document already abstracts method/amount (now 1-to-many per order);] swapping "recorded" for "charged" is a service-layer change. 

- G[Full multi-tenancy — the Business root entity is in place; tenant isolation becomes a query filter + auth claim.] 

- G[Granular permissions — role-derived permissions can graduate to a permission table without touching call sites,] since checks already route through authorize(). 

- G[Loyalty & rewards — Customer Profiles and Purchase History (new in v5) are the foundation; a points/rewards] engine and promotions can be layered on without a schema change to Customer. 

- G[Production email/SMS delivery — the password-reset notifier is already abstracted behind an interface; swapping] the logging stub for a real provider (e.g. SES, Twilio) is a configuration change, not a redesign. 

- G[Analytics & forecasting — Atlas aggregation pipelines over the orders collection feed demand forecasting and] auto-reorder, now enriched with supplier lead-time and stock-transfer data. 

_End of document — POS & Inventory Management Platform PRD v5.0 — submitted 2026-07-06._ 

POS & Inventory Management Platform — PRD v5.0 

Page 16 

