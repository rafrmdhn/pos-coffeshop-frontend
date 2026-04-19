# Frontend Development Task List

**Proyek:** POS Multi-Outlet Coffee Shop — React Frontend  
**Tech Stack:** React 19.2, Vite 8, TypeScript 6, Tailwind CSS v4, Shadcn UI, Zustand 5, Dexie.js 4, TanStack Query 5, React Router 7  
**Estimasi Total:** ~95 tasks × ~30 menit = ~47 jam kerja  
**Referensi:** PRD v1.0, System Architecture v1.0, API Spec v1.0

---

## Legenda

- `[ ]` Belum dikerjakan
- `[/]` Sedang dikerjakan
- `[x]` Selesai
- `⚠ BLOCKING` — Task lain bergantung pada ini
- `← depends on #X.Y` — Memerlukan task X.Y selesai terlebih dahulu
- `📡 POST /api/...` — Endpoint API yang dikonsumsi

## Catatan Upgrade Stack (Stable Terbaru)

- Gunakan pola object signature untuk semua hooks TanStack Query v5 (`useQuery({ queryKey, queryFn })`), hindari signature lama berbasis positional args.
- Terapkan konvensi React Router v7 secara konsisten pada import dan konfigurasi route (hindari campur style API lama vs baru).
- Recharts 3 perlu validasi ulang komponen chart kustom (tooltip/legend/label) karena ada perubahan internal state handling.
- ESLint 9 gunakan flat config (`eslint.config.js`) sebagai default; pastikan plugin/lint scripts mengikuti format ini.
- Vitest 4 gunakan setup terbaru untuk coverage (`@vitest/coverage-v8`) dan sesuaikan opsi yang sudah deprecated.

---

## Phase 1: Project Foundation `⚠ BLOCKING`

### 1. Inisialisasi Project

- [ ] **1.1** Scaffold Vite 8 + React 19.2 + TypeScript 6 (`npx create-vite@latest ./ --template react-ts`), tambahkan path aliases `@/` di `tsconfig.json` dan `vite.config.ts`
- [ ] **1.2** Install & konfigurasi Tailwind CSS v4 (`@tailwindcss/vite`), buat `app.css` dengan base layer, import Google Font (Inter) ← depends on #1.1
- [ ] **1.3** Install & konfigurasi Shadcn UI — init `components.json` (New York style, `@/components/ui`), buat `lib/utils.ts` dengan `cn()` helper (clsx + tailwind-merge) ← depends on #1.2
- [ ] **1.4** Install Shadcn base components: `button`, `input`, `label`, `card`, `dialog`, `dropdown-menu`, `table`, `badge`, `toast`, `skeleton`, `separator`, `avatar`, `sheet`, `tabs`, `select`, `command`, `popover` ← depends on #1.3
- [ ] **1.5** Install core dependencies (pin major terbaru stabil): `react-router@7` (atau `react-router-dom@7` sesuai mode app), `@tanstack/react-query@5`, `zustand@5`, `dexie@4`, `lucide-react`, `axios`, `date-fns@4`, `recharts@3`, `zod@4`, `react-hook-form@7`, `@hookform/resolvers` ← depends on #1.1

### 2. Design System & Theme

- [ ] **2.1** Definisikan CSS variables di `app.css`: color palette (coffee-warm theme), radius, spacing. Setup light/dark mode toggle ← depends on #1.2
- [ ] **2.2** Buat komponen `ThemeProvider` dengan Zustand store untuk persist dark/light mode ke localStorage ← depends on #2.1
- [ ] **2.3** Buat custom Shadcn variants: `Button` (primary/destructive/success), `Badge` (status colors: completed/voided/open/closed/low-stock) ← depends on #1.4

### 3. API Layer `⚠ BLOCKING`

