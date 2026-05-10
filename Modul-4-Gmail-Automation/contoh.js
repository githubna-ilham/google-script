/**
 * Modul 4 — Gmail Automation
 *
 * Catatan keamanan:
 *   - Jangan jalankan contoh yang kirim banyak email tanpa modifikasi.
 *   - Default semua contoh kirim ke email Anda sendiri (Session.getActiveUser).
 *   - Cek quota: Logger.log(MailApp.getRemainingDailyQuota());
 */


/* =========================================================================
 * BAGIAN 1 — Kirim Email Dasar
 * ========================================================================= */

function contoh01_kirimSederhana() {
  const me = Session.getActiveUser().getEmail();
  MailApp.sendEmail(me, "Demo Modul 4 — Sederhana", "Hai, ini email plain text.");
  Logger.log("Terkirim ke " + me);
}

function contoh02_kirimLengkap() {
  const me = Session.getActiveUser().getEmail();
  MailApp.sendEmail({
    to: me,
    subject: "Demo Modul 4 — Lengkap",
    body: "Versi plain text untuk fallback.",
    htmlBody: `
      <div style="font-family: Arial; max-width: 500px;">
        <h2 style="color: #1e40af;">Halo dari Apps Script</h2>
        <p>Email ini dikirim dengan format <b>HTML</b> dan plain text fallback.</p>
        <a href="https://script.google.com" style="background: #3b82f6; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">Lihat Editor</a>
      </div>
    `,
    name: "Bot Otomasi M4",
    replyTo: me
  });
  Logger.log("Email lengkap terkirim.");
}

function contoh03_cekQuota() {
  Logger.log("Sisa quota hari ini: " + MailApp.getRemainingDailyQuota());
}


/* =========================================================================
 * BAGIAN 2 — Template HTML
 *
 * PRASYARAT: di project Anda, klik + di sidebar → HTML → beri nama
 * "template-konfirmasi". Isi sesuai materi.md §3.
 * ========================================================================= */

function contoh04_kirimTemplate() {
  const data = {
    email:  Session.getActiveUser().getEmail(),
    nama:   "Sari",
    nomor:  "TRX-001",
    produk: "Mouse",
    qty:    3,
    total:  "450.000"
  };

  const tmpl = HtmlService.createTemplateFromFile("template-konfirmasi");
  Object.keys(data).forEach((k) => { tmpl[k] = data[k]; });
  const html = tmpl.evaluate().getContent();

  MailApp.sendEmail({
    to: data.email,
    subject: `Konfirmasi Pesanan ${data.nomor}`,
    body: `Pesanan ${data.nomor} dikonfirmasi.`,
    htmlBody: html
  });
  Logger.log("Template terkirim.");
}


/* =========================================================================
 * BAGIAN 3 — Attachment
 * ========================================================================= */

function contoh05_attachmentDariDrive() {
  // Set FILE_ID dengan ID file di Drive Anda
  const FILE_ID = "GANTI_DENGAN_ID_FILE";
  if (FILE_ID === "GANTI_DENGAN_ID_FILE") {
    Logger.log("Set FILE_ID dulu.");
    return;
  }

  const blob = DriveApp.getFileById(FILE_ID).getBlob();
  MailApp.sendEmail({
    to: Session.getActiveUser().getEmail(),
    subject: "Demo — Attachment dari Drive",
    body: "Terlampir file dari Drive.",
    attachments: [blob]
  });
}

