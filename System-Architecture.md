# System Architecture Document

**Proyek:** Sistem Point of Sale (POS) Multi-Outlet untuk Coffee Shop  
**Versi Dokumen:** 1.0  
**Tanggal:** 12 April 2026  
**Referensi:** PRD v1.0 (MVP)

---

## 1. Gambaran Besar Sistem

### 1.1 Diagram Arsitektur Tingkat Tinggi

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              TABLET KASIR (Browser)                             │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │                    React + Vite (PWA - Service Worker)                     │  │
│  │                                                                            │  │
│  │  ┌──────────────┐  ┌───────────────┐  ┌─────────────┐  ┌──────────────┐   │  │
│  │  │  POS Module   │  │ Inventory Mgmt│  │  Shift Mgmt │  │  Dashboard   │   │  │
│  │  │  (Cashier)    │  │ (Manager)     │  │  (Mgr/Csr)  │  │  (Owner/Mgr) │   │  │
│  │  └──────┬───────┘  └───────┬───────┘  └──────┬──────┘  └──────┬───────┘   │  │
│  │         │                  │                  │                │            │  │
│  │  ┌──────▼──────────────────▼──────────────────▼────────────────▼───────┐    │  │
│  │  │                     State Management (Zustand)                      │    │  │
│  │  └──────┬─────────────────────────────────────────────────────────────┘    │  │
│  │         │                                                                  │  │
│  │  ┌──────▼──────────────────────────────────────────────────────────────┐   │  │
│  │  │                   IndexedDB (Dexie.js Wrapper)                      │   │  │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │   │  │
│  │  │  │  Offline Tx   │  │  Product     │  │  Background Sync Queue   │   │   │  │
│  │  │  │  Queue        │  │  Cache       │  │  (Pending Operations)    │   │   │  │
│  │  │  └──────────────┘  └──────────────┘  └──────────────────────────┘   │   │  │
│  │  └────────────────────────────┬────────────────────────────────────────┘   │  │
│  └───────────────────────────────┼────────────────────────────────────────────┘  │
│                                  │                                               │
│  ┌───────────────────────────────▼────────────────────────────────────────────┐  │
│  │               Web Bluetooth API (ESC/POS Thermal Printer)                  │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────┬───────────────────────────────────────────────┘
                                   │
                    HTTPS (REST API + Bearer Token)
                    Background Sync (Service Worker)
                                   │
┌──────────────────────────────────▼───────────────────────────────────────────────┐
│                         HOSTINGER BUSINESS SERVER                                │
│                         (2 Core CPU, 3GB RAM, NVMe)                              │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │                        NGINX (Reverse Proxy + SSL)                         │  │
│  │                   ┌─────────────────────────────────┐                      │  │
│  │                   │  Static Assets (React Build)    │                      │  │
│  │                   └─────────────────────────────────┘                      │  │
│  └───────────────────────────────┬────────────────────────────────────────────┘  │
│                                  │                                               │
│  ┌───────────────────────────────▼────────────────────────────────────────────┐  │
│  │                     Laravel 13 (PHP 8.4 + FPM)                             │  │
│  │                                                                            │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐   │  │
│  │  │                        Middleware Stack                              │   │  │
│  │  │  ┌────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────────────────┐  │   │  │
│  │  │  │ CORS   │ │ Sanctum  │ │ Rate Limit  │ │ Outlet Scope (RBAC)  │  │   │  │
│  │  │  │ Filter │ │ Auth     │ │ Throttle    │ │ Global Scope Inject  │  │   │  │
│  │  │  └────────┘ └──────────┘ └─────────────┘ └──────────────────────┘  │   │  │
│  │  └─────────────────────────────────────────────────────────────────────┘   │  │
│  │                                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │  Auth API     │  │  POS API     │  │  Inventory   │  │  Finance     │   │  │
│  │  │  Controller   │  │  Controller  │  │  API Ctrl    │  │  API Ctrl    │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │                                                                            │  │
│  │  ┌──────────────────────────┐  ┌───────────────────────────────────────┐   │  │
│  │  │  Spatie Permission       │  │  Laravel Queue (database driver)      │   │  │
│  │  │  (Role & Permission)     │  │  ┌─────────────┐  ┌───────────────┐  │   │  │
│  │  │  ┌────────────────────┐  │  │  │ Stock Auto  │  │ Backup Job    │  │   │  │
│  │  │  │ Owner / Manager /  │  │  │  │ Deduction   │  │ (Daily Cron)  │  │   │  │
│  │  │  │ Cashier Roles      │  │  │  └─────────────┘  └───────────────┘  │   │  │
│  │  │  └────────────────────┘  │  │  ┌─────────────┐  ┌───────────────┐  │   │  │
│  │  └──────────────────────────┘  │  │ Audit Log   │  │ Sync Process  │  │   │  │
│  │                                │  │ Observer     │  │ Handler       │  │   │  │
│  │                                │  └─────────────┘  └───────────────┘  │   │  │
│  │                                └───────────────────────────────────────┘   │  │
│  └───────────────────────────────┬────────────────────────────────────────────┘  │
│                                  │                                               │
│  ┌───────────────────────────────▼────────────────────────────────────────────┐  │
│  │                         MySQL 8.4 (InnoDB)                                 │  │
│  │                                                                            │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐   │  │
│  │  │  Master Tables              │  Operational Tables                   │   │  │
│  │  │  ─────────────              │  ───────────────────                  │   │  │
│  │  │  users (UUID, soft-delete)  │  transactions (UUID, permanent)      │   │  │
│  │  │  outlets                    │  transaction_items (UUID)             │   │  │
│  │  │  products (UUID, soft-del)  │  shifts (UUID)                       │   │  │
│  │  │  categories                 │  shift_counts                        │   │  │
│  │  │  raw_materials (soft-del)   │  audit_logs                          │   │  │
│  │  │  product_recipes (BOM)      │  sync_queue                          │   │  │
│  │  │  vouchers (soft-delete)     │  expenses (OPEX)                     │   │  │
│  │  │  roles / permissions        │                                       │   │  │
│  │  └─────────────────────────────────────────────────────────────────────┘   │  │
│  │                                                                            │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐   │  │
│  │  │  Backup Storage: /home/backups/ (auto-purge > 7 hari)              │   │  │
│  │  └─────────────────────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Alur Data (Data Flow)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Kasir   │───▶│  React   │───▶│ IndexedDB│───▶│ Service  │───▶│ Laravel  │
│  Input   │    │  UI/UX   │    │ (Offline │    │ Worker   │    │ REST API │
│  Pesanan │    │  State   │    │  Queue)  │    │ BG Sync  │    │ Endpoint │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                                     │
     ┌───────────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Validate │───▶│  MySQL   │───▶│  Queue   │───▶│ Stock    │
