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

  Logger.log("Nama: " + nama);
  Logger.log("Umur sekarang: " + umur);

  umur = 26;
  Logger.log("Umur tahun depan: " + umur);

  // Mencoba mengubah const akan error — uncomment untuk membuktikan:
  // nama = "Andi";
}

function contoh02_tipeData() {
  const teks   = "Halo dunia";
  const angka  = 3.14;
  const benar  = true;
  const kosong = null;
  let belumDiisi;

  Logger.log("teks: %s (%s)", teks, typeof teks);
  Logger.log("angka: %s (%s)", angka, typeof angka);
  Logger.log("benar: %s (%s)", benar, typeof benar);
  Logger.log("kosong: %s (%s)", kosong, typeof kosong);
  Logger.log("belumDiisi: %s (%s)", belumDiisi, typeof belumDiisi);
}

function contoh03_operator() {
  // Aritmatika
  Logger.log("10 + 3 = " + (10 + 3));
  Logger.log("10 / 3 = " + (10 / 3));
  Logger.log("10 % 3 = " + (10 % 3));   // sisa bagi
  Logger.log("2 ** 8 = " + (2 ** 8));   // pangkat

  // Perbandingan — selalu pakai === bukan ==
  Logger.log("2 == '2'  → " + (2 == "2"));    // true (menyesatkan)
  Logger.log("2 === '2' → " + (2 === "2"));   // false (jelas)

  // Logika
  const lulusTeori = true;
  const lulusPraktek = false;
  Logger.log("Lulus semua? " + (lulusTeori && lulusPraktek));
  Logger.log("Lulus salah satu? " + (lulusTeori || lulusPraktek));
}

function contoh04_templateLiteral() {
  const nama = "Sari";
  const umur = 28;

  // Cara lama (boleh, tapi panjang)
  const pesan1 = "Halo " + nama + ", umur Anda " + umur + " tahun.";

  // Template literal — disarankan
  const pesan2 = `Halo ${nama}, umur Anda ${umur} tahun.`;

  Logger.log(pesan1);
  Logger.log(pesan2);
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

  Logger.log(`Nilai ${nilai} → Grade ${grade}`);
}

function contoh06_ternary() {
  const umur = 20;
  const status = umur >= 17 ? "Dewasa" : "Anak-anak";
  Logger.log(`Status: ${status}`);
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

  Logger.log(namaHari(3));   // Rabu
  Logger.log(namaHari(9));   // Hari tidak dikenal
}

function contoh08_forLoop() {
  Logger.log("Hitung 1 sampai 5:");
  for (let i = 1; i <= 5; i++) {
    Logger.log(i);
  }

  Logger.log("Tabel perkalian 7:");
  for (let i = 1; i <= 10; i++) {
    Logger.log(`7 x ${i} = ${7 * i}`);
  }
}

function contoh09_whileLoop() {
  let n = 5;
  while (n > 0) {
    Logger.log(`Hitung mundur: ${n}`);
    n--;   // jangan lupa kurangi, kalau tidak infinite loop
  }
  Logger.log("Selesai!");
}


/* =========================================================================
 * BAGIAN 3 — Function
 * ========================================================================= */

function contoh10_functionDasar() {
  function sapa(nama) {
    return `Halo, ${nama}!`;
  }

  Logger.log(sapa("Budi"));
  Logger.log(sapa("Sari"));
}

function contoh11_parameterBanyak() {
  function hitungLuasPersegiPanjang(panjang, lebar) {
    return panjang * lebar;
  }

  function hitungBMI(beratKg, tinggiM) {
    return beratKg / (tinggiM * tinggiM);
  }

  Logger.log("Luas: " + hitungLuasPersegiPanjang(5, 3));
  Logger.log("BMI : " + hitungBMI(65, 1.70).toFixed(2));
}

function contoh12_arrowFunction() {
  const tambah = (a, b) => a + b;
  const kuadrat = (n) => n * n;
  const sapa = (nama) => `Halo, ${nama}!`;

  Logger.log(tambah(3, 4));
  Logger.log(kuadrat(9));
  Logger.log(sapa("Tina"));
}


/* =========================================================================
 * BAGIAN 4 — Array
 * ========================================================================= */

function contoh13_arrayDasar() {
  const buah = ["apel", "jeruk", "mangga"];

  Logger.log("Buah pertama: " + buah[0]);
  Logger.log("Jumlah buah: " + buah.length);

  buah.push("pisang");
  Logger.log("Setelah push: " + buah.join(", "));

  buah.pop();
  Logger.log("Setelah pop: " + buah.join(", "));
}

function contoh14_iterasiArray() {
  const angka = [10, 20, 30, 40, 50];

  // forEach dengan arrow function
  Logger.log("--- forEach ---");
  angka.forEach((nilai, index) => {
    Logger.log(`Index ${index}: ${nilai}`);
  });

  // for klasik
  Logger.log("--- for klasik ---");
  for (let i = 0; i < angka.length; i++) {
    Logger.log(`angka[${i}] = ${angka[i]}`);
  }
}

function contoh15_methodArray() {
  const nilai = [78, 55, 90, 42, 88];

  const lulus = nilai.filter((n) => n >= 70);
  Logger.log("Lulus: " + lulus.join(", "));

  const naikSatu = nilai.map((n) => n + 1);
  Logger.log("Naik 1: " + naikSatu.join(", "));

  const total = nilai.reduce((a, b) => a + b, 0);
  const ratarata = total / nilai.length;
  Logger.log(`Total: ${total}, Rata-rata: ${ratarata}`);

  const adaSembilanPuluh = nilai.includes(90);
  Logger.log("Ada nilai 90? " + adaSembilanPuluh);
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

  Logger.log("Nama   : " + karyawan.nama);
  Logger.log("Divisi : " + karyawan["divisi"]);

  karyawan.umur = 29;
  karyawan.email = "sari@kantor.id";

  Logger.log("Setelah update:");
  Logger.log(JSON.stringify(karyawan));
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
  Logger.log("Total gaji: " + totalGaji.toLocaleString("id-ID"));

  // Karyawan divisi Finance
  const finance = daftarKaryawan.filter((k) => k.divisi === "Finance");
  Logger.log(`Karyawan Finance: ${finance.length} orang`);
  finance.forEach((k) => Logger.log(`  - ${k.nama}`));

  // Karyawan dengan gaji tertinggi
  const tertinggi = daftarKaryawan.reduce((max, k) =>
    k.gaji > max.gaji ? k : max
  );
  Logger.log(`Gaji tertinggi: ${tertinggi.nama} (${tertinggi.gaji.toLocaleString("id-ID")})`);
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
    Logger.log(`\n========== ${i + 1}. ${fn.name} ==========`);
    fn();
  });
}