- [ ] **3.1** Buat Axios instance (`lib/axios.ts`): base URL dari env, interceptor attach Bearer token dari auth store, interceptor handle 401 (auto logout) & 422 (parse validation errors) ← depends on #1.5
- [ ] **3.2** Setup TanStack Query provider (`QueryClientProvider`) di `main.tsx`, konfigurasi default options (staleTime: 5min, retry: 2, refetchOnWindowFocus) ← depends on #1.5
- [ ] **3.3** Buat TypeScript types/interfaces untuk semua API schemas: `Outlet`, `User`, `Category`, `Product`, `RawMaterial`, `Transaction`, `Shift`, `Expense`, `Voucher`, `Role`, `Permission`, `AuditLog`, `PaginationMeta`, `ApiResponse<T>` (`types/api.ts`) ← depends on #1.5
- [ ] **3.4** Buat API service files terstruktur per module: `services/auth.ts`, `services/outlets.ts`, `services/users.ts`, `services/products.ts`, dst. Setiap file export fungsi yang memanggil Axios ← depends on #3.1, #3.3

### 4. Routing & Layout `⚠ BLOCKING`

- [ ] **4.1** Setup React Router 7: definisikan route structure — public routes (`/login`, `/pin`) dan protected routes (`/dashboard`, `/pos`, `/products`, dll), lalu pastikan style import/API v7 konsisten di seluruh modul routing ← depends on #1.5
- [ ] **4.2** Buat `ProtectedRoute` wrapper — cek auth state dari Zustand, redirect ke `/login` jika belum login ← depends on #4.1, #5.1
- [ ] **4.3** Buat `PermissionGate` component — render children hanya jika user memiliki permission yang diperlukan, Otherwise render "Access Denied" ← depends on #5.1
- [ ] **4.4** Buat `DashboardLayout` — sidebar navigation (collapsible), top bar (user info + outlet name + dark mode toggle), content area. Responsive: sidebar jadi Sheet di mobile ← depends on #1.4, #4.1
- [ ] **4.5** Buat `Sidebar` component — navigation links grouped by section (POS, Manajemen, Laporan, Pengaturan). Tampilkan/sembunyikan menu berdasarkan permissions. Active state indicator ← depends on #4.4, #5.1
- [ ] **4.6** Buat `TopBar` component — outlet selector dropdown (Owner only), user avatar + dropdown (Profile, Logout), notification bell (low stock alerts) ← depends on #4.4

### 5. Auth Store `⚠ BLOCKING`

- [ ] **5.1** Buat Zustand store `useAuthStore` — state: `user`, `token`, `permissions`, `outlet`. Actions: `setAuth()`, `logout()`, `hasPermission()`, `hasRole()`. Persist ke IndexedDB (bukan localStorage untuk mitigasi XSS) ← depends on #1.5
- [ ] **5.2** Buat Dexie database schema (`lib/db.ts`) — tabel: `auth` (token store), `offlineTransactions` (pending sync), `settings` (app config) ← depends on #1.5

---

## Phase 2: Authentication

### 6. Login Page

- [ ] **6.1** Buat halaman `/login` — form email + password, validasi dengan Zod + react-hook-form, loading state, error display. Logo & branding coffee shop di atasnya ← depends on #4.1, #2.1
  - 📡 `POST /api/auth/login`
- [ ] **6.2** Handle login success — simpan token + user + permissions ke `useAuthStore`, redirect ke `/dashboard` (Owner/Manager) atau `/pos` (Cashier) ← depends on #6.1, #5.1
- [ ] **6.3** Handle login errors — tampilkan "Email atau password salah" (401), "Akun dinonaktifkan", rate limit warning (429) ← depends on #6.1

### 7. PIN Login Page

- [ ] **7.1** Buat halaman `/pin` — NumPad component (0-9 + backspace + clear), PIN display dots (4-6 digit), outlet info display ← depends on #4.1, #2.1
  - 📡 `POST /api/auth/pin`
- [ ] **7.2** Buat custom `NumPad` component — grid layout 3×4, haptic feedback (vibrate API), auto-submit saat PIN lengkap ← depends on #7.1
- [ ] **7.3** Handle PIN login flow — validate PIN length, submit, show error animation (shake) jika gagal, redirect ke `/pos` jika berhasil ← depends on #7.1, #5.1

### 8. Logout & Session

- [ ] **8.1** Buat logout handler — revoke token via API, clear Zustand store, clear IndexedDB auth entry, redirect ke `/login` ← depends on #5.1
  - 📡 `POST /api/auth/logout`
- [ ] **8.2** Buat auto-logout — detect token expiry (decode expires_at), show warning dialog 5 menit sebelum expire, auto-logout saat expire ← depends on #8.1

---

## Phase 3: Dashboard

