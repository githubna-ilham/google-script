/**
 * Modul 3 — Solusi Latihan
 *
 * Tiga latihan integrasi mengikuti alur kronologis pelatihan (kerjakan berurutan):
 *   Soal 1: Sheets ↔ Calendar — jadwal pelatihan + undang peserta   [Sebelum pelatihan]
 *   Soal 2: Sheets ↔ Docs     — generate Surat Keterangan Lulus     [Setelah pelatihan]
 *   Soal 3: Sheets ↔ Gmail    — kirim email + PDF sertifikat        [Distribusi]
 *
 * Setup:
 *   - Set SHEET_ID  ke ID Sheet "Latihan-M3".
 *   - Set FOLDER_ID ke ID folder Drive "Latihan-M3-Output" (untuk Soal 2).
 *   - Pastikan minimal 1–2 email di tab Peserta adalah email Anda sendiri
 *     supaya bisa verifikasi undangan (Soal 1) & email sertifikat (Soal 3) tanpa spam orang lain.
 */

const SHEET_ID  = "GANTI_DENGAN_ID_SHEET_LATIHAN_M3";
const FOLDER_ID = "GANTI_DENGAN_ID_FOLDER_OUTPUT";

function _ss() {
  if (SHEET_ID && SHEET_ID !== "GANTI_DENGAN_ID_SHEET_LATIHAN_M3") {
    return SpreadsheetApp.openById(SHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/** Baca tab → array of object pakai header sebagai key. */
function _readAsObjects(sheetName) {
  const sheet = _ss().getSheetByName(sheetName);
  const data  = sheet.getDataRange().getValues();
  const headers = data.shift();
  return data.map((row) => {
    const obj = {};
    headers.forEach((k, i) => { obj[k] = row[i]; });
    return obj;
  });
}

/** Map kode program → object program (untuk lookup nama/biaya/tanggal). */
function _mapProgram() {
  const map = {};
  _readAsObjects("Program").forEach((p) => { map[p.Kode] = p; });
  return map;
}

/** Format Date → "yyyy-MM-dd". */
function _fmtTanggal(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
}

/** Ambil Doc/File ID dari URL Google Docs/Drive. */
function _extractDocId(url) {
  const m = String(url).match(/\/d\/([^\/]+)/);
  if (!m) throw new Error(`URL tidak valid (tidak ada /d/{id}/ di "${url}")`);
  return m[1];
}


/* ===================================================================
 * Soal 1 — Sheets ↔ Calendar: Jadwal Pelatihan + Undangan Peserta
 * (Fase: sebelum pelatihan dimulai)
 * =================================================================== */
function buatJadwalPelatihan() {
  const ss = _ss();
  const shProg = ss.getSheetByName("Program");
  const dataProg = shProg.getDataRange().getValues();
  const hProg = dataProg[0];

  // Tambah kolom "Event ID" kalau belum ada
  let cEvent = hProg.indexOf("Event ID");
  if (cEvent === -1) {
    shProg.getRange(1, hProg.length + 1).setValue("Event ID");
    hProg.push("Event ID");
    cEvent = hProg.length - 1;
    // Sinkronkan dataProg supaya kolomnya ada
    for (let i = 1; i < dataProg.length; i++) dataProg[i].push("");
  }

  const cKode      = hProg.indexOf("Kode");
  const cNamaProg  = hProg.indexOf("Nama Program");
  const cBiaya     = hProg.indexOf("Biaya");
  const cTglMulai  = hProg.indexOf("Tanggal Mulai");
  const cTglSelesai= hProg.indexOf("Tanggal Selesai");
  const cLokasi    = hProg.indexOf("Lokasi");

  // Kumpulkan email peserta per program (skip Tidak Lulus)
  const pesertaMap = {};   // kodeProgram → [email, ...]
  _readAsObjects("Peserta").forEach((p) => {
    if (p.Status === "Tidak Lulus" || !p.Email) return;
    if (!pesertaMap[p.Program]) pesertaMap[p.Program] = [];
    pesertaMap[p.Program].push(p.Email);
  });

  const cal = CalendarApp.getDefaultCalendar();
  let dibuat = 0;

  for (let i = 1; i < dataProg.length; i++) {
    if (dataProg[i][cEvent]) continue;  // idempotent: skip kalau sudah ada Event ID

    const kode    = dataProg[i][cKode];
    const nama    = dataProg[i][cNamaProg];
    const biaya   = dataProg[i][cBiaya];
    const lokasi  = dataProg[i][cLokasi];
    const tMulai  = dataProg[i][cTglMulai];
    const tSelesai= dataProg[i][cTglSelesai];

    if (!(tMulai instanceof Date) || !(tSelesai instanceof Date)) {
      console.log(`Skip ${kode}: tanggal belum di-format sebagai Date.`);
      continue;
    }

    // Set jam: mulai 09:00, selesai 17:00
    const start = new Date(tMulai.getFullYear(),  tMulai.getMonth(),  tMulai.getDate(),  9, 0);
    const end   = new Date(tSelesai.getFullYear(),tSelesai.getMonth(),tSelesai.getDate(),17, 0);

    const guests = (pesertaMap[kode] || []).join(",");

    const event = cal.createEvent(`${kode} — ${nama}`, start, end, {
      description: `Lokasi: ${lokasi}\nBiaya: Rp ${Number(biaya).toLocaleString("id-ID")}`,
      guests: guests,
      sendInvites: true
    });

    dataProg[i][cEvent] = event.getId();
    dibuat++;
  }

  // Tulis ulang tab Program (1 round-trip)
  shProg.getRange(1, 1, dataProg.length, dataProg[0].length).setValues(dataProg);

  console.log(`${dibuat} event baru dibuat di Calendar.`);
}


/* ===================================================================
 * Soal 2 — Sheets ↔ Docs: Generate Surat Keterangan Lulus
 * (Fase: setelah pelatihan selesai)
 * =================================================================== */
function generateSuratKeterangan() {
  if (!FOLDER_ID || FOLDER_ID === "GANTI_DENGAN_ID_FOLDER_OUTPUT") {
    throw new Error("Set FOLDER_ID dulu ke ID folder Latihan-M3-Output.");
  }
  const folder = DriveApp.getFolderById(FOLDER_ID);

  const sheet  = _ss().getSheetByName("Peserta");
  const range  = sheet.getDataRange();
  const data   = range.getValues();
  const headers = data[0];

  const cId      = headers.indexOf("ID Peserta");
  const cNama    = headers.indexOf("Nama");
  const cInstansi= headers.indexOf("Instansi");
  const cProgKd  = headers.indexOf("Program");
  const cNilai   = headers.indexOf("Nilai");
  const cStatus  = headers.indexOf("Status");
  const cLink    = headers.indexOf("Link Sertifikat");

  const programMap = _mapProgram();
  const tz = Session.getScriptTimeZone();
  const noBulan   = Utilities.formatDate(new Date(), tz, "yyyy-MM");
  const tglHariIni = Utilities.formatDate(new Date(), tz, "d MMMM yyyy");

  let dibuat = 0;
  for (let i = 1; i < data.length; i++) {
    const status     = data[i][cStatus];
    const sudahPunya = data[i][cLink];
    if (status !== "Lulus" || sudahPunya) continue;

    const idPst   = data[i][cId];
    const nama    = data[i][cNama];
    const instansi= data[i][cInstansi];
    const kodeProg= data[i][cProgKd];
    const nilai   = data[i][cNilai];
    const prog    = programMap[kodeProg] || {};
    const namaProg= prog["Nama Program"] || kodeProg;
    const tglMulai  = prog["Tanggal Mulai"]   ? _fmtTanggal(prog["Tanggal Mulai"])   : "-";
    const tglSelesai= prog["Tanggal Selesai"] ? _fmtTanggal(prog["Tanggal Selesai"]) : "-";

    // Bikin Doc baru
    const doc  = DocumentApp.create(`Surat Keterangan - ${nama}`);
    const body = doc.getBody();
    body.clear();

    body.appendParagraph("SURAT KETERANGAN LULUS")
        .setHeading(DocumentApp.ParagraphHeading.HEADING1)
        .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    body.appendParagraph(`Nomor: SKL/${idPst}/${noBulan}`);
    body.appendParagraph("");
    body.appendParagraph("Dengan ini menyatakan bahwa:");
    body.appendParagraph("");
    body.appendParagraph(`Nama         : ${nama}`);
    body.appendParagraph(`Instansi     : ${instansi}`);
    body.appendParagraph(`Program      : ${namaProg}`);
    body.appendParagraph(`Periode      : ${tglMulai} s.d. ${tglSelesai}`);
    body.appendParagraph(`Nilai Akhir  : ${nilai}`);
    body.appendParagraph("");
    body.appendParagraph("telah dinyatakan LULUS dan berhak mendapatkan sertifikat.");
    body.appendParagraph("");
    body.appendParagraph(`Jakarta, ${tglHariIni}`);
    body.appendParagraph("Penyelenggara Pelatihan");

    doc.saveAndClose();

    // Pindahkan ke folder output
    DriveApp.getFileById(doc.getId()).moveTo(folder);

    data[i][cLink] = doc.getUrl();
    dibuat++;
  }

  // Tulis ulang kolom Link Sertifikat dalam 1 round-trip
  const kolomLink = data.map((r) => [r[cLink]]);
  sheet.getRange(1, cLink + 1, kolomLink.length, 1).setValues(kolomLink);

  console.log(`${dibuat} Doc dibuat di folder Latihan-M3-Output.`);
}


/* ===================================================================
 * Soal 3 — Sheets ↔ Gmail: Kirim Sertifikat via Email
 * (Fase: distribusi ke peserta)
 *
 * Prasyarat: Soal 2 sudah dijalankan sehingga kolom "Link Sertifikat"
 * terisi untuk peserta Lulus.
 * =================================================================== */
function kirimSertifikatEmail() {
  const sheet  = _ss().getSheetByName("Peserta");
  const range  = sheet.getDataRange();
  const data   = range.getValues();
  const headers = data[0];

  const cId      = headers.indexOf("ID Peserta");
  const cNama    = headers.indexOf("Nama");
  const cEmail   = headers.indexOf("Email");
  const cProgKd  = headers.indexOf("Program");
  const cNilai   = headers.indexOf("Nilai");
  const cStatus  = headers.indexOf("Status");
  const cNotif   = headers.indexOf("Notif Email");
  const cLink    = headers.indexOf("Link Sertifikat");

  const programMap = _mapProgram();
  const stamp = Utilities.formatDate(
    new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm"
  );

  let terkirim = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][cStatus] !== "Lulus" || data[i][cNotif]) continue;

    // Skip kalau Link Sertifikat masih kosong — Soal 2 harus dijalankan dulu
    const linkDoc = data[i][cLink];
    if (!linkDoc) {
      console.log(`Skip ${data[i][cId]}: belum punya Link Sertifikat — jalankan Soal 2 dulu.`);
      continue;
    }

    const idPst    = data[i][cId];
    const nama     = data[i][cNama];
    const email    = data[i][cEmail];
    const kodeProg = data[i][cProgKd];
    const nilai    = data[i][cNilai];
    const namaProg = (programMap[kodeProg] || {})["Nama Program"] || kodeProg;

    // Ambil Doc sertifikat → konversi ke PDF blob untuk attachment
    const docId = _extractDocId(linkDoc);
    const pdfBlob = DriveApp.getFileById(docId)
      .getAs("application/pdf")
      .setName(`Surat-Keterangan-${idPst}.pdf`);

    MailApp.sendEmail({
      to: email,
      subject: `[Sertifikat] ${namaProg} — ${nama}`,
      body: [
        `Halo ${nama},`,
        ``,
        `Selamat! Anda telah dinyatakan LULUS pada program berikut:`,
        ``,
        `Nama Program : ${namaProg}`,
        `Nilai Akhir  : ${nilai}`,
        ``,
        `Surat Keterangan Lulus Anda terlampir sebagai PDF pada email ini.`,
        ``,
        `Salam,`,
        `Penyelenggara Pelatihan`
      ].join("\n"),
      attachments: [pdfBlob]
    });

    data[i][cNotif] = stamp;
    terkirim++;
  }

  // Tulis ulang kolom Notif Email dalam 1 round-trip
  const kolomNotif = data.map((r) => [r[cNotif]]);
  sheet.getRange(1, cNotif + 1, kolomNotif.length, 1).setValues(kolomNotif);

  console.log(`${terkirim} email dikirim.`);
}