│ & Store  │    │  Write   │    │  Worker  │    │ Deduct   │
│ Tx Data  │    │  (UUID)  │    │  (Async) │    │ via BOM  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

**Penjelasan Alur Offline-First:**

1. **Kasir membuat pesanan** → data disimpan langsung ke IndexedDB dengan UUID yang di-generate di client.
2. **Jika online** → data langsung dikirim ke Laravel API via HTTP.
3. **Jika offline** → data masuk ke _sync queue_ di IndexedDB; Service Worker akan mengirim otomatis saat koneksi pulih (_Background Sync API_).
4. **Server menerima data** → validasi, simpan ke MySQL, lalu dispatch _Queue Job_ untuk pemotongan stok (agar response API tetap cepat).

---

## 2. Tech Stack Recommendation

### 2.1 Frontend

| Teknologi                 | Versi  | Alasan                                                                                                                                                                                           |
| :------------------------ | :----- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React**                 | 19.2   | Ekosistem terbesar, pustaka PWA/offline matang, komunitas luas untuk troubleshoot                                                                                                                |
| **Vite**                  | 8.x    | Build tool tercepat untuk React; HMR instan saat development, output bundle kecil                                                                                                                |
| **TypeScript**            | 6.x    | _Type safety_ mencegah bug pada logika transaksi/keuangan yang kritis                                                                                                                            |
| **Tailwind CSS**          | 4.x    | Utility-first CSS framework; konfigurasi via CSS (`@theme`), zero-config content detection, performa build sangat cepat dengan Oxide engine                                                      |
| **Shadcn UI**             | latest | Koleksi komponen UI berkualitas tinggi berbasis Radix primitives; bukan dependency — kode di-copy ke project sehingga fully customizable. Konsisten, accessible (WAI-ARIA), dan production-ready |
| **Radix UI**              | latest | Headless UI primitives yang menjadi fondasi Shadcn; menangani accessibility, keyboard navigation, dan focus management secara otomatis                                                           |
| **Zustand**               | 5.x    | State management ringan (~1KB), API sederhana tanpa boilerplate, perfect untuk SPA mid-size                                                                                                      |
| **Dexie.js**              | 4.x    | Wrapper IndexedDB yang paling ergonomis; fitur `liveQuery` untuk reactivity, built-in sync protocol                                                                                              |
| **TanStack Query**        | 5.x    | Caching, retry, dan sync state management untuk API calls; gunakan object signature API v5                                                                                                       |
| **React Router**          | 7.x    | Routing standar de facto React; mendukung _lazy loading_ dan _protected routes_                                                                                                                  |
| **react-i18next**         | 15.x   | Solusi i18n paling matang untuk React; mendukung lazy-load translation files                                                                                                                     |
| **Vite PWA Plugin**       | 1.x    | Generate Service Worker (Workbox) otomatis; konfigurasi Background Sync deklaratif                                                                                                               |
| **Recharts**              | 3.x    | Library chart React yang ringan untuk dashboard analytics (Omzet, HPP, Laba)                                                                                                                     |
| **Lucide React**          | latest | Icon library default Shadcn UI; tree-shakeable, konsisten, 1500+ ikon SVG                                                                                                                        |
| **clsx + tailwind-merge** | latest | Utility untuk menggabungkan Tailwind classes secara conditional tanpa konflik (digunakan oleh helper `cn()`)                                                                                     |
| **date-fns**              | 4.x    | Manipulasi tanggal immutable & tree-shakeable; jauh lebih ringan dari Moment.js                                                                                                                  |

