/**
 * Modul 0 — Solusi Latihan
 *
 * Catatan: Ini SATU dari banyak solusi yang valid.
 * Kalau kode kamu beda tapi outputnya benar, tetap dianggap betul.
 */


/* ----- Soal 1: Sapaan Personal ----- */
function sapaPersonal(nama, waktu) {
  if (waktu === "pagi")  return `Selamat pagi, ${nama}!`;
  if (waktu === "siang") return `Selamat siang, ${nama}!`;
  if (waktu === "malam") return `Selamat malam, ${nama}!`;
  return `Halo, ${nama}!`;
}

function ujiSoal1() {
  console.log(sapaPersonal("Budi", "pagi"));
  console.log(sapaPersonal("Sari", "siang"));
  console.log(sapaPersonal("Tina", "malam"));
  console.log(sapaPersonal("Andi", "sore"));   // fallback
}


/* ----- Soal 2: Konversi Suhu ----- */
function celsiusKeFahrenheit(c) {
  return (c * 9 / 5) + 32;
}

function tabelSuhu() {
  for (let c = 0; c <= 100; c += 25) {
    console.log(`${c}°C = ${celsiusKeFahrenheit(c)}°F`);
  }
}


/* ----- Soal 3: Grade Nilai ----- */
function hitungGrade(nilai) {
  if (nilai < 0 || nilai > 100) return "Nilai tidak valid";
  if (nilai >= 85) return "A";
  if (nilai >= 70) return "B";
  if (nilai >= 55) return "C";
  if (nilai >= 40) return "D";
  return "E";
}

function ujiSoal3() {
  [95, 70, 54, 40, 39, -5, 110].forEach((n) => {
    console.log(`${n} → ${hitungGrade(n)}`);
  });
}


/* ----- Soal 4: Bilangan Genap ----- */
function cetakGenap(maks) {
  for (let i = 2; i <= maks; i += 2) {
    console.log(i);
  }
}

function cetakGenapV2(maks) {
  const hasil = Array.from({ length: maks }, (_, i) => i + 1)
    .filter((n) => n % 2 === 0);
  hasil.forEach((n) => console.log(n));
}


/* ----- Soal 5: FizzBuzz ----- */
function fizzBuzz(n) {
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0)      console.log("FizzBuzz");
    else if (i % 3 === 0)  console.log("Fizz");
    else if (i % 5 === 0)  console.log("Buzz");
    else                   console.log(i);
  }
}


/* ----- Soal 6: Statistik Array ----- */
function statistikNilai() {
  const nilai = [78, 55, 90, 42, 88, 63, 71, 95, 50, 80];

  const tertinggi = Math.max(...nilai);
  const terendah  = Math.min(...nilai);
  const total     = nilai.reduce((a, b) => a + b, 0);
  const rataRata  = (total / nilai.length).toFixed(2);
  const lulus     = nilai.filter((n) => n >= 70);
  const persenLulus = (lulus.length / nilai.length * 100).toFixed(1);

  console.log(`Tertinggi : ${tertinggi}`);
  console.log(`Terendah  : ${terendah}`);
  console.log(`Rata-rata : ${rataRata}`);
  console.log(`Lulus     : ${lulus.length} dari ${nilai.length}`);
  console.log(`Persentase: ${persenLulus}%`);
}


/* ----- Soal 7: Filter & Transform ----- */
function analisaProduk() {
  const produk = [
    { nama: "Mouse",     harga: 150000,  stok: 12 },
    { nama: "Keyboard",  harga: 350000,  stok: 0  },
    { nama: "Monitor",   harga: 2500000, stok: 5  },
    { nama: "Headset",   harga: 450000,  stok: 8  },
    { nama: "Webcam",    harga: 800000,  stok: 0  }
  ];

  const tersedia = produk.filter((p) => p.stok > 0);
  console.log("Produk tersedia:");
  tersedia.forEach((p) => console.log(`  - ${p.nama}`));

  const totalInventori = produk.reduce((sum, p) => sum + p.harga * p.stok, 0);
  console.log(`Total nilai inventori: Rp ${totalInventori.toLocaleString("id-ID")}`);

  const termahal = tersedia.reduce((max, p) => p.harga > max.harga ? p : max);
  console.log(`Produk termahal (tersedia): ${termahal.nama} (Rp ${termahal.harga.toLocaleString("id-ID")})`);
}