### 9. Dashboard Page (Owner/Manager)

- [ ] **9.1** Buat halaman `/dashboard` — layout: 4 KPI cards atas (Revenue, HPP, OPEX, Laba Bersih), chart area bawah ← depends on #4.4
  - 📡 `GET /api/reports/dashboard`
- [ ] **9.2** Buat `KPICard` component — icon, label, value (format Rupiah), percentage change vs period sebelumnya, loading skeleton ← depends on #9.1
- [ ] **9.3** Buat date range picker — preset (Hari Ini, 7 Hari, 30 Hari, Bulan Ini, Custom), trigger refetch dashboard data ← depends on #9.1
- [ ] **9.4** Buat chart "Revenue Harian" — line/bar chart menggunakan Recharts, tooltip, responsive ← depends on #9.1
- [ ] **9.5** Buat chart "Revenue per Metode Pembayaran" — donut/pie chart (Cash vs QRIS) ← depends on #9.1
- [ ] **9.6** Buat section "Top 5 Produk" — horizontal bar chart atau ranked list dengan badge ← depends on #9.1
- [ ] **9.7** Buat section "Ringkasan Pengeluaran" — stacked bar chart per kategori OPEX ← depends on #9.1
- [ ] **9.8** Outlet selector untuk Owner — dropdown di atas dashboard untuk switch tampilan per outlet atau "Semua Outlet" ← depends on #9.1, #4.6

---

## Phase 4: POS (Point of Sale) — Core Feature

### 10. POS Layout

- [ ] **10.1** Buat halaman `/pos` — split layout: product grid (kiri ~60%), order panel (kanan ~40%). Full-height, no scroll pada outer container. Responsive: stack di mobile ← depends on #4.4
- [ ] **10.2** Buat Zustand store `useCartStore` — state: `items[]`, `orderType`, `voucherCode`, `notes`. Actions: `addItem()`, `removeItem()`, `updateQty()`, `setOrderType()`, `clearCart()`. Tidak perlu persist ← depends on #1.5

### 11. Product Grid (POS)

- [ ] **11.1** Buat category tabs/pills — horizontal scroll, "Semua" tab default, active state styling ← depends on #10.1
  - 📡 `GET /api/categories?is_active=true`
- [ ] **11.2** Buat product grid — card per produk (gambar, nama, harga format Rupiah), grid 3-4 kolom. Click → tambah ke cart. Disabled overlay jika stok habis ← depends on #10.1
  - 📡 `GET /api/products?is_active=true`
- [ ] **11.3** Buat search bar produk — search by nama, debounced 300ms, filter lokal (client-side dari data yang sudah di-fetch) ← depends on #11.2

### 12. Order Panel (POS)

- [ ] **12.1** Buat order type toggle — "Dine In" / "Takeaway" switch di atas panel ← depends on #10.1
- [ ] **12.2** Buat cart item list — nama produk, harga, qty stepper (+/-), subtotal per item, swipe/button untuk hapus, catatan per item (inline input) ← depends on #10.2
- [ ] **12.3** Buat voucher input — text input + "Apply" button, hit validate endpoint, show diskon yang diberikan atau error message ← depends on #12.2
  - 📡 `POST /api/vouchers/validate`
- [ ] **12.4** Buat order summary — Subtotal, Diskon (jika voucher), PB1 10%, Grand Total. Auto-recalculate on cart change ← depends on #12.2
- [ ] **12.5** Buat "Bayar" button — disabled jika cart kosong, show payment dialog on click ← depends on #12.4

### 13. Payment Flow

- [ ] **13.1** Buat `PaymentDialog` — pilih metode: Cash atau QRIS. Untuk Cash: input "Uang Diterima" + kalkulasi kembalian real-time. Untuk QRIS: input referensi opsional ← depends on #12.5
- [ ] **13.2** Buat `NumPadPayment` component — numpad khusus untuk input nominal cash, quick amount buttons (Rp 50K, 100K, uang pas) ← depends on #13.1
- [ ] **13.3** Submit transaksi — kirim ke API, handle loading state, clear cart on success ← depends on #13.1
  - 📡 `POST /api/transactions`