function contoh06_attachmentCSV() {
  // Buat CSV manual lalu kirim sebagai attachment
  const data = [
    ["Nama", "Divisi", "Gaji"],
    ["Sari", "Finance", 8000000],
    ["Budi", "Marketing", 7500000]
  ];

  const csv = data.map((row) =>
    row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  const blob = Utilities.newBlob(csv, "text/csv", "data-karyawan.csv");

  MailApp.sendEmail({
    to: Session.getActiveUser().getEmail(),
    subject: "Demo — Attachment CSV",
    body: "Terlampir export CSV.",
    attachments: [blob]
  });
}

function contoh07_exportDocSebagaiPDF() {
  // Set DOC_ID
  const DOC_ID = "GANTI_DENGAN_ID_DOC";
  if (DOC_ID === "GANTI_DENGAN_ID_DOC") {
    Logger.log("Set DOC_ID dulu.");
    return;
  }

  const pdfBlob = DriveApp.getFileById(DOC_ID).getAs("application/pdf");

  MailApp.sendEmail({
    to: Session.getActiveUser().getEmail(),
    subject: "Demo — Export PDF",
    body: "Terlampir Doc → PDF.",
    attachments: [pdfBlob.setName("Laporan.pdf")]
  });
}


/* =========================================================================
 * BAGIAN 4 — Baca & Proses Email Masuk
 * ========================================================================= */

function contoh08_searchEmail() {
  const threads = GmailApp.search("is:unread newer_than:7d", 0, 10);

  Logger.log(`Ditemukan ${threads.length} thread belum dibaca dalam 7 hari.`);
  threads.forEach((t, i) => {
    const m = t.getMessages()[0];
    Logger.log(`${i + 1}. [${m.getDate().toLocaleDateString("id-ID")}] ${m.getFrom()} — ${m.getSubject()}`);
  });
}

function contoh09_simpanAttachmentKeDrive() {
  // Set FOLDER_ID untuk folder tujuan
  const FOLDER_ID = "GANTI_DENGAN_ID_FOLDER";
  if (FOLDER_ID === "GANTI_DENGAN_ID_FOLDER") {
    Logger.log("Set FOLDER_ID dulu.");
    return;
  }

  const folder = DriveApp.getFolderById(FOLDER_ID);
  const threads = GmailApp.search("has:attachment newer_than:30d -label:Saved", 0, 10);

  // Bikin/cari label "Saved"
  const label = GmailApp.getUserLabelByName("Saved") || GmailApp.createLabel("Saved");

  let count = 0;
  threads.forEach((thread) => {
    thread.getMessages().forEach((msg) => {
      msg.getAttachments().forEach((att) => {
        folder.createFile(att);
        count++;
      });
    });
    thread.addLabel(label);
  });

  Logger.log(`${count} attachment disimpan ke Drive.`);
}


/* =========================================================================
 * BAGIAN 5 — Mini-project: Auto-reply Pengaduan
 *
 * PRASYARAT: bikin Sheet bernama "Pengaduan" dengan header:
 *   Email | Judul | Deskripsi | Status | Auto-Reply Time
 *
 * Isi 2-3 baris dengan Status "Baru" dan Email = email Anda sendiri.
 * ========================================================================= */

function contoh10_autoReplyPengaduan() {
  // Set SHEET_ID
  const SHEET_ID = "GANTI_DENGAN_ID_SHEET";
  if (SHEET_ID === "GANTI_DENGAN_ID_SHEET") {
    Logger.log("Set SHEET_ID dulu.");
    return;
  }

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Pengaduan");
  if (!sheet) {
    Logger.log("Tab 'Pengaduan' tidak ada.");
    return;
  }

  const range = sheet.getDataRange();
  const data  = range.getValues();
  const headers = data[0];

  const cEmail  = headers.indexOf("Email");
  const cJudul  = headers.indexOf("Judul");
  const cStatus = headers.indexOf("Status");
  const cTime   = headers.indexOf("Auto-Reply Time");

  const stamp = Utilities.formatDate(
    new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm"
  );

  let kirim = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][cStatus] === "Baru") {
      const html = `
        <div style="font-family: Arial; max-width: 600px;">
          <h3>Pengaduan Anda diterima</h3>
          <p>Halo,</p>
          <p>Pengaduan dengan judul "<b>${data[i][cJudul]}</b>" sudah masuk ke sistem kami dan akan segera ditindaklanjuti.</p>
          <p>Tim kami akan menghubungi Anda dalam 1×24 jam.</p>
          <p>Terima kasih.</p>
        </div>
      `;

      MailApp.sendEmail({
        to: data[i][cEmail],
        subject: `[Diterima] ${data[i][cJudul]}`,
        body: `Pengaduan "${data[i][cJudul]}" diterima.`,
        htmlBody: html
      });

      data[i][cStatus] = "Auto-Replied";
      data[i][cTime]   = stamp;
      kirim++;
    }
  }

  range.setValues(data);
  Logger.log(`${kirim} pengaduan auto-reply.`);
}


/* =========================================================================
 * Helper: jalankan demo aman (tidak kirim ke siapa-siapa selain diri sendiri)
 * ========================================================================= */

function jalankanDemoAman() {
  contoh03_cekQuota();
  contoh01_kirimSederhana();
  contoh08_searchEmail();
}
