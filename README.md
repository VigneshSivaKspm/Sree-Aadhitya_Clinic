# SREE AADHITYAA INTEGRATED SIDDHA AND DENTAL HEALTHCARE — Web Platform

Built by **Legendary One Technologies** for **SREE AADHITYAA INTEGRATED SIDDHA AND DENTAL HEALTHCARE** (Ayurvedic/Siddha and Dental practices).

Brand name and colours are centralised: name in `web/src/config/site.js` (`BRAND`), brand coral `#F17577` in the `--color-dental-*` tokens of each app's `index.css`.

Two separate React + Vite apps share one Firebase project:

| App | Folder | Purpose | Dev URL |
|---|---|---|---|
| Public website | [`web/`](web) | Main site, Ayurveda & Dental pages, appointments, Ayurvedic store, cart, checkout, order tracking, contact | http://localhost:5173 |
| Admin panel | [`admin/`](admin) | Staff sign-in, dashboard, appointments, doctors, treatments, products, inventory, orders, content, reports, users, settings | http://localhost:5174 |

Stack: React 19, Vite, React Router 7, Tailwind CSS 4, Lucide icons, Firebase (Auth, Firestore, Storage).

---

## 1. Setup

### Firebase project
1. Create a Firebase project. Enable **Authentication → Email/Password**, **Firestore** and **Storage**.
2. Register a **Web app** and copy its config.
3. In each app folder copy `.env.example` to `.env` and fill in the values (same project for both apps). Never commit `.env`.

```bash
cd web   && npm install && npm run dev
cd admin && npm install && npm run dev
```

The **public site runs without Firebase configured** (it shows clearly-labelled sample content in development); the admin panel shows a "not configured" screen until `.env` is filled in.

### Deploy security rules and indexes (required before real use)
```bash
npm i -g firebase-tools
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules,firestore:indexes,storage
```
The files are at the repo root: [`firestore.rules`](firestore.rules), [`storage.rules`](storage.rules), [`firestore.indexes.json`](firestore.indexes.json). If a list shows *"needs a database index"*, deploy the indexes (or use the link in the browser console).

### Create the first super admin (one-time)
There is intentionally no hard-coded admin. Roles live in Firestore and only a super admin can write them, so the **first** one is bootstrapped by hand:
1. Firebase console → Authentication → **Add user** (email + password). Copy the user's **UID**.
2. Firestore → collection `users` → document ID = that **UID** with fields:
   `name` (string), `email` (string), `role` = `super_admin`, `active` = `true`, `createdAt` (timestamp).
3. Sign in to the admin app. From **Users / Roles** the super admin can create `ayurveda_admin` and `dental_admin` accounts.

### Self-signup (access requests)
The admin login page has a **Request an account** link (`/signup`). Signing up only creates a Firebase Auth account plus an `accessRequests/{uid}` document — it grants **no role**, so the person sees "Waiting for approval" and can't read or write any data. A super admin approves it under **Users / Roles → Access requests**, choosing a role (this creates `users/{uid}` and removes the request) or rejects it. Only super admins can write `users/*`, so nobody can promote themselves. To turn self-signup off entirely, remove the `/signup` route and disable the Email/Password *sign-up* path (or keep it and simply reject requests). Redeploy `firestore.rules` after pulling this change.

### Hosting (optional)
`firebase.json` has two hosting targets (`web`, `admin`). `firebase target:apply hosting web <site>` / `admin <site>`, then `npm run build` in each app and `firebase deploy --only hosting`.

---

## 2. Roles and access

| Module | super_admin | ayurveda_admin | dental_admin |
|---|:-:|:-:|:-:|
| Dashboard, Reports | all data | Ayurveda + store | Dental only |
| Appointments, Patients, Enquiries | both practices | Ayurveda | Dental |
| Doctors, Treatments, Website content | both + main site | Ayurveda | Dental |
| Products, Categories, Inventory, Orders, Customers | ✔ | ✔ | ✘ |
| Users / Roles, Settings | ✔ | ✘ | ✘ |

**Hiding menu items is not security.** The same rules are enforced by `firestore.rules` / `storage.rules`, which read the caller's `users/{uid}` profile (`role`, `active`). Practice admins' queries are always filtered by `practiceType` so they satisfy the rules.

---

## 3. Firestore data model

| Collection | Key fields | Public access |
|---|---|---|
| `users/{uid}` | name, email, role, active, createdAt, updatedAt | none (own doc readable; super admin manages) |
| `doctors` | practiceType, name, image, qualification, specialization, experience, bio, phone, email, displayOrder, active, featured | read **active** only |
| `services` | practiceType, name, slug, shortDescription, fullDescription, image, benefits[], duration, doctorIds[], featured, active, seoTitle, seoDescription, displayOrder | read **active** only |
| `appointments` | practiceType, patientName, phone, email, doctorId/Name, serviceId/Name, preferredDate (`YYYY-MM-DD`), preferredTime (`HH:mm`), notes, consent, status, createdAt, updatedAt (+ admin: rescheduledFrom, lastStatusNote, updatedBy) | **create only** (validated, status forced to `pending`) |
| `appointments/{id}/history` | from, to, note, by, byName, at, newDate, newTime | none — audit trail |
| `productCategories` | name, slug, description, image, displayOrder, active | read active |
| `products` | name, slug, sku, categoryId, shortDescription, description, images[], price, compareAtPrice, stockQuantity, inStock, featured, active, usageInformation, ingredients | read active |
| `products/{id}/stockMovements` | delta, previous, next, reason, orderId?, by, at | none — append-only log |
| `orders` (doc ID = order number `AAH-XXXX-XXXX-XXXX`) | customer{name,phone,email}, deliveryAddress{…}, items[], itemCount, subtotal, shippingFee, total, paymentMethod, paymentStatus, orderStatus, stockDeducted, shipping{}, createdAt, updatedAt | **create only** |
| `orderTracking/{orderNumber}` | orderNumber, orderStatus, paymentStatus, itemCount, total, items[{name,quantity}], shipping{carrier,trackingNumber} | **get only**, by unguessable ID; contains no address/phone |
| `testimonials`, `faqs` | practiceType (`main`/`ayurveda`/`dental`), text/question…, displayOrder, active | read active |
| `siteContent/{main\|ayurveda\|dental}` | structured page content (hero, about, contact overrides, facilities, …) | read |
| `settings/general` | contact, social, shipping, lowStockThreshold, appointments (slots), disclaimer | read — **never store secrets here** |
| `enquiries` | practiceType, name, phone, email, message, status | **create only** |

