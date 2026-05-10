/**
 * Modul 5 — Building UI Forms for Data Input
 *
 * PRASYARAT: project Apps Script harus container-bound — buka script
 * via Extensions → Apps Script dari dalam Google Sheet.
 *
 * Sheet harus punya tab "Karyawan" dengan header:
 *   Nama | Divisi | Gaji | Tanggal Daftar
 */


/* =========================================================================
 * Custom Menu (Bagian 2.3)
 * ========================================================================= */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("⚡ Form M5")
    .addItem("Tambah cepat (prompt)",  "tambahKaryawanCepat")
    .addItem("Konfirmasi hapus (alert)", "konfirmasiHapus")
    .addSeparator()
    .addItem("Buka Form (sidebar)",     "bukaSidebarForm")
    .addItem("Buka Form (modal)",       "bukaModalForm")
    .addItem("Buka Sidebar CRUD",       "bukaSidebarCRUD")
    .addToUi();
}


/* =========================================================================
 * BAGIAN 1 — Native UI: alert & prompt
 * ========================================================================= */

function tambahKaryawanCepat() {
  const ui = SpreadsheetApp.getUi();
  const respon = ui.prompt(
    "Tambah Karyawan",
    "Masukkan nama (isi 'cancel' untuk batal):",
    ui.ButtonSet.OK_CANCEL
  );

  if (respon.getSelectedButton() !== ui.Button.OK) return;

  const nama = respon.getResponseText().trim();
  if (!nama || nama.toLowerCase() === "cancel") return;

  SpreadsheetApp.getActiveSheet()
    .getSheetByName("Karyawan")
    .appendRow([nama, "—", 0, new Date()]);

  ui.alert("Berhasil", `Karyawan "${nama}" ditambahkan.`, ui.ButtonSet.OK);
}

function konfirmasiHapus() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();
  const baris = range.getRow();

  if (baris === 1) {
    ui.alert("Tidak bisa", "Header tidak boleh dihapus.", ui.ButtonSet.OK);
    return;
  }

  const respon = ui.alert(
    "Konfirmasi",
    `Yakin hapus baris ${baris}?`,
    ui.ButtonSet.YES_NO
  );

  if (respon === ui.Button.YES) {
    sheet.deleteRow(baris);
    ui.alert("Berhasil", "Baris dihapus.", ui.ButtonSet.OK);
  }
}


/* =========================================================================
 * BAGIAN 2 — Sidebar Form
 *
 * PRASYARAT: tambah file HTML "ui-form" di project, dengan isi seperti
 * di materi.md §3.3.
 * ========================================================================= */

function bukaSidebarForm() {
  const html = HtmlService.createHtmlOutputFromFile("ui-form")
    .setTitle("Tambah Karyawan")
    .setWidth(320);
  SpreadsheetApp.getUi().showSidebar(html);
}

function bukaModalForm() {
  const html = HtmlService.createHtmlOutputFromFile("ui-form")
    .setWidth(420)
    .setHeight(360);
  SpreadsheetApp.getUi().showModalDialog(html, "Tambah Karyawan");
}

// Function ini di-trigger dari client lewat google.script.run.simpanData()
function simpanData(formData) {
  // Validasi server-side
  if (!formData.nama || formData.nama.length < 2) {
    throw new Error("Nama minimal 2 karakter.");
  }
  const gaji = parseFloat(formData.gaji);
  if (isNaN(gaji) || gaji < 0) {
    throw new Error("Gaji harus angka non-negatif.");
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Karyawan");
  sheet.appendRow([formData.nama, formData.divisi, gaji, new Date()]);

  return { ok: true, message: `Tersimpan: ${formData.nama}` };
}


/* =========================================================================
 * BAGIAN 3 — Pre-fill form
 *
 * PRASYARAT: tambah file HTML "ui-form-prefill" dengan isi seperti
 * di materi.md §5.
 * ========================================================================= */

function bukaFormDenganData() {
  const tmpl = HtmlService.createTemplateFromFile("ui-form-prefill");
  tmpl.divisiList = ["Finance", "Marketing", "IT", "HR", "Ops"];
  tmpl.userEmail  = Session.getActiveUser().getEmail();

  const html = tmpl.evaluate()
    .setTitle("Form Pre-fill")
    .setWidth(320);
  SpreadsheetApp.getUi().showSidebar(html);
}


/* =========================================================================
 * BAGIAN 4 — Sidebar CRUD lengkap
 *
 * PRASYARAT: tambah file HTML "ui-crud" di project.
 * ========================================================================= */

function bukaSidebarCRUD() {
  const html = HtmlService.createHtmlOutputFromFile("ui-crud")
    .setTitle("Kelola Karyawan")
    .setWidth(360);
  SpreadsheetApp.getUi().showSidebar(html);
}

function bacaSemuaKaryawan() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Karyawan");
  const data  = sheet.getDataRange().getValues();
  const headers = data.shift();

  return data.map((row, i) => {
    const obj = { _row: i + 2 };   // +2: 1 header + 1-indexed
    headers.forEach((k, j) => { obj[k] = row[j]; });
    return obj;
  });
}

function updateKaryawan(record) {
  if (!record._row) throw new Error("_row hilang.");

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Karyawan");
  sheet.getRange(record._row, 1, 1, 4)
       .setValues([[
         record.Nama,
         record.Divisi,
         parseFloat(record.Gaji) || 0,
         new Date(record["Tanggal Daftar"])
       ]]);

  return { ok: true };
}

function hapusKaryawan(rowNumber) {
  if (!rowNumber || rowNumber < 2) throw new Error("Baris tidak valid.");

  SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("Karyawan")
    .deleteRow(rowNumber);

  return { ok: true };
}
