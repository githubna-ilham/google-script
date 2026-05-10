/**
 * Modul 0 — JavaScript Dasar
 * File contoh siap dijalankan di Google Apps Script Editor.
 *
 * Cara pakai:
 *   1. Copy seluruh isi file ini ke Code.gs di project Apps Script.
 *   2. Pilih nama function di dropdown "Select function" lalu klik Run.
 *   3. Lihat output di panel Execution log (View → Logs).
 */


/* =========================================================================
 * BAGIAN 1 — Variabel & Tipe Data
 * ========================================================================= */

function contoh01_variabel() {
  const nama = "Budi";
  let umur = 25;

  console.log("Nama: " + nama);
  console.log("Umur sekarang: " + umur);

  umur = 26;
  console.log("Umur tahun depan: " + umur);

  // Mencoba mengubah const akan error — uncomment untuk membuktikan:
  // nama = "Andi";
}

function contoh02_tipeData() {
  const teks   = "Halo dunia";
  const angka  = 3.14;
  const benar  = true;
  const kosong = null;
  let belumDiisi;

  console.log("teks: %s (%s)", teks, typeof teks);
  console.log("angka: %s (%s)", angka, typeof angka);
  console.log("benar: %s (%s)", benar, typeof benar);
  console.log("kosong: %s (%s)", kosong, typeof kosong);
  console.log("belumDiisi: %s (%s)", belumDiisi, typeof belumDiisi);
}

function contoh03_operator() {
  // Aritmatika
  console.log("10 + 3 = " + (10 + 3));
  console.log("10 / 3 = " + (10 / 3));
  console.log("10 % 3 = " + (10 % 3));   // sisa bagi
  console.log("2 ** 8 = " + (2 ** 8));   // pangkat

  // Perbandingan — selalu pakai === bukan ==
  console.log("2 == '2'  → " + (2 == "2"));    // true (menyesatkan)
  console.log("2 === '2' → " + (2 === "2"));   // false (jelas)

  // Logika
  const lulusTeori = true;
  const lulusPraktek = false;
  console.log("Lulus semua? " + (lulusTeori && lulusPraktek));
  console.log("Lulus salah satu? " + (lulusTeori || lulusPraktek));
}

function contoh04_templateLiteral() {
  const nama = "Sari";
  const umur = 28;

  // Cara lama (boleh, tapi panjang)
  const pesan1 = "Halo " + nama + ", umur Anda " + umur + " tahun.";

  // Template literal — disarankan
  const pesan2 = `Halo ${nama}, umur Anda ${umur} tahun.`;

  console.log(pesan1);
  console.log(pesan2);
}


/* =========================================================================
 * BAGIAN 2 — Struktur Kontrol
 * ========================================================================= */

function contoh05_ifElse() {
  const nilai = 78;
  let grade;

  if (nilai >= 85) {
    grade = "A";
  } else if (nilai >= 70) {
    grade = "B";
  } else if (nilai >= 55) {
    grade = "C";
  } else {
    grade = "Tidak lulus";
  }

  console.log(`Nilai ${nilai} → Grade ${grade}`);
}

function contoh06_ternary() {
  const umur = 20;
  const status = umur >= 17 ? "Dewasa" : "Anak-anak";
  console.log(`Status: ${status}`);
}

function contoh07_switch() {
  function namaHari(angka) {
    switch (angka) {
      case 1: return "Senin";
      case 2: return "Selasa";
      case 3: return "Rabu";
      case 4: return "Kamis";
      case 5: return "Jumat";
      case 6: return "Sabtu";
      case 7: return "Minggu";
      default: return "Hari tidak dikenal";
    }
  }

  console.log(namaHari(3));   // Rabu
  console.log(namaHari(9));   // Hari tidak dikenal
}

function contoh08_forLoop() {
  console.log("Hitung 1 sampai 5:");
  for (let i = 1; i <= 5; i++) {
    console.log(i);
  }

  console.log("Tabel perkalian 7:");
  for (let i = 1; i <= 10; i++) {
    console.log(`7 x ${i} = ${7 * i}`);
  }
}

function contoh09_whileLoop() {
  let n = 5;
  while (n > 0) {
    console.log(`Hitung mundur: ${n}`);
    n--;   // jangan lupa kurangi, kalau tidak infinite loop
  }
  console.log("Selesai!");
}


/* =========================================================================
 * BAGIAN 3 — Function
 * ========================================================================= */

function contoh10_functionDasar() {
  function sapa(nama) {
    return `Halo, ${nama}!`;
  }

  console.log(sapa("Budi"));
  console.log(sapa("Sari"));
}

