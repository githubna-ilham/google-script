# Latihan Modul 0 — JavaScript Dasar

**Petunjuk umum**:
1. Kerjakan di Google Apps Script Editor ([script.google.com](https://script.google.com)).
2. Buat 1 project baru bernama `Latihan-Modul-0`.
3. Tiap soal = 1 function. Beri nama function persis seperti yang diminta soal.
4. Verifikasi hasil dengan `Logger.log()` lalu cek di Execution log.
5. Coba mandiri dulu **minimal 15 menit per soal** sebelum melihat `latihan-solusi.js`.

**Target waktu**: 60–90 menit untuk 10 soal.

---

## Soal 1 — Sapaan Personal

Buat function `sapaPersonal(nama, waktu)` yang mengembalikan string sapaan.
- Jika `waktu` = `"pagi"` → `"Selamat pagi, <nama>!"`
- Jika `waktu` = `"siang"` → `"Selamat siang, <nama>!"`
- Jika `waktu` = `"malam"` → `"Selamat malam, <nama>!"`
- Selain itu → `"Halo, <nama>!"`

Uji dengan minimal 4 panggilan berbeda. Pakai template literal.

---

## Soal 2 — Konversi Suhu

Buat function `celsiusKeFahrenheit(c)` yang mengubah suhu Celsius ke Fahrenheit.
**Rumus**: `F = (C × 9/5) + 32`

Lalu buat function `tabelSuhu()` yang mencetak konversi 0°C, 25°C, 50°C, 75°C, 100°C ke Fahrenheit, satu baris per nilai. Pakai loop.

---

## Soal 3 — Grade Nilai

Buat function `hitungGrade(nilai)` yang mengembalikan grade berdasarkan aturan:

| Nilai | Grade |
|---|---|
| 85 – 100 | A |
| 70 – 84  | B |
| 55 – 69  | C |
| 40 – 54  | D |
| < 40     | E |
| < 0 atau > 100 | "Nilai tidak valid" |

Uji dengan: 95, 70, 54, 40, 39, -5, 110.

---

## Soal 4 — Bilangan Genap

Buat function `cetakGenap(maks)` yang mencetak semua bilangan genap dari 1 sampai `maks` (inklusif).
Contoh: `cetakGenap(10)` → log: 2, 4, 6, 8, 10.

Pakai `for` loop. Bonus: bikin versi kedua `cetakGenapV2(maks)` yang pakai `Array.from` + `filter`.

---

## Soal 5 — FizzBuzz

Buat function `fizzBuzz(n)` yang mencetak angka 1 sampai `n` dengan aturan:
- Kelipatan 3 → cetak `"Fizz"`
- Kelipatan 5 → cetak `"Buzz"`
- Kelipatan 3 **dan** 5 → cetak `"FizzBuzz"`
- Selain itu → cetak angkanya

Uji dengan `fizzBuzz(20)`.

---

## Soal 6 — Statistik Array

Diberikan data nilai ujian 10 mahasiswa:
```javascript
const nilai = [78, 55, 90, 42, 88, 63, 71, 95, 50, 80];
```

Buat function `statistikNilai()` yang mencetak:
- Nilai tertinggi
- Nilai terendah
- Rata-rata (2 desimal)
- Jumlah mahasiswa yang lulus (≥ 70)
- Persentase kelulusan

> Hint: `Math.max(...arr)`, `Math.min(...arr)`, `.filter()`, `.reduce()`.

---

## Soal 7 — Filter & Transform

Diberikan data produk:
```javascript
const produk = [
  { nama: "Mouse",     harga: 150000, stok: 12 },
  { nama: "Keyboard",  harga: 350000, stok: 0  },
  { nama: "Monitor",   harga: 2500000, stok: 5 },
  { nama: "Headset",   harga: 450000, stok: 8  },
  { nama: "Webcam",    harga: 800000, stok: 0  }
];
```

Buat function `analisaProduk()` yang mencetak:
1. Daftar nama produk yang stoknya > 0.
2. Total nilai inventori (harga × stok untuk semua produk).
3. Produk termahal (yang stoknya > 0).

---

## Soal 8 — Object Manipulation

Buat function `daftarKaryawanBaru()` yang:
1. Membuat array kosong `karyawan`.
2. Menambahkan 3 object karyawan dengan property: `nama`, `divisi`, `gajiPokok`.
3. Untuk tiap karyawan, hitung `tunjangan` = 20% dari gaji pokok dan tambahkan sebagai property baru.
4. Hitung `gajiTotal` = gajiPokok + tunjangan, tambahkan sebagai property.
5. Cetak setiap karyawan menggunakan `JSON.stringify`.

---

## Soal 9 — Pencarian dengan `find`

Diberikan data peserta pelatihan:
```javascript
const peserta = [
  { id: "P001", nama: "Sari", lulus: true  },
  { id: "P002", nama: "Budi", lulus: false },
  { id: "P003", nama: "Tina", lulus: true  },
  { id: "P004", nama: "Andi", lulus: false }
];
```

Buat function `cariPeserta(id)` yang mengembalikan object peserta dengan `id` tersebut, atau string `"Peserta tidak ditemukan"` jika tidak ada.

Uji dengan `"P002"` dan `"P999"`.

---

## Soal 10 — Mini-Project: Penghitung Diskon

Buat function `hitungBelanja()` yang:

1. Menerima array transaksi:
   ```javascript
   const transaksi = [
     { item: "Buku",     qty: 3, harga: 50000  },
     { item: "Pulpen",   qty: 5, harga: 8000   },
     { item: "Notebook", qty: 2, harga: 35000  }
   ];
   ```
2. Hitung subtotal tiap item (`qty × harga`).
3. Hitung total semua item.
4. Tentukan diskon:
   - Total < 100.000 → diskon 0%
   - Total 100.000 – 250.000 → diskon 5%
   - Total > 250.000 → diskon 10%
5. Cetak tabel: Item | Qty | Harga Satuan | Subtotal
6. Cetak Total, Diskon (rupiah), dan Total Bayar.

> Tip: untuk format rupiah pakai `nilai.toLocaleString("id-ID")`.

---

## Checklist Sebelum Lanjut ke Modul Berikutnya

- [ ] Saya berhasil menjalankan minimal 8 dari 10 soal di atas.
- [ ] Saya paham beda `const`, `let`, `var`.
- [ ] Saya bisa menulis function dengan parameter dan return.
- [ ] Saya bisa iterasi array (for / forEach).
- [ ] Saya bisa membaca dan mengubah property object.
- [ ] Saya tahu cara membuka Execution log untuk melihat output.

**Selanjutnya: Modul 1 — Introduction to Google Apps Script.**