- [ ] **13.4** Buat `ReceiptDialog` — tampilkan struk digital setelah transaksi sukses: outlet info, items, totals, pembayaran, nomor transaksi. Tombol "Cetak" (window.print) + "Transaksi Baru" ← depends on #13.3
- [ ] **13.5** Handle split payment — tab Cash + QRIS, masing-masing input amount, validasi total = grand_total ← depends on #13.1

### 14. Offline Mode (POS)

- [ ] **14.1** Buat `useOnlineStatus` hook — detect navigator.onLine, show `OfflineBanner` component (kuning) fixed di atas halaman POS ← depends on #10.1
- [ ] **14.2** Implement offline transaction save — jika offline, simpan transaksi ke Dexie `offlineTransactions` table dengan UUID v7 client-generated, source: "offline" ← depends on #5.2, #13.3
- [ ] **14.3** Buat `SyncService` — saat kembali online, auto-detect, batch kirim semua transaksi offline ke sync endpoint. Show progress toast ← depends on #14.2
  - 📡 `POST /api/transactions/sync`
- [ ] **14.4** Buat `OfflineIndicator` di sidebar/topbar — badge merah dengan jumlah transaksi pending sync ← depends on #14.2
- [ ] **14.5** Cache products & categories di IndexedDB (Dexie) — saat online, fetch dan cache. Saat offline, baca dari cache ← depends on #5.2, #11.2

---

## Phase 5: Manajemen Data (CRUD Pages)

### 15. Product Management

- [ ] **15.1** Buat halaman `/products` — tabel (Shadcn DataTable): kolom Gambar, Nama, Kategori, Harga, SKU, Status (badge), Actions. Pagination, search, filter by category ← depends on #4.4
  - 📡 `GET /api/products`
- [ ] **15.2** Buat `ProductFormDialog` — dialog form: nama, kategori (select dari API), harga (format Rupiah), SKU, deskripsi (textarea), gambar (file upload + preview), track_stock toggle, is_active toggle. Validasi Zod ← depends on #15.1
  - 📡 `POST /api/products` · `PUT /api/products/{id}`
- [ ] **15.3** Handle delete produk — confirm dialog "Produk akan dihapus (soft delete)", mutate, invalidate query ← depends on #15.1
  - 📡 `DELETE /api/products/{id}`
- [ ] **15.4** Buat reusable `DataTable` component — wrapper Shadcn Table + pagination controls + search bar + column sorting + empty state + loading skeleton. Reuse di semua halaman CRUD ← depends on #1.4

### 16. Category Management

- [ ] **16.1** Buat halaman `/categories` — tabel sederhana: Nama, Slug, Jumlah Produk, Urutan, Status, Actions. Drag-and-drop reorder (opsional) ← depends on #15.4
  - 📡 `GET /api/categories?with_count=true`
- [ ] **16.2** Buat `CategoryFormDialog` — nama, deskripsi, sort_order, is_active. Simple form ← depends on #16.1
  - 📡 `POST /api/categories` · `PUT /api/categories/{id}`
- [ ] **16.3** Handle delete kategori — show error toast jika masih ada produk di kategori ← depends on #16.1
  - 📡 `DELETE /api/categories/{id}`

### 17. Inventory (Raw Materials)

- [ ] **17.1** Buat halaman `/inventory` — tabel: Nama, Satuan, Stok Saat Ini, Min Stok, Harga/unit, Status (badge: "Low Stock" merah jika <= min_stock). Filter low_stock toggle ← depends on #15.4
  - 📡 `GET /api/inventory`
- [ ] **17.2** Buat `RawMaterialFormDialog` — nama, satuan (select: gram/ml/pcs/kg/liter), stok awal, min_stock, cost_per_unit. Validasi ← depends on #17.1
  - 📡 `POST /api/inventory` · `PUT /api/inventory/{id}`
- [ ] **17.3** Buat "Restok" quick action — dialog khusus untuk update stok: current_stock saat ini + input stok baru, auto-update `last_restock_at` ← depends on #17.1
  - 📡 `PUT /api/inventory/{id}`
- [ ] **17.4** Handle delete bahan baku — Show error jika masih digunakan di resep aktif ← depends on #17.1
  - 📡 `DELETE /api/inventory/{id}`

### 18. Recipe / BOM Management

