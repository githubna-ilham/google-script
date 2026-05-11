# Latihan Modul 0 — JavaScript Dasar

**Petunjuk umum**:
1. Kerjakan di Google Apps Script Editor ([script.google.com](https://script.google.com)).
2. Buat 1 project baru bernama `Latihan-Modul-0`.
3. Tiap soal = 1 function. Beri nama function persis seperti yang diminta soal.
4. Verifikasi hasil dengan `console.log()` lalu cek di Execution log.
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

**Pseudocode**:
```
FUNCTION sapaPersonal(nama, waktu):
    JIKA waktu = "pagi"  KEMBALIKAN "Selamat pagi, " + nama + "!"
    JIKA waktu = "siang" KEMBALIKAN "Selamat siang, " + nama + "!"
    JIKA waktu = "malam" KEMBALIKAN "Selamat malam, " + nama + "!"
    KEMBALIKAN "Halo, " + nama + "!"
END FUNCTION

FUNCTION ujiSoal1():
    cetak sapaPersonal("Budi", "pagi")
    cetak sapaPersonal("Sari", "siang")
    cetak sapaPersonal("Tina", "malam")
    cetak sapaPersonal("Andi", "sore")    // fallback
END FUNCTION
```

---

## Soal 2 — Konversi Suhu

Buat function `celsiusKeFahrenheit(c)` yang mengubah suhu Celsius ke Fahrenheit.
**Rumus**: `F = (C × 9/5) + 32`

Lalu buat function `tabelSuhu()` yang mencetak konversi 0°C, 25°C, 50°C, 75°C, 100°C ke Fahrenheit, satu baris per nilai. Pakai loop.

**Pseudocode**:
```
FUNCTION celsiusKeFahrenheit(c):
    KEMBALIKAN (c * 9 / 5) + 32
END FUNCTION

FUNCTION tabelSuhu():
    UNTUK c DARI 0 SAMPAI 100 LANGKAH 25:
        cetak (c + "°C = " + celsiusKeFahrenheit(c) + "°F")
END FUNCTION
```

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

**Pseudocode**:
```
FUNCTION hitungGrade(nilai):
    JIKA nilai < 0 ATAU nilai > 100 KEMBALIKAN "Nilai tidak valid"
    JIKA nilai >= 85 KEMBALIKAN "A"
    JIKA nilai >= 70 KEMBALIKAN "B"
    JIKA nilai >= 55 KEMBALIKAN "C"
    JIKA nilai >= 40 KEMBALIKAN "D"
    KEMBALIKAN "E"
END FUNCTION

FUNCTION ujiSoal3():
    UNTUK SETIAP n DI [95, 70, 54, 40, 39, -5, 110]:
        cetak (n + " → " + hitungGrade(n))
END FUNCTION
```

---

## Soal 4 — Bilangan Genap

Buat function `cetakGenap(maks)` yang mencetak semua bilangan genap dari 1 sampai `maks` (inklusif).
Contoh: `cetakGenap(10)` → log: 2, 4, 6, 8, 10.

Pakai `for` loop. Bonus: bikin versi kedua `cetakGenapV2(maks)` yang pakai `Array.from` + `filter`.

**Pseudocode**:
```
FUNCTION cetakGenap(maks):
    UNTUK i DARI 2 SAMPAI maks LANGKAH 2:
        cetak i
END FUNCTION

FUNCTION cetakGenapV2(maks):
    // Bikin array [1..maks], filter yang habis dibagi 2
    arr ← Array.from({length: maks}, (_, i) => i + 1)
    hasil ← arr.filter(n => n MOD 2 = 0)
    UNTUK SETIAP n DI hasil:
        cetak n
END FUNCTION
```

---

## Soal 5 — FizzBuzz

Buat function `fizzBuzz(n)` yang mencetak angka 1 sampai `n` dengan aturan:
- Kelipatan 3 → cetak `"Fizz"`
- Kelipatan 5 → cetak `"Buzz"`
- Kelipatan 3 **dan** 5 → cetak `"FizzBuzz"`
- Selain itu → cetak angkanya

Uji dengan `fizzBuzz(20)`.

**Pseudocode**:
```
FUNCTION fizzBuzz(n):
    UNTUK i DARI 1 SAMPAI n:
        JIKA i habis dibagi 15  cetak "FizzBuzz"      // cek 15 dulu!
        SELAIN ITU JIKA i habis dibagi 3  cetak "Fizz"
        SELAIN ITU JIKA i habis dibagi 5  cetak "Buzz"
        SELAIN ITU                         cetak i
END FUNCTION
```
> Tip: cek kelipatan 15 dulu (sebelum 3 dan 5), karena 15 = 3 × 5. Kalau cek 3 dulu, angka 15 akan dianggap "Fizz" saja.

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

**Pseudocode**:
```
FUNCTION statistikNilai():
    nilai ← [78, 55, 90, 42, 88, 63, 71, 95, 50, 80]

    tertinggi ← Math.max dari semua elemen nilai
    terendah  ← Math.min dari semua elemen nilai
    total     ← nilai.reduce(jumlahkan, 0)
    rataRata  ← total / banyaknya nilai, dibulatkan 2 desimal
    lulus     ← nilai.filter(n => n >= 70)
    persen    ← (lulus.length / nilai.length) * 100

    cetak "Tertinggi : " + tertinggi
    cetak "Terendah  : " + terendah
    cetak "Rata-rata : " + rataRata
    cetak "Lulus     : " + lulus.length + " dari " + nilai.length
    cetak "Persentase: " + persen + "%"
END FUNCTION
```

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

**Pseudocode**:
```
FUNCTION analisaProduk():
    // 1. Produk dengan stok > 0
    tersedia ← produk.filter(p => p.stok > 0)
    cetak "Produk tersedia:"
    UNTUK SETIAP p DI tersedia:
        cetak "  - " + p.nama

    // 2. Total nilai inventori
    totalInventori ← produk.reduce((sum, p) => sum + p.harga * p.stok, 0)
    cetak "Total nilai inventori: Rp " + totalInventori

    // 3. Produk termahal yang stok > 0
    termahal ← tersedia.reduce((max, p) => p.harga > max.harga ? p : max)
    cetak "Termahal: " + termahal.nama + " (Rp " + termahal.harga + ")"
END FUNCTION
```

---

## Soal 8 — Object Manipulation

Buat function `daftarKaryawanBaru()` yang:
1. Membuat array kosong `karyawan`.
2. Menambahkan 3 object karyawan dengan property: `nama`, `divisi`, `gajiPokok`.
3. Untuk tiap karyawan, hitung `tunjangan` = 20% dari gaji pokok dan tambahkan sebagai property baru.
4. Hitung `gajiTotal` = gajiPokok + tunjangan, tambahkan sebagai property.
5. Cetak setiap karyawan menggunakan `JSON.stringify`.

**Pseudocode**:
```
FUNCTION daftarKaryawanBaru():
    karyawan ← []   // array kosong

    karyawan.push({ nama: "Sari", divisi: "Finance",   gajiPokok: 8000000 })
    karyawan.push({ nama: "Budi", divisi: "Marketing", gajiPokok: 7500000 })
    karyawan.push({ nama: "Tina", divisi: "IT",        gajiPokok: 9000000 })

    UNTUK SETIAP k DI karyawan:
        k.tunjangan ← k.gajiPokok * 0.2          // tambah property baru
        k.gajiTotal ← k.gajiPokok + k.tunjangan
        cetak JSON.stringify(k)
END FUNCTION
```

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

**Pseudocode**:
```
FUNCTION cariPeserta(id):
    hasil ← peserta.find(p => p.id = id)
    JIKA hasil ada  KEMBALIKAN hasil
    KEMBALIKAN "Peserta tidak ditemukan"
END FUNCTION

FUNCTION ujiSoal9():
    cetak JSON.stringify(cariPeserta("P002"))
    cetak cariPeserta("P999")
END FUNCTION
```

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

**Pseudocode**:
```
FUNCTION hitungBelanja():
    transaksi ← [
        { item: "Buku",     qty: 3, harga: 50000 },
        { item: "Pulpen",   qty: 5, harga: 8000  },
        { item: "Notebook", qty: 2, harga: 35000 }
    ]

    // 1. Hitung subtotal tiap item & total semua
    baris ← transaksi.map(t => { ...t, subtotal: t.qty * t.harga })
    total ← baris.reduce((sum, b) => sum + b.subtotal, 0)

    // 2. Tentukan persen diskon berdasarkan total
    persenDiskon ← 0
    JIKA total > 250000        persenDiskon ← 10
    SELAIN ITU JIKA total >= 100000  persenDiskon ← 5

    nilaiDiskon ← total * persenDiskon / 100
    totalBayar  ← total - nilaiDiskon

    // 3. Cetak tabel + ringkasan
    cetak "Item | Qty | Harga | Subtotal"
    UNTUK SETIAP b DI baris:
        cetak b.item + " | " + b.qty + " | " + b.harga + " | " + b.subtotal

    cetak "Total       : Rp " + total
    cetak "Diskon " + persenDiskon + "%: Rp " + nilaiDiskon
    cetak "Total bayar : Rp " + totalBayar
END FUNCTION
```

---

## Checklist Sebelum Lanjut ke Modul Berikutnya

- [ ] Saya berhasil menjalankan minimal 8 dari 10 soal di atas.
- [ ] Saya paham beda `const`, `let`, `var`.
- [ ] Saya bisa menulis function dengan parameter dan return.
- [ ] Saya bisa iterasi array (for / forEach).
- [ ] Saya bisa membaca dan mengubah property object.
- [ ] Saya tahu cara membuka Execution log untuk melihat output.

**Selanjutnya: Modul 1 — Introduction to Google Apps Script.**
