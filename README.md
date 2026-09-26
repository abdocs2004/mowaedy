# مواعيدي (Mawaeedy)

منصة حجز مواعيد بالعربية بالكامل (RTL) تربط العملاء بثلاثة أنواع من مقدمي الخدمة: **الجيمات**، **صالونات الحلاقة**، و**العيادات الطبية**.

Full-stack rebuild of a static Arabic/RTL landing page into a production-style booking platform.

## التقنيات المستخدمة (Tech stack)

- **Frontend:** React 19 + React Router 7 + Tailwind CSS 3 + Vite + Recharts + lucide-react
- **Backend:** Node.js + Express 4 + Mongoose 8
- **Database:** MongoDB
- **Auth:** JWT in an httpOnly cookie, bcrypt password hashing, role-based access (`user` / `provider` / `admin`)

## هيكل المشروع (Project structure)

```
mawaeedy/
├── backend/            # Express API + MongoDB models + seed data
│   ├── src/
│   │   ├── config/     # env, db connection, constants
│   │   ├── models/     # User, Category, Provider, Service, Appointment, SlotLock, ContactMessage
│   │   ├── services/   # slot calculation, booking, stats (business logic, no HTTP)
│   │   ├── controllers/, routes/, middleware/, validators/
│   │   └── seed/       # deterministic demo data (18 providers from the original site)
│   └── tests/          # node:test + supertest integration tests
├── frontend/            # React SPA
│   ├── public/images/   # optimized WebP photos (from the original project's /imgs)
│   └── src/
│       ├── pages/{public,customer,provider,admin}/
│       ├── components/{layout,shared,ui}/
│       ├── context/, hooks/, lib/
└── package.json          # root scripts that orchestrate both halves
```

## المتطلبات (Requirements)

- Node.js ≥ 18.17
- A running MongoDB instance (local or Atlas)

## التثبيت والتشغيل (Installation & running)

```bash
# 1) install dependencies for both apps
npm run install:all

# 2) configure the backend
cp backend/.env.example backend/.env
# edit backend/.env — at minimum set MONGODB_URI and a real JWT_SECRET:
#   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3) seed the database with demo data (18 providers, customers, appointments)
npm run seed

# 4) start both the API (port 5000) and the frontend dev server (port 5173)
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` to the backend, so the auth
cookie works without any extra CORS configuration.

### متغيرات البيئة (Environment variables)

All backend variables are documented in `backend/.env.example`:

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | Signs auth tokens — must be a long random string in production |
| `CLIENT_URL` | Allowed CORS origin(s) for the frontend |
| `TIMEZONE` | Business timezone for working hours / slots (default `Africa/Cairo`) |
| `CANCEL_WINDOW_HOURS` | How close to an appointment a customer can still cancel it |
| `SERVE_CLIENT` | When `true`, the API also serves `frontend/dist` (single-server production mode) |

### إعداد MongoDB (MongoDB setup)

- **Local:** install MongoDB Community Server and leave `MONGODB_URI=mongodb://127.0.0.1:27017/mawaeedy`.
- **Atlas:** create a free cluster, then set `MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/mawaeedy?retryWrites=true&w=majority`.

### تشغيل قاعدة البيانات التجريبية (Seeding)

```bash
npm run seed          # seeds an empty database
npm run seed:reset    # wipes everything and reseeds — for development only
```

The seed script prints working development credentials when it finishes:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@mawaeedy.local` | `Admin@12345` |
| Customer | `user1@mawaeedy.local` … `user8@mawaeedy.local` | `User@12345` |
| Provider | `provider01@mawaeedy.local` … `provider18@mawaeedy.local` | `Provider@12345` |

(Values come from `backend/.env` — `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — and can be changed there.)

## البناء للإنتاج (Production build)

Two deployment shapes are supported:

**A) Single server** (Express serves the built React app too):

```bash
npm run build                       # builds frontend/dist
# in backend/.env set SERVE_CLIENT=true
npm start                           # node backend/src/server.js, serving API + SPA on one port
```

**B) Separate hosting** — deploy `backend/` as the API and `frontend/dist` (after `npm run build`)
to any static host, pointing `VITE_API_URL` at the API's URL at build time.

## الاختبارات (Tests)

```bash
npm test                 # backend integration tests + frontend tests
npm run test:backend     # node:test + supertest — auth, booking/double-booking, roles, admin CRUD
npm run test:frontend    # vitest
```

The backend test suite seeds a separate `_test` database, so it's safe to run against a real
MongoDB without touching development data.

## الميزات الرئيسية (Main features)

- **بالعربية بالكامل و RTL حقيقي** — `dir="rtl"` على مستوى الصفحة، خط Cairo، وتخطيطات RTL مبنية بشكل صحيح (وليست ترجمة فقط).
- **حجز حقيقي بدون بيانات وهمية** — الفترات المتاحة تُحسب من ساعات العمل الفعلية، مدة الخدمة، الحد الأدنى للإشعار، ومواعيد أخرى محجوزة.
- **منع الحجز المزدوج على مستوى قاعدة البيانات** — وليس فقط في الكود (مجموعة `SlotLock` بمفتاح فريد)، يعمل بشكل صحيح حتى مع طلبات متزامنة.
- **ثلاث لوحات تحكم:** عميل (مواعيدي)، مقدم خدمة (الخدمات، ساعات العمل، المواعيد)، ومدير (إحصائيات، مستخدمون، مقدمو خدمة، أقسام، رسائل التواصل).
- **صلاحيات محكمة:** `user` / `provider` / `admin`، مع حماية آخر حساب مدير من التعطيل.

## بنية API (API structure)

All endpoints are under `/api`:

- `POST /auth/register`, `/auth/login`, `/auth/logout`, `GET/PATCH /auth/me`, `PATCH /auth/password`
- `GET /categories`, `GET /providers`, `GET /providers/:id`, `GET /providers/:id/slots`, `GET /providers/:id/availability`
- `POST /appointments`, `GET /appointments/mine`, `GET /appointments/:id`, `PATCH /appointments/:id/cancel`
- `/provider/*` — the logged-in provider's own dashboard (profile, services, appointments, stats)
- `/admin/*` — stats, users, providers, services, categories, appointments, contact messages
- `POST /contact` — public contact form (replaces the original EmailJS integration)

## ملاحظات (Notes on the data)

The 18 providers (names, salon/clinic names, addresses, photos, star ratings) come from the
original static frontend. Cities, clinic specialties, services and prices did not exist in the
original project and are realistic sample data — replace them with real values before going live.
