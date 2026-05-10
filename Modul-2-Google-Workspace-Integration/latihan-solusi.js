/**
 * Modul 2 — Solusi Latihan
 *
 * Catatan:
 * - Set FOLDER_ID dan TEMPLATE_ID di bawah sebelum jalankan.
 * - Beberapa solusi membuat banyak file di Drive — pakai folder khusus
 *   `Latihan-M2` supaya mudah dibersihkan.
 */

const FOLDER_ID   = "GANTI_DENGAN_ID_FOLDER_LATIHAN_M2";
const TEMPLATE_ID = "GANTI_DENGAN_ID_TEMPLATE_SURAT";


/* ----- Soal 1: Inventaris Folder ----- */
function inventarisFolder() {
  const folder = DriveApp.getFolderById(FOLDER_ID);

  ["Input", "Output", "Arsip"].forEach((nama) => {
    const sub = folder.createFolder(nama);
    sub.createFile(`${nama}.txt`, `File untuk ${nama}`, "text/plain");
  });

  // Log struktur
  console.log(`${folder.getName()}/`);
  const subFolders = folder.getFolders();
  while (subFolders.hasNext()) {
    const sf = subFolders.next();
    let count = 0;
    const files = sf.getFiles();
    while (files.hasNext()) { files.next(); count++; }
    console.log(`  ${sf.getName()}/  → ${count} file`);
  }
}


/* ----- Soal 2: Audit File Lama ----- */
function auditFileLama(thresholdHari) {
  const batas = new Date();
  batas.setDate(batas.getDate() - thresholdHari);

  const tanggalQuery = Utilities.formatDate(
    batas,
    Session.getScriptTimeZone(),
    "yyyy-MM-dd"
  );

  const query = `modifiedDate < '${tanggalQuery}' and trashed = false`;
  const files = DriveApp.searchFiles(query);

  let counter = 0;
  console.log(`File yang tidak diupdate sejak ${tanggalQuery}:`);
  while (files.hasNext() && counter < 20) {
    const f = files.next();
    console.log(`  ${f.getName()} | ${f.getMimeType()} | ${f.getLastUpdated().toLocaleDateString("id-ID")}`);
    counter++;
  }
  console.log(`Total ditampilkan: ${counter} (dibatasi maks 20)`);
}


/* ----- Soal 3: Generator Surat Massal ----- */
function generateSuratMassal() {
  const peserta = [
    { nama: "Sari Wulandari", nominal: "Rp 5.000.000" },
    { nama: "Budi Santoso",   nominal: "Rp 3.500.000" },
    { nama: "Tina Permata",   nominal: "Rp 7.200.000" }
  ];

  const folder   = DriveApp.getFolderById(FOLDER_ID);
  const tanggal  = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "dd MMMM yyyy"
  );

  peserta.forEach((p) => {
    const copy = DriveApp.getFileById(TEMPLATE_ID).makeCopy(`Surat - ${p.nama}`, folder);
    const doc  = DocumentApp.openById(copy.getId());
    const body = doc.getBody();

    body.replaceText("\\{\\{nama\\}\\}", p.nama);
    body.replaceText("\\{\\{tanggal\\}\\}", tanggal);
    body.replaceText("\\{\\{nominal\\}\\}", p.nominal);

    doc.saveAndClose();
    console.log(`✓ ${p.nama} → ${doc.getUrl()}`);
  });
}


/* ----- Soal 4: Doc Laporan dari Data ----- */
function bikinLaporanHarian() {
  const transaksi = [
    { id: "T001", customer: "PT Alpha", nilai: 5000000 },
    { id: "T002", customer: "PT Beta",  nilai: 3500000 },
    { id: "T003", customer: "PT Gamma", nilai: 7200000 }
  ];

  const tanggal = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd"
  );
  const judul = `Laporan-${tanggal}`;
  const total = transaksi.reduce((sum, t) => sum + t.nilai, 0);

  const doc = DocumentApp.create(judul);
  const body = doc.getBody();

  body.appendParagraph("Laporan Transaksi Harian")
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(`Tanggal: ${tanggal}`);
  body.appendParagraph(`Total transaksi: ${transaksi.length}`);
  body.appendParagraph("");

  // Tabel
  const tableData = [["ID", "Customer", "Nilai"]];
  transaksi.forEach((t) => {
    tableData.push([t.id, t.customer, "Rp " + t.nilai.toLocaleString("id-ID")]);
  });
  body.appendTable(tableData);

  body.appendParagraph("");
  body.appendParagraph(`Total nilai: Rp ${total.toLocaleString("id-ID")}`)
      .setBold(true);

  doc.saveAndClose();

  // Pindah ke folder
  DriveApp.getFileById(doc.getId()).moveTo(DriveApp.getFolderById(FOLDER_ID));

  console.log("Doc: " + doc.getUrl());
  return doc;
}