- [ ] **18.1** Buat recipe editor di product detail atau sebagai sub-page `/products/{id}/recipe` — list bahan baku + qty per porsi + estimated cost. Total HPP, margin, margin % ← depends on #15.1
  - 📡 `GET /api/products/{id}/recipes`
- [ ] **18.2** Buat "Edit Resep" mode — tambah/hapus bahan baku (select dari inventory list), input quantity_needed. Save = sync all ingredients ← depends on #18.1
  - 📡 `PUT /api/products/{id}/recipes`
  - 📡 `GET /api/inventory` (untuk dropdown bahan baku)

---

## Phase 6: Operasional

### 19. Shift Management

- [ ] **19.1** Buat shift indicator di TopBar — badge "Shift Aktif" (hijau) atau "Tidak Ada Shift" (merah) ← depends on #4.6
- [ ] **19.2** Buat `OpenShiftDialog` — input "Modal Awal" (Rupiah), tombol "Buka Shift". Tampilkan error 409 jika sudah ada shift aktif ← depends on #19.1
  - 📡 `POST /api/shifts/open`
- [ ] **19.3** Buat `CloseShiftDialog` — blind drop form: tabel denominasi (100K, 50K, 20K, 10K, 5K, 2K, 1K, 500, 200, 100) × qty input → subtotal per row → total. Summary: expected vs actual vs selisih ← depends on #19.1
  - 📡 `POST /api/shifts/close`
- [ ] **19.4** Buat halaman `/shifts` — riwayat shift: tabel (Tanggal, Dibuka Oleh, Ditutup Oleh, Modal, Total Revenue, Selisih, Status). Click row → detail ← depends on #15.4
  - 📡 `GET /api/shifts`
- [ ] **19.5** Buat halaman `/shifts/{id}` — detail shift: summary cards, tabel denominasi blind drop, list transaksi selama shift ← depends on #19.4
  - 📡 `GET /api/shifts/{id}`

### 20. Expense Management

- [ ] **20.1** Buat halaman `/expenses` — tabel: Tanggal, Kategori (badge), Deskripsi, Nominal (format Rupiah), Dicatat Oleh, Referensi. Filter: kategori, date range ← depends on #15.4
  - 📡 `GET /api/expenses`
- [ ] **20.2** Buat `ExpenseFormDialog` — kategori (select: salary/rent/utilities/supplies/maintenance/marketing/other), deskripsi, nominal, tanggal, ref number, catatan ← depends on #20.1
  - 📡 `POST /api/expenses` · `PUT /api/expenses/{id}`
- [ ] **20.3** Handle delete expense — confirm dialog + mutate ← depends on #20.1
  - 📡 `DELETE /api/expenses/{id}`

### 21. Voucher Management

- [ ] **21.1** Buat halaman `/vouchers` — tabel: Kode, Nama, Tipe (%), Nilai, Min Belanja, Penggunaan (x/limit), Berlaku, Status (badge: active/expired/habis). Filter: is_active ← depends on #15.4
  - 📡 `GET /api/vouchers`
- [ ] **21.2** Buat `VoucherFormDialog` — kode, nama, tipe diskon (radio: percentage/fixed), nilai diskon, min_purchase, max_discount (conditional), usage_limit, valid_from/until (date pickers), outlet_id (select, nullable = semua), is_active ← depends on #21.1
  - 📡 `POST /api/vouchers` · `PUT /api/vouchers/{id}`
- [ ] **21.3** Handle delete voucher — confirm + soft delete ← depends on #21.1
  - 📡 `DELETE /api/vouchers/{id}`

### 22. Transaction History

- [ ] **22.1** Buat halaman `/transactions` — tabel: No. Transaksi, Tanggal, Tipe (dine_in/takeaway badge), Items (count), Total (Rp), Pembayaran, Kasir, Status (badge). Filter: status, type, date range, cashier ← depends on #15.4
  - 📡 `GET /api/transactions`
- [ ] **22.2** Buat `TransactionDetailDialog` — detail lengkap: header (nomor, tanggal, kasir, shift), tabel items (nama, harga, qty, subtotal), tabel payments, voucher info, void info (jika voided) ← depends on #22.1
  - 📡 `GET /api/transactions/{id}`
