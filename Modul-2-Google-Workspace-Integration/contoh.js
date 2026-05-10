/**
 * Modul 2 — Google Workspace Integration
 * Drive · Docs · Calendar
 *
 * Cara pakai:
 *   1. Buat project baru di script.google.com, beri nama "Latihan Modul 2".
 *   2. Copy isi file ini ke Code.gs.
 *   3. Sebelum jalankan, ganti placeholder ID (FOLDER_ID, TEMPLATE_ID) sesuai
 *      file/folder Drive Anda.
 *   4. Jalankan satu function untuk setiap eksperimen.
 */

// =========================================================================
// KONFIGURASI — ganti sebelum dipakai
// =========================================================================
const FOLDER_ID   = "GANTI_DENGAN_ID_FOLDER_ANDA";
const TEMPLATE_ID = "GANTI_DENGAN_ID_DOC_TEMPLATE";


/* =========================================================================
 * BAGIAN 1 — DriveApp
 * ========================================================================= */

function contoh01_listFolderAktif() {
  // Ambil My Drive root
  const root = DriveApp.getRootFolder();
  console.log("Root folder: " + root.getName());

  // Iterasi 5 folder pertama saja supaya tidak terlalu panjang
  const folders = root.getFolders();
  let counter = 0;
  while (folders.hasNext() && counter < 5) {
    const f = folders.next();
    console.log(`📁 ${f.getName()}`);
    counter++;
  }
}

function contoh02_buatStrukturFolder() {
  const root = DriveApp.getRootFolder();
  const induk = root.createFolder("Latihan-M2-Demo");

  ["Input", "Output", "Arsip"].forEach((nama) => {
    induk.createFolder(nama);
  });

  console.log("Struktur folder dibuat: " + induk.getUrl());
}

function contoh03_buatFileTeks() {
  const folder = DriveApp.getFoldersByName("Latihan-M2-Demo").next();
  const file = folder.createFile(
    "catatan.txt",
    "Halo dari Apps Script — file ini dibuat secara otomatis.",
    "text/plain"
  );
  console.log("File: " + file.getUrl());
}

function contoh04_searchPDF() {
  const query = "mimeType='application/pdf' and trashed=false";
  const files = DriveApp.searchFiles(query);

  let counter = 0;
  while (files.hasNext() && counter < 10) {
    const f = files.next();
    console.log(`${f.getName()} — ${f.getLastUpdated().toLocaleDateString("id-ID")}`);
    counter++;
  }
  console.log("Menampilkan 10 PDF teratas (kalau ada).");
}

function contoh05_copyFileBatch() {
  // Copy file dummy 3x ke folder yang sama (sebagai demo loop)
  const folder = DriveApp.getFoldersByName("Latihan-M2-Demo").next();
  const sumber = folder.createFile("sumber.txt", "isi dasar", "text/plain");

  for (let i = 1; i <= 3; i++) {
    sumber.makeCopy(`salinan-${i}.txt`, folder);
  }

  console.log("3 salinan dibuat di folder: " + folder.getUrl());
}


/* =========================================================================
 * BAGIAN 2 — DocumentApp
 * ========================================================================= */

function contoh06_buatDocBaru() {
  const doc = DocumentApp.create("Demo Doc — " + new Date().toISOString());
  const body = doc.getBody();

  body.appendParagraph("Laporan Otomatis").setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph("Disusun oleh script Apps Script.");
  body.appendParagraph("");

  body.appendParagraph("Ringkasan").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendListItem("Total transaksi : 132");
  body.appendListItem("Total nilai     : Rp 1.250.000.000");
  body.appendListItem("Customer baru   : 18");

  body.appendParagraph("");
  body.appendParagraph("Catatan").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph("Dokumen ini bisa di-export ke PDF lewat menu File → Download.");

  console.log("Doc dibuat: " + doc.getUrl());
}

function contoh07_replaceTextDariTemplate() {
  // PRASYARAT: TEMPLATE_ID di atas sudah di-set ke ID Doc template Anda.
  // Template harus berisi placeholder {{nama}}, {{tanggal}}, {{nominal}}.

  if (TEMPLATE_ID === "GANTI_DENGAN_ID_DOC_TEMPLATE") {
    console.log("Set TEMPLATE_ID dulu di atas.");
    return;
  }

  const data = {
    nama: "Sari Wulandari",
    tanggal: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd MMMM yyyy"),
    nominal: "Rp 5.000.000"
  };

  const folder = DriveApp.getFolderById(FOLDER_ID);
  const copy = DriveApp.getFileById(TEMPLATE_ID).makeCopy(`Surat - ${data.nama}`, folder);
  const doc = DocumentApp.openById(copy.getId());
  const body = doc.getBody();

  Object.keys(data).forEach((key) => {
    body.replaceText(`\\{\\{${key}\\}\\}`, data[key]);
  });

  doc.saveAndClose();
  console.log("Surat siap: " + doc.getUrl());
}