### 2.2 Backend

| Teknologi                      | Versi | Alasan                                                                                      |
| :----------------------------- | :---- | :------------------------------------------------------------------------------------------ |
| **Laravel**                    | 13.x  | Framework PHP paling solid untuk REST API; fitur Queue, Observer, Scheduler built-in        |
| **PHP**                        | 8.4   | Baseline modern PHP untuk kompatibilitas dependency terbaru dan performa runtime lebih baik |
| **Laravel Sanctum**            | 4.x   | Token-based auth ringan tanpa overhead OAuth; ideal untuk SPA + mobile                      |
| **spatie/laravel-permission**  | 7.x   | RBAC package paling populer & teruji; integrasi mulus dengan middleware Laravel             |
| **spatie/laravel-backup**      | 9.x   | Auto-backup database + files dengan scheduling; notifikasi jika backup gagal                |
| **spatie/laravel-activitylog** | 4.x   | Audit trail otomatis; recording semua model changes dengan actor tracking                   |
| **MySQL**                      | 8.4   | Mendukung UUID native (`uuid()` function), JSON columns, CTE, dan window functions          |

### 2.3 Development & Tooling

| Teknologi                 | Alasan                                                               |
| :------------------------ | :------------------------------------------------------------------- |
| **ESLint 9 + Prettier 3** | Konsistensi kode frontend; auto-format on save                       |
| **PHPStan (Level 6+)**    | Static analysis PHP untuk menangkap bug sebelum runtime              |
| **Laravel Pint**          | Code formatter PHP mengikuti Laravel coding standard                 |
| **GitHub Actions**        | CI/CD pipeline: lint → test → build → deploy ke Hostinger via SSH    |
| **Vitest 4**              | Unit & integration testing frontend; terintegrasi native dengan Vite |
| **PHPUnit 12 / Pest 4**   | Testing backend; Pest untuk syntax yang lebih readable               |

---

## 3. Auth Strategy

### 3.1 Arsitektur Autentikasi Berlapis

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         AUTH FLOW DIAGRAM                                 │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    LAYER 1: SESSION AUTH                             │  │
│  │                    (Manager / Owner Login)                           │  │
│  │                                                                     │  │
│  │   ┌──────────┐    ┌──────────────┐    ┌────────────────────────┐   │  │
│  │   │  Login   │───▶│ POST /api/   │───▶│ Sanctum Issues         │   │  │
│  │   │  Form    │    │ auth/login   │    │ Personal Access Token  │   │  │
│  │   │ (Email + │    │              │    │ (stored in IndexedDB)  │   │  │
│  │   │ Password)│    │ Validate     │    │                        │   │  │
│  │   └──────────┘    │ Credentials  │    │ Returns: token, user,  │   │  │
│  │                   │ + Check Role │    │ outlet, permissions[]  │   │  │
│  │                   └──────────────┘    └────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                              │                                            │
│                              ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    LAYER 2: FAST PIN AUTH                            │  │
│  │                    (Cashier Quick Switch)                            │  │
│  │                                                                     │  │
│  │   ┌──────────┐    ┌──────────────┐    ┌────────────────────────┐   │  │
│  │   │  PIN     │───▶│ POST /api/   │───▶│ Validated against      │   │  │
│  │   │  Pad     │    │ auth/pin     │    │ bcrypt hash in users   │   │  │
│  │   │  (4-6    │    │              │    │ table; scoped to the   │   │  │
│  │   │  digit)  │    │ Requires     │    │ active outlet session  │   │  │
│  │   └──────────┘    │ active       │    │                        │   │  │
│  │                   │ outlet_id    │    │ Returns: cashier_token │   │  │
│  │                   └──────────────┘    └────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    TOKEN LIFECYCLE                                   │  │
│  │                                                                     │  │
│  │   • Manager token: expires after 12 hours (shift duration)          │  │
│  │   • Cashier PIN token: expires after 8 hours or shift close         │  │
│  │   • Owner token: expires after 24 hours                             │  │
│  │   • All tokens revoked on explicit logout                           │  │
│  │   • Token stored in IndexedDB (not localStorage — XSS mitigation)  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Detail Strategi