- [ ] **22.3** Buat void flow — tombol "Void" pada transaksi completed, dialog input alasan (min 5 karakter), confirm, show result. Badge berubah menjadi "Voided" merah ← depends on #22.2
  - 📡 `POST /api/transactions/{id}/void`

---

## Phase 7: Admin & Settings (Owner Only)

### 23. Outlet Management

- [ ] **23.1** Buat halaman `/outlets` — tabel: Nama, Alamat, Telepon, Timezone, Status (badge), Actions. PermissionGate: `view-all-outlets` ← depends on #15.4, #4.3
  - 📡 `GET /api/outlets`
- [ ] **23.2** Buat `OutletFormDialog` — nama, alamat, telepon, NPWP, timezone (select), receipt_header (textarea), receipt_footer (textarea), is_active. Digunakan untuk create & edit ← depends on #23.1
  - 📡 `POST /api/outlets` · `PUT /api/outlets/{id}`

### 24. User Management

- [ ] **24.1** Buat halaman `/users` — tabel: Nama, Email, Role (badge), Outlet, Status (active/inactive badge), Actions. Filter: role, outlet, is_active. PermissionGate: `manage-users` ← depends on #15.4, #4.3
  - 📡 `GET /api/users`
- [ ] **24.2** Buat `UserFormDialog` — nama, email, password (+ konfirmasi), telepon, role (select: owner/manager/cashier + custom roles), outlet_id (select, conditional required), PIN (conditional, required if cashier), is_active toggle ← depends on #24.1
  - 📡 `POST /api/users` · `PUT /api/users/{id}`
  - 📡 `GET /api/roles` (untuk populate role select)
  - 📡 `GET /api/outlets` (untuk populate outlet select)
- [ ] **24.3** Handle delete user — confirm dialog, soft delete ← depends on #24.1
  - 📡 `DELETE /api/users/{id}`

### 25. Role & Permission Management

- [ ] **25.1** Buat halaman `/roles` — tabel: Nama Role, Jumlah Permission, Jumlah User, Tipe (badge: "Bawaan"/"Custom"), Actions. PermissionGate: `manage-roles` ← depends on #15.4, #4.3
  - 📡 `GET /api/roles?with_count=true`
- [ ] **25.2** Buat `RoleFormDialog` — nama role, permission picker: grouped checkboxes per module (Produk, Transaksi, Inventori, Laporan, dll). "Select All" per group. Preview ringkasan di sidebar dialog ← depends on #25.1
  - 📡 `POST /api/roles` · `PUT /api/roles/{id}`
  - 📡 `GET /api/permissions?group_by=true`
- [ ] **25.3** Handle delete role — confirm, block jika built-in atau masih ada user ← depends on #25.1
  - 📡 `DELETE /api/roles/{id}`

### 26. Audit Log Viewer

- [ ] **26.1** Buat halaman `/audit-logs` — tabel: Waktu, User, Aksi (badge), Entity, Detail Perubahan (truncated), Outlet. Sorted desc by date. Filter: user, action, entity type, date range ← depends on #15.4
  - 📡 `GET /api/audit-logs`
- [ ] **26.2** Buat `AuditLogDetailDialog` — detail lengkap: user info, aksi, entity link, timestamp, IP address, user agent. Diff viewer: old_values vs new_values side-by-side (atau highlighted JSON) ← depends on #26.1
  - 📡 `GET /api/audit-logs/{id}`

---

## Phase 8: Reports

### 27. Sales Report

- [ ] **27.1** Buat halaman `/reports/sales` — date range picker + filters (order_type, payment_method). Summary cards (Total Revenue, Jumlah Transaksi, Rata-rata, Dine-in vs Takeaway) ← depends on #4.4
  - 📡 `GET /api/reports/sales`
- [ ] **27.2** Buat tabel transaksi detail — paginated list, export CSV/Excel button (generate client-side dari data) ← depends on #27.1
- [ ] **27.3** Buat chart "Distribusi per Jam" — bar chart horizontal (jam 06-22), highlight peak hours ← depends on #27.1

### 28. Inventory Report

- [ ] **28.1** Buat halaman `/reports/inventory` — summary cards (Total Bahan, Low Stock Alert, Nilai Inventori). Filter: date range, low_stock_only ← depends on #4.4
  - 📡 `GET /api/reports/inventory`
