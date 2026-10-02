# Invoice Studio

Aplikasi Next.js untuk membuat, melihat, dan mencetak invoice. Data invoice dan item disimpan di PostgreSQL menggunakan Drizzle ORM.

## Menjalankan aplikasi

Prasyarat: Node.js 20+, pnpm, serta server PostgreSQL aktif dan dapat dijangkau. `psql` tidak diperlukan.

1. Instal dependency: `pnpm install`.
2. Buat file `.env` di root project dan isi koneksi PostgreSQL:

	```env
	DATABASE_URL=postgres://dev:dev@192.168.10.129:5432/invoice_db
	```

	Ganti `NAMA_DATABASE` dengan nama database yang sudah dibuat dan dapat diakses oleh user tersebut.
3. Buat tabel invoice: `pnpm db:setup`.
4. Jalankan aplikasi: `pnpm dev`, lalu buka http://localhost:3000.

Script setup menjalankan SQL idempoten dari `drizzle/0001_create_invoices.sql`. Skema ORM ada di `drizzle/schema.ts`.

## Fitur

- Daftar invoice, detail klien, status, tanggal, serta jumlah tagihan.
- Form invoice dengan item dinamis dan kalkulasi total langsung.
- Validasi di server dan transaksi database untuk invoice beserta itemnya.
- Ekspor PDF melalui tombol **Export PDF / Print** pada halaman detail; pilih **Save as PDF** di dialog cetak browser.

Jika halaman menampilkan peringatan database, periksa `DATABASE_URL`, akses jaringan ke PostgreSQL, dan jalankan kembali `pnpm db:setup`.

## Panduan Instalasi dan Database

### 1. Prasyarat

- Node.js 20 atau lebih baru.
- pnpm. Jika belum tersedia, pasang dengan `npm install --global pnpm`.
- Server PostgreSQL aktif dan dapat diakses dari komputer yang menjalankan aplikasi.
- User PostgreSQL dengan izin membuat tabel dan membaca/menulis data pada database tujuan.

### 2. Pasang dependency

Buka terminal pada folder utama project (folder yang berisi `package.json`), lalu jalankan:

```powershell
pnpm install
```

### 3. Buat database PostgreSQL

Buat database kosong terlebih dahulu melalui pgAdmin atau tool PostgreSQL lain. Contoh berikut membuat database bernama `invoice_db`:

```sql
CREATE DATABASE invoice_db;
```

Jalankan perintah tersebut menggunakan koneksi PostgreSQL yang memiliki izin `CREATE DATABASE`. Jika database sudah dibuat, langkah ini dapat dilewati.

### 4. Atur koneksi aplikasi

Buat file bernama `.env` di folder utama project, sejajar dengan `package.json`. Isi dengan URL koneksi:

```env
DATABASE_URL=postgres://dev:dev@192.168.10.129:5432/invoice_db
```

Format umumnya adalah:

```text
postgres://USER:PASSWORD@HOST:PORT/NAMA_DATABASE
```

Contoh di atas mengikuti user `dev`, password `dev`, host `192.168.10.129`, dan port `5432` dari soal. Ganti `invoice_db` dengan nama database yang benar-benar tersedia. `(db)` pada URL soal adalah placeholder nama database, bukan teks literal. Sesuaikan host, port, user, atau password jika konfigurasi server PostgreSQL Anda berbeda. Jangan commit file `.env` atau membagikan kredensial database.

### 5. Jalankan migrasi

Pastikan `.env` sudah terisi, lalu jalankan dari folder utama project:

```powershell
pnpm db:setup
```

Script ini membaca `drizzle/0001_create_invoices.sql` dan membuat tabel `invoices` serta `invoice_items`. Jika sukses, terminal menampilkan `Invoice tables are ready.` Migrasi memakai `CREATE TABLE IF NOT EXISTS`, sehingga script setup ini dapat dijalankan ulang.

Definisi skema Drizzle berada di `drizzle/schema.ts`. Perintah `db:setup` menjalankan berkas SQL tersebut langsung ke database yang ditentukan oleh `DATABASE_URL`.

### 6. Jalankan aplikasi

```powershell
pnpm dev
```

Buka http://localhost:3000. Dari halaman detail invoice, pilih **Export PDF / Print**, lalu pilih **Save as PDF** pada dialog cetak browser.

### Troubleshooting

- `DATABASE_URL is not set`: pastikan nama file `.env` tepat dan berada di folder utama project.
- Host tidak ditemukan, koneksi ditolak, atau timeout: pastikan PostgreSQL aktif, alamat dan port benar, serta akses jaringan/firewall mengizinkan koneksi.
- `Password authentication failed`: periksa username dan password pada URL koneksi.
- `Database does not exist`: buat database terlebih dahulu dan pastikan namanya sama dengan bagian akhir `DATABASE_URL`.
- `Permission denied`: berikan user PostgreSQL izin membuat tabel dan membaca/menulis data pada database.
- Tabel belum tersedia: jalankan ulang `pnpm db:setup`, kemudian muat ulang aplikasi.