#### A. Login Utama (Owner & Manager)

| Aspek             | Detail                                                                           |
| :---------------- | :------------------------------------------------------------------------------- |
| **Metode**        | Email + Password                                                                 |
| **Backend**       | `POST /api/auth/login` → Laravel Sanctum `createToken()`                         |
| **Token Storage** | IndexedDB (via Dexie.js) — lebih aman dari `localStorage` terhadap XSS           |
| **Token Type**    | Bearer Token (dikirim via `Authorization` header)                                |
| **Expiration**    | Owner: 24 jam, Manager: 12 jam                                                   |
| **Scope**         | Token menyimpan `outlet_id` di `tokenable` metadata; digunakan oleh Global Scope |

#### B. Fast PIN Login (Cashier)

| Aspek          | Detail                                                                                  |
| :------------- | :-------------------------------------------------------------------------------------- |
| **Metode**     | 4-6 digit PIN                                                                           |
| **Prasyarat**  | Sesi tablet harus sudah aktif (Manager harus login terlebih dahulu & membuka shift)     |
| **Backend**    | `POST /api/auth/pin` → memvalidasi PIN yang di-hash (bcrypt) di tabel `users`           |
| **Isolasi**    | PIN hanya valid pada `outlet_id` yang sedang aktif; mencegah kasir login ke outlet lain |
| **Expiration** | 8 jam atau saat shift ditutup (mana yang lebih dulu)                                    |
| **UX**         | Numpad UI besar di tengah layar, optimized untuk touch tablet                           |

#### C. Middleware & Guard Stack

```php
// Urutan middleware pada protected routes:
Route::middleware([
    'auth:sanctum',          // 1. Validasi token
    'role:owner|manager',    // 2. Cek role (Spatie)
    'outlet.scope',          // 3. Inject Global Scope outlet_id
    'throttle:60,1',         // 4. Rate limiting
])->group(function () {
    // Protected routes...
});
```

#### D. RBAC Permission Matrix

```
┌──────────────────────────┬───────┬─────────┬─────────┐
│ Permission               │ Owner │ Manager │ Cashier │
├──────────────────────────┼───────┼─────────┼─────────┤
│ view-all-outlets         │  ✅   │   ❌    │   ❌    │
│ manage-roles             │  ✅   │   ❌    │   ❌    │
│ manage-users             │  ✅   │   ❌    │   ❌    │
│ view-global-reports      │  ✅   │   ❌    │   ❌    │
│ manage-products          │  ✅   │   ✅    │   ❌    │
│ manage-inventory         │  ✅   │   ✅    │   ❌    │
│ manage-expenses          │  ✅   │   ✅    │   ❌    │
│ open-close-shift         │  ✅   │   ✅    │   ❌    │
│ approve-void             │  ✅   │   ✅    │   ❌    │
│ view-outlet-reports      │  ✅   │   ✅    │   ❌    │
│ create-transaction       │  ✅   │   ✅    │   ✅    │
│ print-receipt            │  ✅   │   ✅    │   ✅    │
│ apply-voucher            │  ✅   │   ✅    │   ✅    │
│ submit-blind-drop        │  ❌   │   ❌    │   ✅    │
└──────────────────────────┴───────┴─────────┴─────────┘
```

---

## 4. Struktur Folder

### 4.1 Frontend Repository (`pos-coffeeshop-frontend`)

