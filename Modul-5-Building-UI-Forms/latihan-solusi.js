/**
 * Modul 5 — Solusi Latihan
 *
 * Catatan: file HTML pendamping (form-karyawan.html, dst) ada panduan
 * di akhir file ini. Buat di project Apps Script masing-masing.
 */


/* ----- Soal 1: Custom Menu ----- */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("⚡ Otomasi M5")
    .addItem("Halo",            "menuHalo")
    .addItem("Tambah Cepat",    "menuTambahCepat")
    .addItem("Refresh Tanggal", "menuRefreshTanggal")
    .addSeparator()
    .addItem("Buka Form (sidebar)", "bukaFormKaryawan")
    .addItem("Buka CRUD Aset",      "bukaCRUDAset")
    .addToUi();
}

function menuHalo() {
  SpreadsheetApp.getUi().alert("Halo");
}

function menuTambahCepat() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt("Nama karyawan baru:", ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const nama = r.getResponseText().trim();
  if (!nama) return;
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Karyawan")
    .appendRow([nama, "Belum diisi", 0, new Date()]);
}

function menuRefreshTanggal() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Karyawan");
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const today = new Date();
  const arr = Array.from({ length: lastRow - 1 }, () => [today]);
  sheet.getRange(2, 4, lastRow - 1, 1).setValues(arr);
}


/* ----- Soal 2 & 3: Form Karyawan + validasi ----- */
function bukaFormKaryawan() {
  const html = HtmlService.createHtmlOutputFromFile("form-karyawan")
    .setTitle("Tambah Karyawan").setWidth(320);
  SpreadsheetApp.getUi().showSidebar(html);
}

function tambahKaryawan(formData) {
  const divisiValid = ["Finance", "Marketing", "IT", "HR", "Ops"];

  if (!formData.nama || formData.nama.trim().length < 2) {
    throw new Error("Nama minimal 2 karakter.");
  }
  if (!divisiValid.includes(formData.divisi)) {
    throw new Error("Divisi tidak valid.");
  }
  const gaji = Number(formData.gaji);
  if (isNaN(gaji) || gaji < 0 || gaji > 100000000) {
    throw new Error("Gaji harus antara 0 - 100.000.000.");
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Karyawan");

  // Cek duplikat (Soal 3)
  const existing = sheet.getRange(2, 1, Math.max(1, sheet.getLastRow() - 1), 1).getValues();
  const nameLower = formData.nama.trim().toLowerCase();
  const sudahAda = existing.some((row) => String(row[0]).toLowerCase() === nameLower);
  if (sudahAda) {
    throw new Error(`Nama "${formData.nama}" sudah ada.`);
  }

  sheet.appendRow([formData.nama.trim(), formData.divisi, gaji, new Date()]);
  return { ok: true, message: `Tersimpan: ${formData.nama}` };
}


/* ----- Soal 4: Pre-fill Divisi Dinamis ----- */
function bukaFormDinamis() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Karyawan");
  const data = sheet.getRange(2, 2, Math.max(1, sheet.getLastRow() - 1), 1).getValues();
  const divisiList = [...new Set(data.flat().filter(Boolean))].sort();

  const tmpl = HtmlService.createTemplateFromFile("form-dinamis");
  tmpl.divisiList = divisiList.length > 0 ? divisiList : ["Finance", "IT"];

  const html = tmpl.evaluate().setTitle("Form Dinamis").setWidth(320);
  SpreadsheetApp.getUi().showSidebar(html);
}


/* ----- Soal 5 & 6: CRUD Aset ----- */
function bukaCRUDAset() {
  const html = HtmlService.createHtmlOutputFromFile("crud-aset")
    .setTitle("CRUD Aset").setWidth(380);
  SpreadsheetApp.getUi().showSidebar(html);
}

function bacaSemuaAset() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Aset");
  if (!sheet || sheet.getLastRow() < 2) return [];
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  return data.map((row, i) => {
    const obj = { _row: i + 2 };
    headers.forEach((k, j) => { obj[k] = row[j]; });
    return obj;
  });
}

function simpanAset(record) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Aset");

  // Validasi
  if (!record.Kode || !record["Nama Aset"]) {
    throw new Error("Kode dan Nama Aset wajib.");
  }
  const tahun = parseInt(record.Tahun, 10);
  const nilai = parseFloat(record.Nilai);
  if (isNaN(tahun) || tahun < 1900 || tahun > 2100) {
    throw new Error("Tahun tidak valid.");
  }
  if (isNaN(nilai) || nilai < 0) {
    throw new Error("Nilai tidak valid.");
  }

  const rowData = [record.Kode, record["Nama Aset"], record.Kategori, tahun, nilai];

  if (record._row) {
    sheet.getRange(record._row, 1, 1, rowData.length).setValues([rowData]);
    return { ok: true, action: "updated" };
  } else {
    sheet.appendRow(rowData);
    return { ok: true, action: "inserted" };
  }
}

function hapusAset(rowNumber) {
  if (!rowNumber || rowNumber < 2) throw new Error("Baris tidak valid.");
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Aset").deleteRow(rowNumber);
  return { ok: true };
}


/* ----- Soal 7: Wizard Modal 3 Step ----- */
function bukaWizardImport() {
  const html = HtmlService.createHtmlOutputFromFile("wizard-import")
    .setWidth(500).setHeight(450);
  SpreadsheetApp.getUi().showModalDialog(html, "Import Aset");
}

function parseCSVAset(csvText) {
  const lines = csvText.trim().split("\n");
  const errors = [];
  const rows = [];

  lines.forEach((line, i) => {
    const parts = line.split(",").map((p) => p.trim());
    if (parts.length !== 5) {
      errors.push(`Baris ${i + 1}: kolom tidak sesuai (perlu 5).`);
      return;
    }
    const [kode, nama, kategori, tahunStr, nilaiStr] = parts;
    const tahun = parseInt(tahunStr, 10);
    const nilai = parseFloat(nilaiStr);
    if (isNaN(tahun) || isNaN(nilai)) {
      errors.push(`Baris ${i + 1}: Tahun/Nilai bukan angka.`);
      return;
    }
    rows.push({ kode, nama, kategori, tahun, nilai });
  });

  return { rows, errors };
}

function bulkInsertAset(rows) {
  if (!rows || rows.length === 0) {
    throw new Error("Tidak ada data.");
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Aset");
  const startRow = sheet.getLastRow() + 1;
  const arrData = rows.map((r) => [r.kode, r.nama, r.kategori, r.tahun, r.nilai]);
  sheet.getRange(startRow, 1, arrData.length, 5).setValues(arrData);
  return { ok: true, inserted: arrData.length };
}


/* ============================================================
 * PANDUAN HTML untuk soal 2-7 (taruh di project Apps Script):
 *
 * 1. form-karyawan.html  → mirip ui-form.html dari contoh.js,
 *    panggil google.script.run.tambahKaryawan(...)
 * 2. form-dinamis.html   → form yang dropdown Divisi-nya pakai
 *    <? divisiList.forEach((d) => { ?><option><?= d ?></option><? }); ?>
 * 3. crud-aset.html      → mirip ui-crud.html, panggil bacaSemuaAset,
 *    simpanAset, hapusAset.
 * 4. wizard-import.html  → 3 panel (step1/step2/step3) yang ditoggle
 *    show/hide, tombol Next/Back, panggil parseCSVAset & bulkInsertAset.
 *
 * Pola kerangka HTML sama dengan ui-form.html dan ui-crud.html.
 * ============================================================ */