/* ----- Soal 8: Object Manipulation ----- */
function daftarKaryawanBaru() {
  const karyawan = [];

  karyawan.push({ nama: "Sari", divisi: "Finance",   gajiPokok: 8000000 });
  karyawan.push({ nama: "Budi", divisi: "Marketing", gajiPokok: 7500000 });
  karyawan.push({ nama: "Tina", divisi: "IT",        gajiPokok: 9000000 });

  karyawan.forEach((k) => {
    k.tunjangan = k.gajiPokok * 0.2;
    k.gajiTotal = k.gajiPokok + k.tunjangan;
    console.log(JSON.stringify(k));
  });
}


/* ----- Soal 9: Pencarian dengan find ----- */
function cariPeserta(id) {
  const peserta = [
    { id: "P001", nama: "Sari", lulus: true  },
    { id: "P002", nama: "Budi", lulus: false },
    { id: "P003", nama: "Tina", lulus: true  },
    { id: "P004", nama: "Andi", lulus: false }
  ];

  const hasil = peserta.find((p) => p.id === id);
  return hasil || "Peserta tidak ditemukan";
}

function ujiSoal9() {
  console.log(JSON.stringify(cariPeserta("P002")));
  console.log(cariPeserta("P999"));
}


/* ----- Soal 10: Penghitung Diskon ----- */
function hitungBelanja() {
  const transaksi = [
    { item: "Buku",     qty: 3, harga: 50000 },
    { item: "Pulpen",   qty: 5, harga: 8000  },
    { item: "Notebook", qty: 2, harga: 35000 }
  ];

  // Subtotal per item + total
  const baris = transaksi.map((t) => ({
    ...t,
    subtotal: t.qty * t.harga
  }));
  const total = baris.reduce((sum, b) => sum + b.subtotal, 0);

  // Diskon
  let persenDiskon = 0;
  if (total > 250000)      persenDiskon = 10;
  else if (total >= 100000) persenDiskon = 5;
  const nilaiDiskon = total * persenDiskon / 100;
  const totalBayar  = total - nilaiDiskon;

  // Cetak
  console.log("Item       | Qty | Harga      | Subtotal");
  console.log("-----------+-----+------------+------------");
  baris.forEach((b) => {
    const item = b.item.padEnd(10);
    const qty  = String(b.qty).padStart(3);
    const hrg  = b.harga.toLocaleString("id-ID").padStart(10);
    const sub  = b.subtotal.toLocaleString("id-ID").padStart(10);
    console.log(`${item} | ${qty} | ${hrg} | ${sub}`);
  });
  console.log("-----------+-----+------------+------------");
  console.log(`Total       : Rp ${total.toLocaleString("id-ID")}`);
  console.log(`Diskon ${persenDiskon}%   : Rp ${nilaiDiskon.toLocaleString("id-ID")}`);
  console.log(`Total bayar : Rp ${totalBayar.toLocaleString("id-ID")}`);
}


/* ----- Jalankan semua sebagai sanity check ----- */
function jalankanSemuaSolusi() {
  const semua = [
    ujiSoal1, tabelSuhu, ujiSoal3,
    () => cetakGenap(10),
    () => fizzBuzz(20),
    statistikNilai, analisaProduk, daftarKaryawanBaru,
    ujiSoal9, hitungBelanja
  ];
  semua.forEach((fn, i) => {
    console.log(`\n========== Soal ${i + 1} ==========`);
    fn();
  });
}