```
pos-coffeeshop-frontend/
├── public/
│   ├── favicon.ico
│   ├── manifest.json                # PWA manifest (name, icons, theme)
│   ├── icons/                       # PWA icons (192x192, 512x512)
│   └── locales/
│       ├── id/
│       │   └── translation.json     # Bahasa Indonesia
│       └── en/
│           └── translation.json     # English
│
├── src/
│   ├── main.tsx                     # Entry point React
│   ├── App.tsx                      # Root component + Router setup
│   ├── app.css                      # Tailwind v4 entry: @import, @theme, @layer
│   ├── vite-env.d.ts                # Vite type declarations
│   │
│   ├── assets/                      # Static assets (images, fonts)
│   │   ├── images/
│   │   └── fonts/
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── ui/                      # ✦ Shadcn UI components (auto-generated via CLI)
│   │   │   ├── button.tsx           #   npx shadcn@latest add button
│   │   │   ├── input.tsx            #   npx shadcn@latest add input
│   │   │   ├── label.tsx
│   │   │   ├── dialog.tsx           #   Digunakan untuk modal (payment, split bill)
│   │   │   ├── sheet.tsx            #   Slide-over panel (cart sidebar di mobile)
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── table.tsx            #   Digunakan untuk inventory, order history
│   │   │   ├── select.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── skeleton.tsx         #   Loading placeholder
│   │   │   ├── scroll-area.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── alert-dialog.tsx     #   Konfirmasi void, logout
│   │   │   ├── form.tsx             #   react-hook-form + zod integration
│   │   │   ├── command.tsx          #   Search/command palette
│   │   │   └── chart.tsx            #   Recharts wrapper dari Shadcn
│   │   │
│   │   ├── custom/                  # ✦ Custom components (bukan dari Shadcn)
│   │   │   ├── NumPad.tsx           #   PIN input pad (touch-optimized)
│   │   │   ├── OfflineBanner.tsx    #   Online/offline status indicator
│   │   │   ├── ReceiptPreview.tsx   #   ESC/POS receipt preview
│   │   │   └── ProfitChart.tsx      #   Dashboard chart compositions
│   │   │
│   │   ├── layout/                  # Layout components
│   │   │   ├── AppLayout.tsx        #   Main app shell (sidebar + content)
│   │   │   ├── Sidebar.tsx          #   Menggunakan Shadcn sidebar pattern
│   │   │   └── Header.tsx
│   │   │
│   │   ├── pos/                     # POS-specific compositions
│   │   │   ├── ProductGrid.tsx      #   Menu grid display (Card + Badge)
│   │   │   ├── CartPanel.tsx        #   Order cart sidebar (Sheet on mobile)
│   │   │   ├── CartItem.tsx
│   │   │   ├── OrderTypeSelector.tsx #   Dine-in / Takeaway (Tabs)
│   │   │   ├── PaymentModal.tsx     #   Payment processing (Dialog)
│   │   │   └── SplitBillModal.tsx
│   │   │
│   │   ├── inventory/               # Inventory compositions
│   │   │   ├── StockTable.tsx       #   Menggunakan Shadcn Table
│   │   │   ├── RecipeEditor.tsx     #   BOM recipe management
│   │   │   └── StockAlertCard.tsx
│   │   │
│   │   ├── finance/                 # Finance compositions
│   │   │   ├── ShiftPanel.tsx       #   Open/Close shift UI
│   │   │   ├── BlindDropForm.tsx    #   Cash counting form
│   │   │   └── ExpenseForm.tsx
│   │   │
│   │   └── auth/
│   │       ├── LoginForm.tsx        #   Email + Password form (Shadcn Form)
│   │       └── PinPad.tsx           #   Fast PIN entry screen (custom NumPad)
│   │
│   ├── pages/                       # Route-level page components
│   │   ├── LoginPage.tsx
│   │   ├── PinLoginPage.tsx
│   │   ├── PosPage.tsx              #   Main cashier screen
│   │   ├── OrderHistoryPage.tsx
│   │   ├── InventoryPage.tsx
│   │   ├── RecipePage.tsx
│   │   ├── ShiftPage.tsx
│   │   ├── ExpensePage.tsx
│   │   ├── DashboardPage.tsx        #   Owner/Manager analytics (Charts)
│   │   ├── UserManagementPage.tsx
│   │   ├── OutletManagementPage.tsx
│   │   ├── ProductManagementPage.tsx
│   │   ├── VoucherPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAuth.ts               #   Auth state & token management
│   │   ├── useOnlineStatus.ts       #   Network connectivity detector
│   │   ├── useCart.ts               #   Cart operations
│   │   ├── usePrinter.ts            #   Bluetooth printer connection
│   │   ├── useSync.ts               #   Background sync trigger & status
│   │   └── usePermission.ts         #   RBAC permission checker
│   │
│   ├── stores/                      # Zustand state stores
│   │   ├── authStore.ts             #   User, token, outlet context
│   │   ├── cartStore.ts             #   Current order/cart state
│   │   ├── shiftStore.ts            #   Active shift state
│   │   ├── syncStore.ts             #   Sync queue status
│   │   └── uiStore.ts               #   UI state (sidebar, modals, theme)
│   │
│   ├── services/                    # API communication layer
│   │   ├── api.ts                   #   Axios instance + interceptors
│   │   ├── authService.ts
│   │   ├── productService.ts
│   │   ├── transactionService.ts
│   │   ├── inventoryService.ts
│   │   ├── shiftService.ts
│   │   ├── expenseService.ts
│   │   ├── reportService.ts
│   │   ├── voucherService.ts
│   │   └── userService.ts
│   │
│   ├── db/                          # IndexedDB / Dexie.js layer
│   │   ├── database.ts              #   Dexie DB schema definition
│   │   ├── syncManager.ts           #   Offline queue & sync logic
│   │   └── productCache.ts          #   Local product catalog cache
│   │
│   ├── lib/                         # Utility functions
│   │   ├── utils.ts                 #   ✦ cn() helper (clsx + tailwind-merge)
│   │   ├── uuid.ts                  #   UUID v7 generator (client-side)
│   │   ├── currency.ts              #   Rupiah formatter
│   │   ├── tax.ts                   #   PB1 10% calculator
│   │   ├── receipt.ts               #   ESC/POS receipt builder
│   │   ├── bluetooth.ts             #   Web Bluetooth helpers
│   │   └── constants.ts             #   App-wide constants
│   │
│   ├── types/                       # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   ├── transaction.ts
│   │   ├── inventory.ts
│   │   ├── shift.ts
│   │   ├── expense.ts
│   │   └── api.ts                   #   API response/request types
│   │
│   └── router/                      # Route configuration
│       ├── index.tsx                #   Route definitions
│       ├── ProtectedRoute.tsx       #   Auth guard wrapper
│       └── RoleGuard.tsx            #   Permission-based route guard
│
├── components.json                  # ✦ Shadcn UI CLI configuration
├── .env.example                     # Environment template
├── eslint.config.js                 # ESLint flat config
├── .prettierrc                      # Prettier configuration
├── index.html                       # HTML entry point
├── tsconfig.json                    # TypeScript config
├── vite.config.ts                   # Vite + PWA plugin + tailwindcss
├── vitest.config.ts                 # Test configuration
└── package.json
```

