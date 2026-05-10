/**
 * Modul 4 — Solusi Latihan
 */


/* ----- Soal 1: Salam Pribadi ----- */
function kirimSalamPribadi() {
  const email = Session.getActiveUser().getEmail();
  const nama  = email.split("@")[0];
  const jam   = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  MailApp.sendEmail({
    to: email,
    subject: `Halo, ${nama}!`,
    body: `Halo ${nama}, ini email dari script Anda. Jam: ${jam}`,
    htmlBody: `
      <div style="font-family: Arial; max-width: 500px;">
        <h3 style="color: #1e40af;">Halo, ${nama}!</h3>
        <p>Email ini dikirim oleh script Anda sendiri pada pukul <b>${jam}</b>.</p>
      </div>
    `
  });
  console.log("Email salam terkirim ke " + email);
}


/* ----- Soal 2: Pengaman Quota ----- */
function kirimAman(daftarEmail, subject, htmlBody) {
  const sisa = MailApp.getRemainingDailyQuota();

  if (sisa < daftarEmail.length) {
    console.log(`⚠ Quota tidak cukup. Sisa: ${sisa}, butuh: ${daftarEmail.length}. Tidak mengirim.`);
    return;
  }

  let count = 0;
  daftarEmail.forEach((email) => {
    MailApp.sendEmail({
      to: email,
      subject: subject,
      body: htmlBody.replace(/<[^>]+>/g, ""),
      htmlBody: htmlBody
    });
    count++;
  });
  console.log(`Sukses: ${count} email terkirim.`);
}

function ujiKirimAman() {
  kirimAman([Session.getActiveUser().getEmail()], "Test", "<p>Hai</p>");
}


/* ----- Soal 3: Newsletter Template -----
 * PRASYARAT: tambah file HTML "template-newsletter" di project, dengan
 * placeholder <?= judul ?>, <?= isi ?>, <?= namaProgram ?>.
 */
function kirimNewsletter(daftarPenerima) {
  const tmpl = HtmlService.createTemplateFromFile("template-newsletter");
  tmpl.judul = "Update Bulan Ini";
  tmpl.isi = "Berikut tiga hal penting bulan ini: peluncuran fitur X, kerjasama Y, dan event Z.";
  tmpl.namaProgram = "Program Loyalty 2026";

  const html = tmpl.evaluate().getContent();

  daftarPenerima.forEach((email) => {
    MailApp.sendEmail({
      to: email,
      subject: tmpl.judul,
      body: tmpl.isi,
      htmlBody: html
    });
  });
  console.log(`Newsletter terkirim ke ${daftarPenerima.length} alamat.`);
}

function ujiNewsletter() {
  kirimNewsletter([Session.getActiveUser().getEmail()]);
}


/* ----- Soal 4: Attachment Multi-File ----- */
function kirimDenganLampiran() {
  const tanggal = Utilities.formatDate(
    new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"
  );

  const txtBlob = Utilities.newBlob(`Dibuat ${tanggal}`, "text/plain", "info.txt");

  const csvData = [
    ["ID", "Nama", "Nilai"],
    ["A1", "Sari", "85"],
    ["A2", "Budi", "72"],
    ["A3", "Tina", "90"]
  ];
  const csvText = csvData.map((r) => r.join(",")).join("\n");
  const csvBlob = Utilities.newBlob(csvText, "text/csv", "data.csv");

  MailApp.sendEmail({
    to: Session.getActiveUser().getEmail(),
    subject: "Multi-Lampiran",
    body: "Terlampir 2 file.",
    attachments: [txtBlob, csvBlob]
  });
  console.log("Email dengan 2 lampiran terkirim.");
}


/* ----- Soal 5: Audit Inbox per Domain ----- */
function auditInbox7Hari() {
  const threads = GmailApp.search("is:unread newer_than:7d", 0, 200);

  const perDomain = {};
  threads.forEach((thread) => {
    const m = thread.getMessages()[0];
    const from = m.getFrom();
    const match = from.match(/<([^>]+)>/) || [null, from];
    const email = match[1];
    const domain = "@" + (email.split("@")[1] || "unknown");
    perDomain[domain] = (perDomain[domain] || 0) + 1;
  });

  const sorted = Object.entries(perDomain).sort((a, b) => b[1] - a[1]);
  console.log(`Audit inbox 7 hari (unread): ${threads.length} thread total`);
  sorted.forEach(([domain, count]) => {
    console.log(`  ${domain.padEnd(20)} : ${count} email`);
  });
}