/* ----- Soal 5: Doc + PDF Export ----- */
function bikinLaporanDanPDF() {
  const doc = bikinLaporanHarian();

  // Pastikan saved & closed
  const docFile = DriveApp.getFileById(doc.getId());
  const pdfBlob = docFile.getAs(MimeType.PDF);

  const folder = DriveApp.getFolderById(FOLDER_ID);
  const pdfFile = folder.createFile(pdfBlob).setName(doc.getName() + ".pdf");

  console.log("PDF: " + pdfFile.getUrl());
}


/* ----- Soal 6: Reminder Hari Libur ----- */
function bikinLibur() {
  const cal = CalendarApp.getDefaultCalendar();
  const sekarang = new Date();
  const bulanDepan = new Date(sekarang.getFullYear(), sekarang.getMonth() + 1, 1);

  const hari = [
    { tanggal: 1,  judul: "Liburan Demo A" },
    { tanggal: 5,  judul: "Liburan Demo B" },
    { tanggal: 10, judul: "Liburan Demo C" }
  ];

  hari.forEach((h) => {
    const tgl = new Date(bulanDepan);
    tgl.setDate(h.tanggal);
    cal.createAllDayEvent(h.judul, tgl, {
      description: "Dibuat otomatis lewat Apps Script"
    });
    console.log(`✓ ${h.judul} pada ${tgl.toLocaleDateString("id-ID")}`);
  });
}


/* ----- Soal 7: Cek Bentrok Jadwal ----- */
function cekBentrok(mulaiISO, selesaiISO) {
  const cal = CalendarApp.getDefaultCalendar();
  const mulai   = new Date(mulaiISO);
  const selesai = new Date(selesaiISO);

  const events = cal.getEvents(mulai, selesai);

  if (events.length === 0) {
    console.log("✓ Bebas — tidak ada event yang bentrok.");
    return false;
  }

  console.log(`⚠ Bentrok dengan ${events.length} event:`);
  events.forEach((e) => console.log(`  - ${e.getTitle()}`));
  return true;
}


/* ----- Soal 8: Booking Standup (Idempotent) ----- */
function bookingStandup(judul, mulaiISO, selesaiISO) {
  const cal = CalendarApp.getDefaultCalendar();
  const mulai   = new Date(mulaiISO);
  const selesai = new Date(selesaiISO);

  // 1) Cek duplikat dengan judul persis sama
  const existing = cal.getEvents(mulai, selesai)
    .filter((e) => e.getTitle() === judul);

  if (existing.length > 0) {
    console.log(`ℹ Sudah ada event: ${judul}`);
    return existing[0];
  }

  // 2) Bikin/cari folder Notulen
  const parent = DriveApp.getFolderById(FOLDER_ID);
  let notulenFolder;
  const cari = parent.getFoldersByName("Notulen");
  if (cari.hasNext()) {
    notulenFolder = cari.next();
  } else {
    notulenFolder = parent.createFolder("Notulen");
  }

  // 3) Bikin Doc notulen
  const tanggalLabel = Utilities.formatDate(
    mulai,
    Session.getScriptTimeZone(),
    "yyyy-MM-dd"
  );
  const doc = DocumentApp.create(`Notulen — ${judul} — ${tanggalLabel}`);
  const body = doc.getBody();
  body.appendParagraph(judul).setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(`Tanggal: ${mulai.toLocaleString("id-ID")}`);
  body.appendParagraph("");
  body.appendParagraph("Agenda").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendListItem("(isi agenda)");
  doc.saveAndClose();

  DriveApp.getFileById(doc.getId()).moveTo(notulenFolder);

  // 4) Bikin event dengan link Doc
  const event = cal.createEvent(judul, mulai, selesai, {
    description: `Notulen: ${doc.getUrl()}`
  });

  console.log(`✓ Berhasil booking: ${event.getId()}`);
  console.log(`  Doc: ${doc.getUrl()}`);
  return event;
}

function ujiBooking() {
  bookingStandup("Standup Demo", "2026-05-25T09:00:00+07:00", "2026-05-25T09:30:00+07:00");
  bookingStandup("Standup Demo", "2026-05-25T09:00:00+07:00", "2026-05-25T09:30:00+07:00"); // skip
}
