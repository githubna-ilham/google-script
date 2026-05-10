# Latihan Modul 3 — Google Sheets Automation

**Persiapan**:

1. Buat satu Google Sheet baru, beri nama `Latihan-M3`. Copy ID-nya.
2. Buat **dua tab**: `Penjualan` dan `Produk`.

### Tab `Penjualan`

| ID Transaksi | Tanggal     | Customer    | Email Customer    | Produk    | Qty | Harga Satuan | Status        | Notif Terkirim |
|--------------|-------------|-------------|-------------------|-----------|-----|--------------|---------------|----------------|
| TRX-001      | 2026-05-01  | PT Alpha    | alpha@kantor.id   | Mouse     | 3   | 150000       | Selesai       |                |
| TRX-002      | 2026-05-02  | PT Beta     | beta@kantor.id    | Keyboard  | 5   | 350000       | Diproses      |                |
| TRX-003      | 2026-05-02  | PT Gamma    | gamma@kantor.id   | Monitor   | 2   | 2500000      | Selesai       |                |
| TRX-004      | 2026-05-03  | PT Delta    | delta@kantor.id   | Headset   | 4   | 450000       | Dibatalkan    |                |
| TRX-005      | 2026-05-04  | PT Epsilon  | (email Anda)      | Mouse     | 10  | 150000       | Selesai       |                |
| TRX-006      | 2026-05-05  | PT Zeta     | zeta@kantor.id    | Webcam    | 2   | 800000       | Diproses      |                |

> Untuk soal yang melibatkan kirim email (Soal 6), ganti minimal 1 email customer di kolom `Email Customer` dengan email Anda sendiri supaya bisa diverifikasi.

### Tab `Produk`

| Kode | Nama Produk | Stok | Harga    |
|------|-------------|------|----------|
| P001 | Mouse       | 50   | 150000   |
| P002 | Keyboard    | 30   | 350000   |
| P003 | Monitor     | 8    | 2500000  |
| P004 | Headset     | 25   | 450000   |
| P005 | Webcam      | 12   | 800000   |

3. Set `SHEET_ID` di awal kode Anda dengan ID dari URL Sheet.

---

## Soal 1 — Statistik Penjualan

Buat function `statistikPenjualan()` yang membaca tab `Penjualan` lalu mencetak:
- Total transaksi (semua status).
- Total transaksi dengan status `Selesai`.
- Total nilai transaksi `Selesai` (Qty × Harga Satuan).
- Customer dengan transaksi `Selesai` terbanyak (jumlah baris).
- Produk paling laku (dari transaksi `Selesai`, jumlah Qty terbesar).

> Hint: pakai pola Header→Object lalu `filter`/`reduce`/`forEach`. Tidak boleh pakai `getValue` per-cell di loop.

---

## Soal 2 — Tambah Kolom "Subtotal"

Buat function `tambahKolomSubtotal()` yang:
1. Cek apakah header "Subtotal" sudah ada. Kalau belum, tambahkan kolom baru di setelah "Harga Satuan".
2. Isi kolom `Subtotal` = `Qty × Harga Satuan` untuk semua baris data.
3. Format seluruh kolom Subtotal sebagai angka format rupiah (`"Rp" #,##0`).

> Hint: untuk insert kolom baru pakai `sheet.insertColumnAfter(idx)`. Format angka via `range.setNumberFormat(format)`.

---

## Soal 3 — Validasi Stok

Buat function `validasiStok()` yang membaca tab `Penjualan` dan `Produk`, lalu untuk setiap baris `Selesai`:
- Kurangi stok di tab `Produk` sesuai Qty yang terjual.
- Kalau stok tidak cukup, ubah Status di `Penjualan` jadi `Stok Tidak Cukup`.

Tulis hasil akhir kedua tab dalam **2 round-trip total** (1× tulis ke `Penjualan`, 1× tulis ke `Produk`).

> Hint: bikin Map `kodeProduk → indexBaris` di tab `Produk` dulu untuk lookup cepat.

---

## Soal 4 — Custom Function `LEVEL_HARGA`

Buat custom function `LEVEL_HARGA(hargaSatuan)` yang return:
- `"Murah"` kalau < 200.000
- `"Sedang"` kalau 200.000 – 1.000.000
- `"Mahal"` kalau > 1.000.000

Pakai di tab `Produk` di sel **F2** ke bawah dengan formula `=LEVEL_HARGA(D2)`.

---

## Soal 5 — Filter ke Sheet Baru

Buat function `exportSelesaiKeSheetBaru()` yang:
1. Bikin tab baru bernama `Penjualan-Selesai-<tanggal-hari-ini>` (kalau sudah ada, hapus dulu).
2. Copy header dari tab `Penjualan` ke tab baru.
3. Hanya transaksi dengan status `Selesai` yang dipindah.
4. Tambah satu kolom paling kanan: `Total Nilai` = Qty × Harga Satuan.

> Hint: `ss.insertSheet(name)`, `ss.deleteSheet(sheet)`.

---

## Soal 6 — Notifikasi Email + Marker Idempotent

Buat function `kirimNotifSelesai()` yang:
1. Untuk setiap baris `Status = Selesai` **DAN** `Notif Terkirim` masih kosong:
   - Kirim email ke alamat di kolom `Email Customer` (subject: `[Selesai] <ID Transaksi>`, body berisi ID transaksi, customer, produk, qty, total).
   - Isi kolom `Notif Terkirim` dengan timestamp sekarang (`yyyy-MM-dd HH:mm`).
2. Tulis ulang kolom `Notif Terkirim` ke Sheet **dalam 1 round-trip** (gunakan `setValues`).

Test:
- Run pertama → harus kirim email untuk baris Selesai yang `Notif Terkirim` masih kosong.
- Run kedua langsung tanpa ganti apa-apa → harus log "0 email dikirim" (idempotent).

---

## Soal 7 — Mini-Project: Dashboard Ringkas

Buat function `bangunDashboard()` yang membuat tab baru `Dashboard` (atau update kalau sudah ada) dengan layout berikut:

```
A1: "Dashboard Penjualan"
A3: "Total Transaksi"      | B3: <jumlah>
A4: "Total Nilai"          | B4: <total Rp>
A5: "Transaksi Selesai"    | B5: <jumlah>
A6: "Transaksi Diproses"   | B6: <jumlah>
A7: "Transaksi Dibatalkan" | B7: <jumlah>

A9: "Top 3 Customer"
A10..A12: nama customer
B10..B12: total nilai per customer

A14: "Top 3 Produk"
A15..A17: nama produk
B15..B17: total qty per produk
```

Format:
- A1: bold, font size 16, background warna apa saja yang Anda suka.
- A3:A7, A9, A14: bold.
- B4: format Rupiah.
- B10:B12: format Rupiah.

> Hint: bikin object `{customer: totalNilai}` lalu sort by value descending. Pakai `Object.entries()` → `sort` → `slice(0, 3)`.

---

## Checklist Sebelum Lanjut ke Modul Berikutnya

- [ ] Saya nyaman dengan hierarki SpreadsheetApp → Spreadsheet → Sheet → Range.
- [ ] Saya selalu pakai `getValues`/`setValues`, bukan loop per-cell.
- [ ] Saya bisa konversi array 2D ↔ array of object via header.
- [ ] Saya bisa append, hapus, cari baris.
- [ ] Saya bisa bikin custom function dengan JSDoc `@customfunction`.
- [ ] Saya paham idempotent pattern dengan kolom marker.

**Selanjutnya: Modul 4 — Gmail Automation.**