- [ ] **28.2** Buat tabel bahan baku — nama, stok, used in period, nilai stok, status (merah jika low stock). Sortable columns ← depends on #28.1
- [ ] **28.3** Low stock alerts — notification bell di TopBar populate dari inventory data where `is_low_stock = true`, link ke halaman inventory ← depends on #28.1, #4.6

---

## Phase 9: PWA & Polish

### 29. Progressive Web App

- [ ] **29.1** Buat `manifest.json` — app name "Kopi Nusantara POS", short_name, icons (192px, 512px), theme_color, background_color, display: "standalone", start_url ← depends on #1.1
- [ ] **29.2** Install & konfigurasi `vite-plugin-pwa` (seri 1.x, kompatibel Vite 8) — service worker strategy (NetworkFirst untuk API, CacheFirst untuk assets), precache critical routes ← depends on #29.1
- [ ] **29.3** Buat Install PWA prompt — "Instal Aplikasi" banner/dialog jika belum di-install, gunakan `beforeinstallprompt` event ← depends on #29.2

### 30. UI Polish & UX

- [ ] **30.1** Buat reusable `EmptyState` component — illustration + message + CTA button. Gunakan di semua halaman list saat data kosong ← depends on #1.4
- [ ] **30.2** Buat reusable `ConfirmDialog` component — title, message, variant (danger/warning/info), confirm/cancel buttons. Gunakan untuk semua delete/void actions ← depends on #1.4
- [ ] **30.3** Buat `PageHeader` component — title, description, breadcrumbs, action buttons (e.g. "Tambah Produk"). Reuse di semua halaman ← depends on #1.4
- [ ] **30.4** Implement loading skeletons — Skeleton variants untuk cards, table rows, charts. Gunakan di semua halaman sebagai loading state ← depends on #1.4
- [ ] **30.5** Buat `CurrencyInput` component — format Rupiah real-time (titik pemisah ribuan), strip formatting saat submit ← depends on #1.4
- [ ] **30.6** Toast notifications — setup global Sonner/Shadcn toast. Success (hijau), Error (merah), Warning (kuning). Auto-dismiss 5s ← depends on #1.4
- [ ] **30.7** Responsive testing & fixes — pastikan semua halaman work di tablet (1024px) dan mobile (375px). POS page khusus tablet view ← depends on semua halaman

---

## Phase 10: Testing & Optimization

### 31. Testing

- [ ] **31.1** Setup Vitest 4 + React Testing Library + `@vitest/coverage-v8` ← depends on #1.1
- [ ] **31.2** Test: Auth flow — login form submission, token storage, redirect, logout ← depends on #6.2
- [ ] **31.3** Test: Cart store — addItem, removeItem, updateQty, clearCart, total calculation ← depends on #10.2
- [ ] **31.4** Test: Permission gate — render/hide berdasarkan permission ← depends on #4.3
- [ ] **31.5** Test: Offline detection — banner visibility, offline save, sync on reconnect ← depends on #14.3
- [ ] **31.6** Test: Currency formatting — Rupiah format, parse back to number ← depends on #30.5

### 32. Performance

- [ ] **32.1** Implement route-based code splitting — `React.lazy()` untuk semua halaman, fallback Suspense skeleton ← depends on semua halaman
- [ ] **32.2** Optimize product images — lazy loading (`loading="lazy"`), WebP format, thumbnail di list / full di detail ← depends on #11.2
- [ ] **32.3** Optimize chart rendering — conditional render Recharts hanya saat visible (Intersection Observer) ← depends on #9.4

---

## Dependency Graph (Simplified)

```
Phase 1: Foundation
  1.Init ──▶ 2.Theme ──▶ 3.API Layer
                             │
                  ┌──────────┼──────────┐
                  ▼          ▼          ▼
             4.Routing   5.Auth    15.4 DataTable
                  │          │
                  ▼          ▼
             4.Layout  6-8.Login/Logout

Phase 3-4: Dashboard + POS (parallelizable)
  ┌──▶ 9.Dashboard (charts, KPIs)
  └──▶ 10-14.POS (product grid, cart, payment, offline)

Phase 5-6: CRUD + Operasional (parallelizable after DataTable)
  ┌──▶ 15-16.Products + Categories
  ├──▶ 17.Inventory ──▶ 18.Recipes
  ├──▶ 19.Shifts
  ├──▶ 20.Expenses
  ├──▶ 21.Vouchers
  └──▶ 22.Transaction History

Phase 7-8: Admin + Reports (parallelizable)
  ┌──▶ 23.Outlets + 24.Users + 25.Roles
  ├──▶ 26.Audit Logs
  └──▶ 27-28.Reports

Phase 9-10: Polish
  29.PWA ──▶ 30.Polish ──▶ 31.Tests ──▶ 32.Performance
```