> **Catatan Shadcn UI:**
>
> - Folder `components/ui/` berisi komponen yang di-generate oleh Shadcn CLI (`npx shadcn@latest add <component>`). Komponen ini **bukan dependency** — kodenya di-copy langsung ke project, sehingga bisa di-customize sepenuhnya.
> - File `components.json` menyimpan konfigurasi Shadcn (alias path, styling preferences, dsb.). Contoh isi:
>
> ```json
> {
>   "$schema": "https://ui.shadcn.com/schema.json",
>   "style": "new-york",
>   "rsc": false,
>   "tsx": true,
>   "tailwind": {
>     "config": "",
>     "css": "src/app.css",
>     "baseColor": "neutral",
>     "cssVariables": true
>   },
>   "aliases": {
>     "components": "@/components",
>     "utils": "@/lib/utils",
>     "ui": "@/components/ui",
>     "lib": "@/lib",
>     "hooks": "@/hooks"
>   }
> }
> ```

---

### 4.2 Backend Repository (`pos-coffeeshop-backend`)

```
pos-coffeeshop-backend/
├── app/
│   ├── Console/
│   │   └── Commands/
│   │       ├── DailyBackupCommand.php       # Scheduled DB backup
│   │       ├── PurgeOldBackupsCommand.php    # Cleanup backups > 7 days
│   │       └── RecalculateStockCommand.php   # Nightly stock reconciliation
│   │
│   ├── Enums/                               # PHP 8.4 backed enums
│   │   ├── OrderType.php                    # DineIn, Takeaway
│   │   ├── PaymentMethod.php                # Cash, QRIS
│   │   ├── TransactionStatus.php            # Completed, Voided
│   │   ├── ShiftStatus.php                  # Open, Closed
│   │   └── ExpenseCategory.php              # Salary, Rent, Electricity...
│   │
│   ├── Events/
│   │   ├── TransactionCompleted.php         # Fired after tx sync
│   │   └── ShiftClosed.php                  # Fired on shift close
│   │
│   ├── Exceptions/
│   │   ├── Handler.php
│   │   ├── InsufficientStockException.php
│   │   └── ShiftNotOpenException.php
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginController.php       # Email + password login
│   │   │   │   ├── PinAuthController.php     # Fast PIN authentication
│   │   │   │   └── LogoutController.php
│   │   │   │
│   │   │   ├── Api/
│   │   │   │   ├── ProductController.php
│   │   │   │   ├── CategoryController.php
│   │   │   │   ├── TransactionController.php  # Sync endpoint + CRUD
│   │   │   │   ├── InventoryController.php
│   │   │   │   ├── RecipeController.php       # BOM management
│   │   │   │   ├── ShiftController.php
│   │   │   │   ├── ExpenseController.php
│   │   │   │   ├── VoucherController.php
│   │   │   │   ├── ReportController.php       # Dashboard aggregations
│   │   │   │   ├── OutletController.php
│   │   │   │   ├── UserController.php
│   │   │   │   └── SyncController.php         # Batch sync from offline
│   │   │   └── Controller.php                 # Base controller
│   │   │
│   │   ├── Middleware/
│   │   │   ├── OutletScope.php               # Inject outlet_id Global Scope
│   │   │   ├── EnsureShiftOpen.php           # Block POS if no active shift
│   │   │   └── ForceJsonResponse.php         # Always return JSON
│   │   │
│   │   ├── Requests/                         # Form Request validation
│   │   │   ├── Auth/
│   │   │   │   ├── LoginRequest.php
│   │   │   │   └── PinLoginRequest.php
│   │   │   ├── StoreTransactionRequest.php
│   │   │   ├── SyncTransactionRequest.php
│   │   │   ├── StoreProductRequest.php
│   │   │   ├── StoreExpenseRequest.php
│   │   │   ├── OpenShiftRequest.php
│   │   │   ├── CloseShiftRequest.php
│   │   │   └── StoreVoucherRequest.php
│   │   │
│   │   └── Resources/                       # API Resources (JSON transform)
│   │       ├── ProductResource.php
│   │       ├── TransactionResource.php
│   │       ├── InventoryResource.php
│   │       ├── ShiftResource.php
│   │       ├── ExpenseResource.php
│   │       ├── ReportResource.php
│   │       ├── OutletResource.php
│   │       └── UserResource.php
│   │
│   ├── Jobs/                                 # Queue jobs (async processing)
│   │   ├── DeductStockJob.php                # Auto-deduct via BOM
│   │   ├── ProcessTransactionSyncJob.php     # Handle offline batch sync
│   │   └── GenerateBackupJob.php
│   │
│   ├── Listeners/
│   │   ├── DeductStockOnTransaction.php      # Listens TransactionCompleted
│   │   └── LogShiftCloseSummary.php          # Listens ShiftClosed
│   │
│   ├── Models/
│   │   ├── Concerns/                         # Shared model traits
│   │   │   ├── HasUuid.php                   # UUID auto-generation trait
│   │   │   ├── BelongsToOutlet.php           # outlet_id relationship trait
│   │   │   └── Auditable.php                 # Auto audit log trait
│   │   ├── User.php
│   │   ├── Outlet.php
│   │   ├── Product.php
│   │   ├── Category.php
│   │   ├── RawMaterial.php
│   │   ├── ProductRecipe.php                 # BOM pivot (product ↔ material)
│   │   ├── Transaction.php
│   │   ├── TransactionItem.php
│   │   ├── Shift.php
│   │   ├── ShiftCount.php                    # Blind drop denominations
│   │   ├── Expense.php
│   │   ├── Voucher.php
│   │   └── AuditLog.php
│   │
│   ├── Observers/
│   │   ├── TransactionObserver.php           # Log creation, void actions
│   │   ├── ProductObserver.php               # Log price changes
│   │   └── UserObserver.php                  # Log role changes
│   │
│   ├── Policies/                             # Authorization policies
│   │   ├── TransactionPolicy.php
│   │   ├── ProductPolicy.php
│   │   ├── InventoryPolicy.php
│   │   ├── ShiftPolicy.php
│   │   ├── ExpensePolicy.php
│   │   └── OutletPolicy.php
│   │
│   ├── Scopes/
│   │   └── OutletScope.php                   # Global Scope: WHERE outlet_id = ?
│   │
│   └── Services/                             # Business logic layer
│       ├── TransactionService.php            # Order creation, void, tax calc
│       ├── StockService.php                  # BOM deduction logic
│       ├── ShiftService.php                  # Open/close, cash reconciliation
│       ├── ReportService.php                 # Aggregation queries (Revenue, HPP, OPEX)
│       ├── SyncService.php                   # Offline-to-online merge logic
│       └── VoucherService.php                # Validate & apply discounts
│
├── bootstrap/
│   └── app.php
│
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── backup.php                            # spatie/laravel-backup config
│   ├── cors.php                              # CORS whitelist for frontend
│   ├── permission.php                        # spatie/laravel-permission config
│   ├── sanctum.php
│   └── pos.php                               # Custom: tax rate, shift duration, etc.
│
├── database/
│   ├── factories/                            # Model factories for testing
│   │   ├── UserFactory.php
│   │   ├── ProductFactory.php
│   │   ├── TransactionFactory.php
│   │   └── OutletFactory.php
│   │
│   ├── migrations/
│   │   ├── 0001_create_outlets_table.php
│   │   ├── 0002_create_users_table.php
│   │   ├── 0003_create_categories_table.php
│   │   ├── 0004_create_products_table.php
│   │   ├── 0005_create_raw_materials_table.php
│   │   ├── 0006_create_product_recipes_table.php
│   │   ├── 0007_create_shifts_table.php
│   │   ├── 0008_create_transactions_table.php
│   │   ├── 0009_create_transaction_items_table.php
│   │   ├── 0010_create_expenses_table.php
│   │   ├── 0011_create_vouchers_table.php
│   │   ├── 0012_create_shift_counts_table.php
│   │   ├── 0013_create_audit_logs_table.php
│   │   └── 0014_create_permission_tables.php
│   │
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── RolePermissionSeeder.php           # Seed roles & permissions
│       ├── OutletSeeder.php
│       └── DemoDataSeeder.php                 # Sample products, categories
│
├── routes/
│   ├── api.php                                # All API route definitions
│   ├── console.php                            # Scheduled commands
│   └── channels.php
│
├── storage/
│   └── backups/                               # Auto-backup destination
│
├── tests/
│   ├── Feature/
│   │   ├── Auth/
│   │   │   ├── LoginTest.php
│   │   │   └── PinAuthTest.php
│   │   ├── Transaction/
│   │   │   ├── CreateTransactionTest.php
│   │   │   ├── VoidTransactionTest.php
│   │   │   └── SyncTransactionTest.php
│   │   ├── Inventory/
│   │   │   └── StockDeductionTest.php
│   │   ├── Shift/
│   │   │   ├── OpenShiftTest.php
│   │   │   └── CloseShiftTest.php
│   │   └── OutletScopeTest.php                # Data isolation tests
│   └── Unit/
│       ├── TaxCalculationTest.php
│       ├── StockServiceTest.php
│       └── VoucherServiceTest.php
│
├── .env.example
├── artisan
├── composer.json
├── phpstan.neon                                # PHPStan config
├── phpunit.xml
└── pint.json                                   # Laravel Pint config
```