function contoh11_parameterBanyak() {
  function hitungLuasPersegiPanjang(panjang, lebar) {
    return panjang * lebar;
  }

  function hitungBMI(beratKg, tinggiM) {
    return beratKg / (tinggiM * tinggiM);
  }

  console.log("Luas: " + hitungLuasPersegiPanjang(5, 3));
  console.log("BMI : " + hitungBMI(65, 1.70).toFixed(2));
}

function contoh12_arrowFunction() {
  const tambah = (a, b) => a + b;
  const kuadrat = (n) => n * n;
  const sapa = (nama) => `Halo, ${nama}!`;

  console.log(tambah(3, 4));
  console.log(kuadrat(9));
  console.log(sapa("Tina"));
}


/* =========================================================================
 * BAGIAN 4 — Array
 * ========================================================================= */

function contoh13_arrayDasar() {
  const buah = ["apel", "jeruk", "mangga"];

  console.log("Buah pertama: " + buah[0]);
  console.log("Jumlah buah: " + buah.length);

  buah.push("pisang");
  console.log("Setelah push: " + buah.join(", "));

  buah.pop();
  console.log("Setelah pop: " + buah.join(", "));
}

function contoh14_iterasiArray() {
  const angka = [10, 20, 30, 40, 50];

  // forEach dengan arrow function
  console.log("--- forEach ---");
  angka.forEach((nilai, index) => {
    console.log(`Index ${index}: ${nilai}`);
  });

  // for klasik
  console.log("--- for klasik ---");
  for (let i = 0; i < angka.length; i++) {
    console.log(`angka[${i}] = ${angka[i]}`);
  }
}

function contoh15_methodArray() {
  const nilai = [78, 55, 90, 42, 88];

  const lulus = nilai.filter((n) => n >= 70);
  console.log("Lulus: " + lulus.join(", "));

  const naikSatu = nilai.map((n) => n + 1);
  console.log("Naik 1: " + naikSatu.join(", "));

  const total = nilai.reduce((a, b) => a + b, 0);
  const ratarata = total / nilai.length;
  console.log(`Total: ${total}, Rata-rata: ${ratarata}`);

  const adaSembilanPuluh = nilai.includes(90);
  console.log("Ada nilai 90? " + adaSembilanPuluh);
}


/* =========================================================================
 * BAGIAN 5 — Object
 * ========================================================================= */

function contoh16_objectDasar() {
  const karyawan = {
    nama: "Sari",
    umur: 28,
    divisi: "Finance",
    aktif: true
  };

  console.log("Nama   : " + karyawan.nama);
  console.log("Divisi : " + karyawan["divisi"]);

  karyawan.umur = 29;
  karyawan.email = "sari@kantor.id";

  console.log("Setelah update:");
  console.log(JSON.stringify(karyawan));
}

function contoh17_arrayOfObjects() {
  const daftarKaryawan = [
    { nama: "Sari", divisi: "Finance",   gaji: 8000000 },
    { nama: "Budi", divisi: "Marketing", gaji: 7500000 },
    { nama: "Tina", divisi: "Finance",   gaji: 9000000 },
    { nama: "Andi", divisi: "IT",        gaji: 9500000 }
  ];

  // Total gaji
  const totalGaji = daftarKaryawan
    .map((k) => k.gaji)
    .reduce((a, b) => a + b, 0);
  console.log("Total gaji: " + totalGaji.toLocaleString("id-ID"));

  // Karyawan divisi Finance
  const finance = daftarKaryawan.filter((k) => k.divisi === "Finance");
  console.log(`Karyawan Finance: ${finance.length} orang`);
  finance.forEach((k) => console.log(`  - ${k.nama}`));

  // Karyawan dengan gaji tertinggi
  const tertinggi = daftarKaryawan.reduce((max, k) =>
    k.gaji > max.gaji ? k : max
  );
  console.log(`Gaji tertinggi: ${tertinggi.nama} (${tertinggi.gaji.toLocaleString("id-ID")})`);
}


/* =========================================================================
 * BAGIAN 6 — Latihan terpadu (jalankan untuk sanity-check)
 * ========================================================================= */

function jalankanSemua() {
  const semua = [
    contoh01_variabel,
    contoh02_tipeData,
    contoh03_operator,
    contoh04_templateLiteral,
    contoh05_ifElse,
    contoh06_ternary,
    contoh07_switch,
    contoh08_forLoop,
    contoh09_whileLoop,
    contoh10_functionDasar,
    contoh11_parameterBanyak,
    contoh12_arrowFunction,
    contoh13_arrayDasar,
    contoh14_iterasiArray,
    contoh15_methodArray,
    contoh16_objectDasar,
    contoh17_arrayOfObjects
  ];

  semua.forEach((fn, i) => {
    console.log(`\n========== ${i + 1}. ${fn.name} ==========`);
    fn();
  });
}
