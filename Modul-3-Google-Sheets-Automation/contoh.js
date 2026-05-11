/**
 * Modul 3 — Google Sheets Automation
 *
 * Cara pakai:
 *   1. Setup spreadsheet sesuai template-spreadsheet.md di folder ini.
 *      Wajib ada tab "Karyawan" (untuk contoh01–11) dan "Pesanan" (untuk
 *      mini-project contoh12).
 *   2. Buka Apps Script editor — lewat Extensions → Apps Script
 *      (container-bound) atau standalone di script.google.com (set SHEET_ID).
 *   3. Copy file ini ke Code.gs, set SHEET_ID kalau pakai standalone, lalu Run.
 */

// =========================================================================
// KONFIGURASI — kosongkan kalau pakai container-bound
// =========================================================================
const SHEET_ID = "GANTI_DENGAN_ID_SHEET_ANDA";

function _getSpreadsheet() {
  // Helper: pakai Active dulu, fallback ke openById
  if (SHEET_ID && SHEET_ID !== "GANTI_DENGAN_ID_SHEET_ANDA") {
    return SpreadsheetApp.openById(SHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}


/* =========================================================================
 * BAGIAN 1 — Akses dasar
 * ========================================================================= */

function contoh01_aksesSheet() {
  const ss = _getSpreadsheet();
  console.log("Spreadsheet: " + ss.getName());
  console.log("Sheets: " + ss.getSheets().map((s) => s.getName()).join(", "));

  const sheet = ss.getSheetByName("Karyawan");
  console.log("Total baris dengan data: " + sheet.getLastRow());
  console.log("Total kolom dengan data: " + sheet.getLastColumn());
}

function contoh02_bacaSatuSel() {
  const sheet = _getSpreadsheet().getSheetByName("Karyawan");
  const nama  = sheet.getRange("A2").getValue();
  console.log("A2 = " + nama);
}

function contoh03_bacaArea() {
  const sheet = _getSpreadsheet().getSheetByName("Karyawan");
  const data  = sheet.getRange("A2:C6").getValues();

  console.log("Tipe: " + (Array.isArray(data) ? "Array 2D" : typeof data));
  console.log("Dimensi: " + data.length + " × " + data[0].length);
  data.forEach((row, i) => console.log(`Baris ${i}: ${JSON.stringify(row)}`));
}


/* =========================================================================
 * BAGIAN 2 — Tulis dengan benar (batch vs per-cell)
 * ========================================================================= */

function contoh04_tulisSatuSel() {
  const sheet = _getSpreadsheet().getSheetByName("Karyawan");
  sheet.getRange("D2").setValue("Diperbarui");
  console.log("D2 di-set.");
}

function contoh05_tulisBatch() {
  const sheet = _getSpreadsheet().getSheetByName("Karyawan");

  // Tulis status untuk 5 karyawan sekaligus
  const status = [["A"], ["B"], ["B"], ["A"], ["C"]];   // 5×1 array 2D
  sheet.getRange("D2:D6").setValues(status);

  console.log("D2:D6 di-update batch.");
}


/* =========================================================================
 * BAGIAN 3 — Pola "Header → Object"
 * ========================================================================= */

function contoh06_bacaSebagaiObject() {
  const sheet = _getSpreadsheet().getSheetByName("Karyawan");
  const data  = sheet.getDataRange().getValues();

  const headers = data.shift();
  const rows = data.map((row) => {
    const obj = {};
    headers.forEach((key, i) => { obj[key] = row[i]; });
    return obj;
  });

  rows.forEach((r) => {
    console.log(`${r.Nama} (${r.Divisi}) — Rp ${(r.Gaji || 0).toLocaleString("id-ID")}`);
  });
}

function contoh07_filterDanReduce() {
  const sheet = _getSpreadsheet().getSheetByName("Karyawan");
  const data  = sheet.getDataRange().getValues();
  const headers = data.shift();
  const rows = data.map((row) => {
    const obj = {};
    headers.forEach((k, i) => { obj[k] = row[i]; });
    return obj;
  });

  // Karyawan Finance dengan gaji >= 8jt
  const filtered = rows.filter((r) => r.Divisi === "Finance" && r.Gaji >= 8000000);
  const totalGaji = filtered.reduce((sum, r) => sum + r.Gaji, 0);

  console.log(`Karyawan Finance gaji >= 8jt: ${filtered.length}`);
  console.log(`Total gaji: Rp ${totalGaji.toLocaleString("id-ID")}`);
}


/* =========================================================================
 * BAGIAN 4 — Operasi praktis: append, hapus, cari
 * ========================================================================= */

function contoh08_appendBatch() {
  const sheet = _getSpreadsheet().getSheetByName("Karyawan");

  const baruArr = [
    ["Joko",    "Finance", 7800000, ""],
    ["Maya",    "IT",      8500000, ""],
    ["Bagas",   "HR",      6000000, ""]
  ];

  // Hitung baris kosong setelah data terakhir
  const startRow = sheet.getLastRow() + 1;
  sheet.getRange(startRow, 1, baruArr.length, baruArr[0].length)
       .setValues(baruArr);

  console.log(`${baruArr.length} baris di-append mulai dari baris ${startRow}.`);
}

function contoh09_cariBaris() {
  const sheet = _getSpreadsheet().getSheetByName("Karyawan");
  const data  = sheet.getDataRange().getValues();
  const colNama = data[0].indexOf("Nama");

  const target = "Tina";
  for (let i = 1; i < data.length; i++) {
    if (data[i][colNama] === target) {
      console.log(`${target} ditemukan di baris ${i + 1}`);
      sheet.getRange(i + 1, data[0].indexOf("Status") + 1).setValue("FOUND");
      return;
    }
  }
  console.log(`${target} tidak ditemukan.`);
}


/* =========================================================================
 * BAGIAN 5 — Format kondisional via kode
 * ========================================================================= */

function contoh10_highlightGajiTinggi() {
  const sheet = _getSpreadsheet().getSheetByName("Karyawan");
  const data  = sheet.getDataRange().getValues();
  const colGaji = data[0].indexOf("Gaji") + 1;   // 1-indexed untuk Sheet

  for (let i = 1; i < data.length; i++) {
    const gaji = data[i][colGaji - 1];
    if (gaji >= 8000000) {
      sheet.getRange(i + 1, colGaji)
           .setBackground("#fef3c7")
           .setFontWeight("bold");
    }
  }
  console.log("Highlight selesai.");
}

function contoh11_resetFormat() {
  const sheet = _getSpreadsheet().getSheetByName("Karyawan");
  sheet.getDataRange()
       .setBackground(null)
       .setFontWeight("normal");
  console.log("Format direset.");
}


/* =========================================================================
 * BAGIAN 6 — Custom Function (panggil sebagai formula di sel)
 * ========================================================================= */

/**
 * Hitung diskon berbasis volume.
 *
 * @param {number} subtotal Subtotal sebelum diskon
 * @return {number}         Nilai diskon dalam rupiah
 * @customfunction
 */
function HITUNG_DISKON(subtotal) {
  if (subtotal > 1000000) return subtotal * 0.10;
  if (subtotal > 500000)  return subtotal * 0.05;
  return 0;
}

/**
 * Format angka jadi rupiah Indonesia.
 *
 * @param {number} angka Nilai numerik
 * @return {string}      Format "Rp 1.234.567"
 * @customfunction
 */
function RUPIAH(angka) {
  if (typeof angka !== "number") return angka;
  return "Rp " + angka.toLocaleString("id-ID");
}


/* =========================================================================
 * BAGIAN 7 — Trigger: onOpen menu
 * (Aktif HANYA kalau script container-bound — buka script via Extensions →
 *  Apps Script dari dalam Sheet, lalu reload sheet.)
 * ========================================================================= */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("⚡ Otomasi M3")
    .addItem("Highlight gaji tinggi", "contoh10_highlightGajiTinggi")
    .addItem("Reset format",          "contoh11_resetFormat")
    .addSeparator()
    .addItem("Baca sebagai object",   "contoh06_bacaSebagaiObject")
    .addToUi();
}


/* =========================================================================
 * BAGIAN 8 — Mini-project: Notif pesanan selesai
 * (PRASYARAT: bikin tab "Pesanan" dengan kolom: Nomor Pesanan, Email Customer,
 *  Status, Notif Terkirim. Isi 3-5 baris sample dengan Status "Selesai" dan
 *  email aktif Anda untuk testing.)
 * ========================================================================= */

function contoh12_kirimNotifPesananSelesai() {
  const sheet = _getSpreadsheet().getSheetByName("Pesanan");
  if (!sheet) {
    console.log("Tab 'Pesanan' tidak ada — bikin dulu sesuai prasyarat.");
    return;
  }

  const range = sheet.getDataRange();
  const data  = range.getValues();
  const headers = data[0];

  const colNomor = headers.indexOf("Nomor Pesanan");
  const colEmail = headers.indexOf("Email Customer");
  const colStat  = headers.indexOf("Status");
  const colNotif = headers.indexOf("Notif Terkirim");

  const stamp = Utilities.formatDate(
    new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm"
  );

  let terkirim = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][colStat] === "Selesai" && !data[i][colNotif]) {
      MailApp.sendEmail({
        to: data[i][colEmail],
        subject: `Pesanan ${data[i][colNomor]} Selesai`,
        body: `Halo,\n\nPesanan ${data[i][colNomor]} Anda telah selesai.\n\nTerima kasih.`
      });
      data[i][colNotif] = stamp;
      terkirim++;
    }
  }

  range.setValues(data);
  console.log(`${terkirim} email dikirim.`);
}


/* =========================================================================
 * Helper: jalankan demo aman (tidak kirim email, tidak append banyak)
 * ========================================================================= */

function jalankanDemoAman() {
  console.log("\n=== contoh01 ===");
  contoh01_aksesSheet();

  console.log("\n=== contoh03 ===");
  contoh03_bacaArea();

  console.log("\n=== contoh06 ===");
  contoh06_bacaSebagaiObject();

  console.log("\n=== contoh07 ===");
  contoh07_filterDanReduce();
}