---

## 5. Appendix

### 5.1 Key Design Decisions

| Keputusan                                               | Alasan                                                                                                                                                                                                                                                                                      |
| :------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Tailwind CSS v4 (bukan vanilla CSS)**                 | Utility-first approach mempercepat development UI secara drastis. Tailwind v4 menggunakan Oxide engine (Rust) untuk build ~10x lebih cepat, konfigurasi langsung di CSS via `@theme` tanpa file `tailwind.config.js` terpisah. Performa output CSS lebih kecil karena tree-shaking otomatis |
| **Shadcn UI (bukan component library seperti MUI/Ant)** | Komponen tidak di-install sebagai npm dependency, melainkan di-copy ke source code. Ini memberikan kontrol penuh untuk customization tanpa terikat breaking changes dari library. Berbasis Radix primitives yang sudah accessible (WAI-ARIA compliant) out-of-the-box                       |
| **UUID v7 (client-generated)**                          | Memungkinkan pembuatan ID di tablet offline tanpa konflik saat sync. UUID v7 time-ordered sehingga performa index MySQL tetap optimal dibanding UUID v4                                                                                                                                     |
| **Sanctum Token (bukan session cookie)**                | SPA yang di-serve dari domain berbeda (atau PWA) lebih cocok dengan token-based auth. Tidak butuh state di server                                                                                                                                                                           |
| **Database Queue Driver**                               | Hostinger tidak support Redis. Queue berbasis tabel `jobs` MySQL cukup untuk volume coffee shop (< 1000 tx/hari)                                                                                                                                                                            |
| **Dexie.js (bukan raw IndexedDB)**                      | API IndexedDB native sangat verbose. Dexie menyediakan API promise-based yang bersih dan fitur live query                                                                                                                                                                                   |
| **Zustand (bukan Redux)**                               | Boilerplate minimal, bundle size ~1KB. Untuk aplikasi POS mid-size, Redux terlalu overkill                                                                                                                                                                                                  |
| **Service Layer Pattern**                               | Business logic diisolasi di `app/Services/` agar controller tetap tipis dan logic bisa di-reuse di Jobs/Commands                                                                                                                                                                            |
| **Soft Deletes pada Master Data**                       | Menjaga integritas relasi pada transaksi historis. Produk dihapus di UI tapi tetap ada di DB untuk laporan                                                                                                                                                                                  |

### 5.2 Deployment Architecture (Hostinger)

```
Hostinger Business Server
├── /home/user/public_html/           # React build output (SPA)
│   ├── index.html
│   ├── assets/
│   └── sw.js                         # Service Worker
│
├── /home/user/api.domain.com/        # Laravel (subdomain / subfolder)
│   ├── public/                       # Laravel public dir (document root)
│   └── ...                           # Laravel app files
│
├── /home/user/backups/               # Auto-backup storage
│
└── Cron Jobs:
    ├── * * * * *   php artisan schedule:run    # Laravel Scheduler (per menit)
    ├── 0 2 * * *   php artisan backup:run      # Daily backup jam 02:00
    └── 0 3 * * *   php artisan backup:clean    # Cleanup old backups jam 03:00
```

### 5.3 API Endpoint Overview

Terdapat pada file `api-spec.yaml`