Storage paths: `doctors/{practice}/`, `services/{practice}/`, `products/`, `categories/`, `site/{scope}/` — public read; images only, ≤ 5 MB, writes need the matching role.

Statuses — appointments: `pending → confirmed / rescheduled / cancelled → completed`. Orders: `pending → confirmed → processing → shipped → delivered` (or `cancelled`). Payment: `pending / paid / failed / refunded`.

---

## 4. How key workflows work

- **Appointments**: the public form writes a `pending` request. The confirmation screen says "awaiting confirmation" and only says *confirmed* if the status really is `confirmed`. Staff confirm/reschedule/complete/cancel in the admin (each change writes a history entry). Dates are stored as `YYYY-MM-DD` strings in IST to avoid timezone bugs; past dates are rejected client-side.
- **Store / checkout**: no fake payments — checkout offers **Cash on delivery** and **UPI/bank transfer (arranged after confirmation)**. On checkout the live product docs are re-read (price, stock, active) and the cart is corrected if anything changed. Orders and a minimal `orderTracking` record are created in one batch.
- **Stock**: not decremented by the public. When staff **confirm** an order, a transaction deducts stock (failing if short) and logs `stockMovements`; **cancelling** restores it.
- **Order lookup**: customers see status by order number at `/orders` (plus a list of orders placed on the same device). The order number is the unguessable document ID, so there is no public listing.
- **Content**: everything editable lives in Firestore (`siteContent`, `settings`, doctors, treatments, testimonials, FAQs); defaults in `web/src/config/site.js` fill any gaps.
- **Demo content**: sample doctors/treatments/products (`web/src/config/demoData.js`) appear only while a collection is empty *and* `VITE_ENABLE_DEMO_DATA` allows it (default: dev only). They are labelled "Sample content". **Set `VITE_ENABLE_DEMO_DATA=false` in production.** No qualifications, experience, reviews or outcomes are invented.

---

## 5. Known limitations / recommended hardening

1. **Trusted order totals.** Firestore rules cannot loop over the `items` array, so a hostile client could submit a doctored line price (rules do enforce `total = subtotal + shippingFee`, valid fields, `pending` statuses, create-only). Mitigations today: checkout re-reads live prices; staff review every order before confirming. For full protection, add a Cloud Function (callable/HTTPS) that recomputes totals server-side and creates the order, then tighten the `orders` create rule to `false`. This was left out because the brief allows Cloud Functions only when clearly required — this is the case to add one before high-volume selling.
2. **Spam protection.** Public create endpoints (appointments/orders/enquiries) are validated but not rate-limited. Enable **Firebase App Check** (reCAPTCHA) on Firestore and add a honeypot/captcha if abuse appears.
3. **Notifications.** No email/SMS/WhatsApp is sent on new appointments or orders. Add a Cloud Function or Firebase "Trigger Email" extension when needed.
4. **Rules are not emulator-tested.** Review and test `firestore.rules` / `storage.rules` with the Firebase Emulator Suite before launch (particularly the role checks and the public `create` validators).
5. **Lists filter client-side after loading a page** (search/doctor/service/date on appointments; search/category on products). Status/practice filters are server-side. People and reports views are bounded (latest 500 records / 200 orders); counts and revenue use Firestore aggregation.
6. **Auth accounts can't be deleted from the client** — deactivate users instead. Custom claims are not used; roles are read from `users/{uid}` on each request by the rules.
7. **Legal pages** (Privacy, Terms) are placeholders awaiting client-approved text. Logos are replaceable placeholders (`web/src/components/layout/Logo.jsx`). Contact numbers in `web/src/config/site.js` are placeholders until entered in **Admin → Settings**.
8. Sitemap is not generated; `robots.txt` is in `web/public`. Add a `sitemap.xml` (or a build step reading services/products) once the production domain is known. Page titles/descriptions/canonical/Open Graph tags are set per page via `<Seo>`; the site is a client-rendered SPA.

---

## 6. Project structure

```
web/src   config/ contexts/ hooks/ services/ utils/ layouts/ routes/ pages/ components/{ui,layout,home,practice,appointment,shop,common}
admin/src config/ contexts/ hooks/ services/ utils/ layouts/ routes/ pages/ components/ui
firestore.rules  storage.rules  firestore.indexes.json  firebase.json
```
Firebase access is confined to `services/` (plus small hooks); pages call services/hooks, never Firestore directly, except a few read-only aggregations in admin `PeoplePage`.
