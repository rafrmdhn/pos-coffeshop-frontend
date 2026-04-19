# Product Requirements Document (PRD)

**Proyek:** Sistem Point of Sale (POS) Multi-Outlet untuk Coffee Shop  
**Versi:** 1.0 (Minimum Viable Product - MVP)

## 1. Ringkasan Eksekutif

Aplikasi POS berbasis web yang dirancang khusus untuk operasional _coffee shop_. Sistem ini memprioritaskan antarmuka tablet yang responsif, kemampuan berjalan tanpa internet (PWA dengan sinkronisasi luring), serta sistem akuntansi dasar (HPP & Pengeluaran) untuk menghasilkan laporan laba bersih yang akurat. Aplikasi mendukung skema multi-cabang dengan keamanan data yang terisolasi.

## 2. Arsitektur & Teknologi (Tech Stack)

| Komponen              | Teknologi                  | Keterangan                                                                        |
| :-------------------- | :------------------------- | :-------------------------------------------------------------------------------- |
| **Frontend**          | React + Vite               | Mode _Progressive Web App_ (PWA) untuk antarmuka Tablet (_Landscape First_).      |
| **Backend**           | Laravel (REST API)         | Mengelola logika bisnis, autentikasi, dan antrean _background jobs_.              |
| **Database**          | MySQL                      | Relasional database menggunakan **UUID** sebagai _Primary Key_ untuk semua tabel. |
| **Penyimpanan Lokal** | IndexedDB (FE)             | Menampung antrean data transaksi saat kasir _offline_.                            |
| **Infrastruktur**     | Hostinger Business         | RAM 3GB, CPU 2 Core, NVMe. Membutuhkan pengaturan _Cron Job_ harian/menitan.      |
| **Hardware Kasir**    | Tablet & Bluetooth Printer | Komunikasi cetak struk via _Web Bluetooth API_ (Protokol ESC/POS).                |

## 3. Manajemen Akses & Peran (RBAC)

Sistem menggunakan _Role-Based Access Control_ (RBAC) yang dinamis menggunakan _package_ `spatie/laravel-permission`.

- **Owner (Pemilik):** Memiliki akses sistem penuh (Global). Dapat melihat seluruh cabang, menambah/menghapus peran, mengatur izin (_permissions_) secara dinamis, dan melihat agregasi laporan keuangan (Laba Bersih).
- **Manager (Manajer Cabang):** Akses terbatas hanya pada cabangnya (diisolasi via _Laravel Global Scopes_). Dapat melakukan Buka/Tutup Shift, mengelola stok inventori cabang, memasukkan data pengeluaran (OPEX), dan menyetujui transaksi _Void_.
- **Cashier (Kasir):** Akses sangat terbatas. Hanya dapat melakukan transaksi kasir, mencetak struk, dan menginput jumlah uang fisik saat tutup shift (_Blind Drop_). Login menggunakan sistem **Fast PIN (4-6 digit)** setelah sesi tablet dibuka oleh Manajer.

## 4. Fitur Fungsional Utama (MVP)

### A. Modul Transaksi & Kasir (Frontend PWA)

- **Offline-First POS:** Pembuatan pesanan dapat dilakukan tanpa koneksi internet. Data disimpan di IndexedDB menggunakan **UUID** dan akan disinkronisasikan ke _server_ secara otomatis (_Background Sync_) saat status kembali _online_.
- **Manajemen Pesanan:** Mendukung tipe pesanan (_Dine-in_, _Takeaway_), penambahan catatan khusus (_Less Sugar_, dll), dan _Split Bill_.
- **Sistem Pembayaran:** Multi-metode pembayaran (Tunai, QRIS statis) dengan kalkulasi pajak otomatis (PB1 10%).
- **Integrasi Perangkat Keras:** Pencetakan struk pelanggan dan tiket order dapur/barista secara langsung melalui printer _thermal bluetooth_.

### B. Modul Inventori & Resep (BOM)

- **Manajemen Bahan Baku:** Pencatatan stok bahan baku (`raw_materials`) per cabang beserta harga belinya untuk perhitungan Harga Pokok Penjualan (HPP).
- **Auto-Deduction (Pemotongan Otomatis):** Implementasi _Laravel Jobs/Observers_ untuk memotong stok bahan baku berdasarkan resep (_Bill of Materials_) setiap kali transaksi berhasil disinkronisasi, tanpa mengorbankan performa API kasir.

### C. Modul Keuangan & Shift

- **Manajemen Shift (Blind Drop):** Kasir menginput uang modal awal. Saat tutup _shift_, sistem menyembunyikan ekspektasi total tunai; kasir wajib menghitung dan menginput nominal fisik yang ada untuk mencegah manipulasi. Selisih kas dicatat di laporan manajer.
- **Pencatatan Pengeluaran (OPEX):** Manajer dapat mencatat biaya operasional harian (Gaji, Listrik, Sewa, dll).
- **Laporan Profitabilitas:** Dashboard otomatis yang mengkalkulasi Penjualan (Omzet) dikurangi HPP dan OPEX untuk menampilkan Laba Bersih (_Net Profit_).

### D. Modul Pemasaran

- **Diskon Manual/Voucher:** Fitur potongan harga berbasis persentase (%) atau nominal (Rp) yang dapat diinput oleh kasir/manajer berdasarkan kode _voucher_ aktif. _(Catatan: Tidak ada sistem poin/loyalitas pada MVP)._

## 5. Kebutuhan Non-Fungsional (NFR) & Keamanan

1.  **Isolasi Data (Data Privacy):** Wajib menggunakan _Laravel Global Scopes_ untuk memastikan staf hanya dapat mengakses data (`products`, `transactions`, `inventory`) milik `outlet_id` mereka sendiri.
2.  **Integritas Data Master (Soft Deletes):** Wajib diimplementasikan pada tabel `products`, `raw_materials`, `users`, dan `vouchers` untuk menjaga riwayat laporan keuangan yang sudah lampau agar tidak _error_ saat menu/bahan baku dihapus. Tabel `transactions` bersifat permanen (hanya bisa di-_void_, tidak bisa dihapus).
3.  **Rekam Jejak (Audit Trail):** Sistem otomatis mencatat aktivitas krusial pengguna (misal: "Manajer A melakukan _void_ pada transaksi B", "Owner mengubah harga Menu C").
4.  **Auto-Backup:** Sistem melakukan pencadangan basis data secara otomatis sesuai jadwal. File backup tersimpan dengan aman di direktori internal server hosting untuk memudahkan proses pemulihan data secara cepat.
5.  **Lokalisasi (i18n):** Aplikasi mendukung perubahan bahasa antarmuka (Bahasa Indonesia dan English) menggunakan _library_ i18n di React dan fitur lokalisasi _backend_ di Laravel.

## 6. Acuan Struktur Database Inti

- **Semua Tabel (Master & Operasional):** Menggunakan `UUID` sebagai _Primary Key_ secara universal. Ini mencakup tabel master (`users`, `outlets`, `products`, `raw_materials`, `product_recipes`, `expenses`) dan tabel operasional (`transactions`, `transaction_items`).
- **Kelebihan Pendekatan Universal:** Menyeragamkan tipe data ID di seluruh sistem, mempermudah replikasi atau migrasi data antarsistem, mencegah kerentanan keamanan (_ID enumeration_), dan menjamin tidak terjadinya konflik ID saat sistem mengsinkronisasi data dari tablet _offline_ ke _server cloud_.