/* ----- Soal 6: Auto-Save Invoice PDF ----- */
function simpanLampiranKePDF() {
  const PARENT_FOLDER_ID = "GANTI_DENGAN_ID_FOLDER_INVOICES";
  if (PARENT_FOLDER_ID === "GANTI_DENGAN_ID_FOLDER_INVOICES") {
    console.log("Set PARENT_FOLDER_ID dulu.");
    return;
  }

  const parent = DriveApp.getFolderById(PARENT_FOLDER_ID);
  const label  = GmailApp.getUserLabelByName("Saved-Invoice") ||
                 GmailApp.createLabel("Saved-Invoice");

  const threads = GmailApp.search(
    "has:attachment subject:invoice newer_than:30d -label:Saved-Invoice",
    0, 50
  );

  let saved = 0;
  threads.forEach((thread) => {
    thread.getMessages().forEach((msg) => {
      const tanggal = Utilities.formatDate(
        msg.getDate(), Session.getScriptTimeZone(), "yyyy-MM-dd"
      );
      const bulanLabel = Utilities.formatDate(
        msg.getDate(), Session.getScriptTimeZone(), "MMM-yyyy"
      );

      // Bikin/cari subfolder bulan
      const cari = parent.getFoldersByName(bulanLabel);
      const sub = cari.hasNext() ? cari.next() : parent.createFolder(bulanLabel);

      msg.getAttachments().forEach((att) => {
        if (att.getContentType() === "application/pdf") {
          const fileName = `${tanggal}-${att.getName()}`;
          sub.createFile(att.copyBlob().setName(fileName));
          saved++;
        }
      });
    });
    thread.addLabel(label);
  });

  console.log(`${saved} PDF disimpan.`);
}


/* ----- Soal 7: Pengaduan + Eskalasi ----- */
function prosesPengaduan() {
  const SHEET_ID = "GANTI_DENGAN_ID_SHEET";
  if (SHEET_ID === "GANTI_DENGAN_ID_SHEET") {
    console.log("Set SHEET_ID dulu.");
    return;
  }

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Pengaduan");
  const range = sheet.getDataRange();
  const data  = range.getValues();
  const h = data[0];

  const c = {
    email:  h.indexOf("Email"),
    judul:  h.indexOf("Judul"),
    desk:   h.indexOf("Deskripsi"),
    prio:   h.indexOf("Prioritas"),
    status: h.indexOf("Status"),
    time:   h.indexOf("Auto-Reply Time"),
    pic:    h.indexOf("Tim PIC")
  };

  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
  const ESKALASI_EMAIL = Session.getActiveUser().getEmail();   // ganti ke escalation@team.id di production

  const picMap = {
    "Tinggi": "Manager",
    "Sedang": "Senior CS",
    "Rendah": "CS Junior"
  };

  let proses = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][c.status] !== "Baru") continue;

    const judul = data[i][c.judul];
    const prio  = data[i][c.prio];

    // 1) Auto-reply ke pelapor
    MailApp.sendEmail({
      to: data[i][c.email],
      subject: `[Diterima] ${judul}`,
      body: `Pengaduan Anda diterima.`,
      htmlBody: `
        <p>Halo,</p>
        <p>Pengaduan "<b>${judul}</b>" dengan prioritas <b>${prio}</b> sudah masuk ke sistem kami.</p>
        <p>Tim ${picMap[prio]} akan menindaklanjuti dalam waktu dekat.</p>
      `
    });

    // 2) Eskalasi tinggi
    if (prio === "Tinggi") {
      MailApp.sendEmail({
        to: ESKALASI_EMAIL,
        subject: `[ESKALASI TINGGI] ${judul}`,
        body: `Pengaduan prioritas TINGGI:\n\nJudul: ${judul}\nDari: ${data[i][c.email]}\nDeskripsi: ${data[i][c.desk]}`
      });
    }

    // 3) Update kolom-kolom
    data[i][c.status] = "Auto-Replied";
    data[i][c.time]   = stamp;
    data[i][c.pic]    = picMap[prio] || "Tidak terdefinisi";
    proses++;
  }

  range.setValues(data);
  console.log(`${proses} pengaduan diproses.`);
}