function contoh08_exportDocKePDF() {
  // Ambil Doc paling baru di FOLDER_ID, lalu export jadi PDF.
  if (FOLDER_ID === "GANTI_DENGAN_ID_FOLDER_ANDA") {
    console.log("Set FOLDER_ID dulu di atas.");
    return;
  }

  const folder = DriveApp.getFolderById(FOLDER_ID);
  const docs = folder.getFilesByType(MimeType.GOOGLE_DOCS);
  if (!docs.hasNext()) {
    console.log("Tidak ada Google Doc di folder.");
    return;
  }

  const doc = docs.next();
  const pdfBlob = doc.getAs(MimeType.PDF);
  const pdfFile = folder.createFile(pdfBlob).setName(doc.getName() + ".pdf");

  console.log("PDF: " + pdfFile.getUrl());
}


/* =========================================================================
 * BAGIAN 3 — CalendarApp
 * ========================================================================= */

function contoh09_buatEventSederhana() {
  const cal = CalendarApp.getDefaultCalendar();

  // Bikin event 30 menit dari sekarang, durasi 1 jam
  const mulai   = new Date(Date.now() + 30 * 60 * 1000);
  const selesai = new Date(mulai.getTime() + 60 * 60 * 1000);

  const event = cal.createEvent("Demo Event Apps Script", mulai, selesai, {
    description: "Event ini dibuat otomatis dari script.",
    location: "Online"
  });

  console.log("Event ID: " + event.getId());
  console.log("Mulai   : " + mulai.toLocaleString("id-ID"));
}

function contoh10_buatEventAllDay() {
  const cal = CalendarApp.getDefaultCalendar();

  const besok = new Date();
  besok.setDate(besok.getDate() + 1);

  cal.createAllDayEvent("Reminder Demo (besok)", besok, {
    description: "Event seharian dari Apps Script."
  });

  console.log("All-day event dibuat untuk: " + besok.toLocaleDateString("id-ID"));
}

function contoh11_eventHariIni() {
  const cal = CalendarApp.getDefaultCalendar();
  const events = cal.getEventsForDay(new Date());

  console.log(`Anda punya ${events.length} event hari ini:`);
  events.forEach((e) => {
    const jam = e.getStartTime().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    console.log(`  ${jam} — ${e.getTitle()}`);
  });
}

function contoh12_eventBerulang() {
  const cal = CalendarApp.getDefaultCalendar();

  // Mulai besok jam 9 pagi, selama 30 menit, recurring weekly Senin, 4x
  const besok = new Date();
  besok.setDate(besok.getDate() + 1);
  besok.setHours(9, 0, 0, 0);
  const selesai = new Date(besok.getTime() + 30 * 60 * 1000);

  const recurrence = CalendarApp.newRecurrence()
    .addWeeklyRule()
    .onlyOnWeekday(CalendarApp.Weekday.MONDAY)
    .times(4);

  const series = cal.createEventSeries("Standup Demo (4x)", besok, selesai, recurrence);
  console.log("Event series ID: " + series.getId());
}


/* =========================================================================
 * BAGIAN 4 — Mini-project terpadu
 * ========================================================================= */

function contoh13_rapatDenganNotulen() {
  const judul    = "Sprint Review Demo";
  const mulai    = new Date(Date.now() + 24 * 60 * 60 * 1000); // besok jam segini
  const selesai  = new Date(mulai.getTime() + 60 * 60 * 1000);
  const peserta  = Session.getActiveUser().getEmail(); // kirim ke diri sendiri

  // 1) Folder notulen
  const folderName = "Notulen Rapat";
  const cari = DriveApp.getFoldersByName(folderName);
  const folder = cari.hasNext() ? cari.next() : DriveApp.createFolder(folderName);

  // 2) Doc notulen
  const doc = DocumentApp.create(`Notulen — ${judul}`);
  const body = doc.getBody();
  body.appendParagraph(judul).setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(`Tanggal : ${mulai.toLocaleString("id-ID")}`);
  body.appendParagraph(`Peserta : ${peserta}`);
  body.appendParagraph("");
  body.appendParagraph("Agenda").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendListItem("(isi agenda)");
  body.appendParagraph("");
  body.appendParagraph("Catatan").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph("(notulen rapat)");
  doc.saveAndClose();

  // 3) Pindah Doc ke folder
  DriveApp.getFileById(doc.getId()).moveTo(folder);

  // 4) Bikin event dengan link Doc
  const cal = CalendarApp.getDefaultCalendar();
  const event = cal.createEvent(judul, mulai, selesai, {
    description: `Notulen: ${doc.getUrl()}`,
    guests: peserta,
    sendInvites: false   // false supaya tidak spam saat demo
  });

  console.log("=== Selesai ===");
  console.log("Event: " + event.getId());
  console.log("Doc  : " + doc.getUrl());
}


/* =========================================================================
 * Helper jalankan beberapa contoh aman
 * (Skip yang bikin event/Doc/folder banyak supaya tidak spam Drive Anda.)
 * ========================================================================= */

function jalankanDemoAman() {
  console.log("=== contoh01 ===");
  contoh01_listFolderAktif();

  console.log("\n=== contoh11 ===");
  contoh11_eventHariIni();
}