---

## API Consumption Matrix

> Mapping setiap halaman ke endpoints yang dikonsumsi.

| Halaman              | Endpoints                                                                         | Methods                |
| :------------------- | :-------------------------------------------------------------------------------- | :--------------------- |
| **Login**            | `/api/auth/login`                                                                 | POST                   |
| **PIN Login**        | `/api/auth/pin`                                                                   | POST                   |
| **Logout**           | `/api/auth/logout`                                                                | POST                   |
| **Auth Check**       | `/api/auth/me`                                                                    | GET                    |
| **Dashboard**        | `/api/reports/dashboard`                                                          | GET                    |
| **POS**              | `/api/categories`, `/api/products`, `/api/vouchers/validate`, `/api/transactions` | GET, POST              |
| **Offline Sync**     | `/api/transactions/sync`                                                          | POST                   |
| **Products**         | `/api/products`, `/api/categories`                                                | GET, POST, PUT, DELETE |
| **Categories**       | `/api/categories`                                                                 | GET, POST, PUT, DELETE |
| **Inventory**        | `/api/inventory`                                                                  | GET, POST, PUT, DELETE |
| **Recipes**          | `/api/products/{id}/recipes`, `/api/inventory`                                    | GET, PUT               |
| **Shifts**           | `/api/shifts`, `/api/shifts/open`, `/api/shifts/close`                            | GET, POST              |
| **Expenses**         | `/api/expenses`                                                                   | GET, POST, PUT, DELETE |
| **Vouchers**         | `/api/vouchers`                                                                   | GET, POST, PUT, DELETE |
| **Transactions**     | `/api/transactions`, `/api/transactions/{id}`, `/api/transactions/{id}/void`      | GET, POST              |
| **Outlets**          | `/api/outlets`                                                                    | GET, POST, PUT         |
| **Users**            | `/api/users`, `/api/roles`, `/api/outlets`                                        | GET, POST, PUT, DELETE |
| **Roles**            | `/api/roles`, `/api/permissions`                                                  | GET, POST, PUT, DELETE |
| **Audit Logs**       | `/api/audit-logs`                                                                 | GET                    |
| **Sales Report**     | `/api/reports/sales`                                                              | GET                    |
| **Inventory Report** | `/api/reports/inventory`                                                          | GET                    |

---

## Quick Reference: Phase → Tasks

| Phase        | Fokus                                               | Tasks            | Paralel?          |
| :----------- | :-------------------------------------------------- | :--------------- | :---------------- |
| **Phase 1**  | Project init, theme, API layer, routing, auth store | 1–5 (19 tasks)   | Sequential        |
| **Phase 2**  | Login, PIN login, logout                            | 6–8 (8 tasks)    | Sequential        |
| **Phase 3**  | Dashboard page + charts                             | 9 (8 tasks)      | ✅ with Phase 4   |
| **Phase 4**  | POS: product grid, cart, payment, offline           | 10–14 (18 tasks) | ✅ with Phase 3   |
| **Phase 5**  | Products, categories, inventory, recipes CRUD       | 15–18 (13 tasks) | ✅ parallelizable |
| **Phase 6**  | Shifts, expenses, vouchers, transactions            | 19–22 (12 tasks) | ✅ parallelizable |
| **Phase 7**  | Outlets, users, roles, audit logs                   | 23–26 (9 tasks)  | ✅ parallelizable |
| **Phase 8**  | Sales report, inventory report                      | 27–28 (6 tasks)  | ✅ parallelizable |
| **Phase 9**  | PWA, UI polish, reusable components                 | 29–30 (10 tasks) | Sequential        |
| **Phase 10** | Testing, performance optimization                   | 31–32 (9 tasks)  | Sequential        |
| **Total**    |                                                     | **~95 tasks**    |                   |
