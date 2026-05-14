/**
 * Modul 8 — Sistem Cuti Lengkap
 *
 * File ini adalah implementasi lengkap dari step-by-step di materi.md.
 * Pasang di project Apps Script yang BOUND ke Spreadsheet "Sistem-Cuti".
 *
 * Required Script Properties:
 *   SHEET_ID      — ID Spreadsheet Sistem-Cuti
 *   FORM_ID       — ID Google Form "Pengajuan Cuti"
 *   ADMIN_EMAIL   — Email manager untuk notif approval
 *   WEB_APP_URL   — URL Web App (di-set setelah deploy pertama)
 *
 * Struktur Sheet:
 *   Tab "Kuota-Cuti"     : Email | Nama | Sisa
 *   Tab "Pengajuan-Cuti" : ID | Timestamp | Nama | Email | Jenis Cuti |
 *                          Tanggal Mulai | Tanggal Selesai | Alasan | Status
 *   Tab "Audit"          : Timestamp | User | Aksi | Detail
 */


// ============================================================
// Helper umum
// ============================================================

function _props() {
  return PropertiesService.getScriptProperties();
}

function _sheet(nama) {
  const SHEET_ID = _props().getProperty("SHEET_ID");
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(nama);
}

function _audit(aksi, detail) {
  _sheet("Audit").appendRow([
    new Date(),
    Session.getActiveUser().getEmail() || "system",
    aksi,
    JSON.stringify(detail).substring(0, 1000)
  ]);
}

// Hitung jumlah hari cuti (inclusive: 1-3 Juni = 3 hari)
function _hitungHari(tglMulai, tglSelesai) {
  const m = new Date(tglMulai);
  const s = new Date(tglSelesai);
  return Math.round((s - m) / (24 * 60 * 60 * 1000)) + 1;
}


// ============================================================
// Kuota
// ============================================================

function cekKuota(email) {
  const data = _sheet("Kuota-Cuti").getDataRange().getValues();
  const cEmail = data[0].indexOf("Email");
  const cSisa  = data[0].indexOf("Sisa");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][cEmail]).toLowerCase() === email.toLowerCase()) {
      return Number(data[i][cSisa]) || 0;
    }
  }
  return 0;
}

function kurangiKuota(email, jumlah) {
  const sheet = _sheet("Kuota-Cuti");
  const data = sheet.getDataRange().getValues();
  const cEmail = data[0].indexOf("Email");
  const cSisa  = data[0].indexOf("Sisa");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][cEmail]).toLowerCase() === email.toLowerCase()) {
      sheet.getRange(i + 1, cSisa + 1).setValue((data[i][cSisa] || 0) - jumlah);
      return;
    }
  }
}


// ============================================================
// Form Submit Handler (dipanggil otomatis oleh trigger)
// ============================================================

function pengajuanCutiHandler(e) {
  // === Anti double-proses: skip kalau response ini sudah pernah diproses ===
  const responseId = e.response.getId();
  const cache = CacheService.getScriptCache();
  if (cache.get(`cuti:${responseId}`)) {
    console.log("Sudah diproses. Skip.");
    return;
  }

  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    if (cache.get(`cuti:${responseId}`)) return;

    // 1. Ambil jawaban form
    const data = {};
    e.response.getItemResponses().forEach((item) => {
      data[item.getItem().getTitle()] = item.getResponse();
    });
    data["Email"] = e.response.getRespondentEmail();

    // 2. Cek kuota
    const sisa  = cekKuota(data["Email"]);
    const butuh = _hitungHari(data["Tanggal Mulai"], data["Tanggal Selesai"]);

    if (sisa < butuh) {
      MailApp.sendEmail({
        to: data["Email"],
        subject: "❌ Pengajuan cuti ditolak — kuota tidak cukup",
        body: `Halo ${data["Nama"]},\n\n` +
              `Maaf, sisa kuota Anda ${sisa} hari, sedangkan pengajuan ${butuh} hari.\n\n` +
              `Silakan koordinasi dengan HR.`
      });
      _audit("tolak-kuota", { email: data["Email"], sisa, butuh });
      cache.put(`cuti:${responseId}`, "1", 21600);
      return;
    }

    // 3. Simpan pengajuan ke Sheet
    const cutiId = "CUT-" + Date.now();
    _sheet("Pengajuan-Cuti").appendRow([
      cutiId, new Date(),
      data["Nama"], data["Email"], data["Jenis Cuti"],
      data["Tanggal Mulai"], data["Tanggal Selesai"],
      data["Alasan"] || "",
      "Pending"
    ]);

    // 4. Email manager dengan tombol approve/reject
    kirimEmailApproval(cutiId, data, butuh);

    _audit("submit", { cutiId, email: data["Email"], butuh });
    cache.put(`cuti:${responseId}`, "1", 21600);
  } catch (err) {
    _audit("submit-error", { error: err.message });
    throw err;
  } finally {
    lock.releaseLock();
  }
}


function kirimEmailApproval(cutiId, data, jumlahHari) {
  const adminEmail = _props().getProperty("ADMIN_EMAIL");
  const webAppUrl  = _props().getProperty("WEB_APP_URL") || "(belum di-set)";

  const linkOK    = `${webAppUrl}?action=approve&id=${cutiId}`;
  const linkBatal = `${webAppUrl}?action=reject&id=${cutiId}`;

  MailApp.sendEmail({
    to: adminEmail,
    subject: `[Approval Cuti] ${data["Nama"]} — ${jumlahHari} hari`,
    htmlBody: `
      <p><b>${data["Nama"]}</b> mengajukan cuti.</p>
      <ul>
        <li>Jenis: ${data["Jenis Cuti"]}</li>
        <li>Tanggal: ${data["Tanggal Mulai"]} — ${data["Tanggal Selesai"]} (${jumlahHari} hari)</li>
        <li>Alasan: ${data["Alasan"] || "(tidak diisi)"}</li>
      </ul>
      <p>
        <a href="${linkOK}"    style="background:#16a34a;color:white;padding:8px 16px;text-decoration:none;border-radius:4px;">✓ Approve</a>
        &nbsp;
        <a href="${linkBatal}" style="background:#dc2626;color:white;padding:8px 16px;text-decoration:none;border-radius:4px;">✗ Reject</a>
      </p>
    `
  });
}


// ============================================================
// Trigger setup (run sekali setelah autorisasi)
// ============================================================

function pasangTrigger() {
  const FORM_ID = _props().getProperty("FORM_ID");
  if (!FORM_ID) {
    console.log("Set FORM_ID dulu di Script Properties.");
    return;
  }

  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === "pengajuanCutiHandler")
    .forEach((t) => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger("pengajuanCutiHandler")
    .forForm(FormApp.openById(FORM_ID))
    .onFormSubmit()
    .create();

  console.log("Trigger terpasang ✓");
}


// ============================================================
// Web App: approve/reject
// ============================================================

function doGet(e) {
  const action = e.parameter.action;
  const id     = e.parameter.id;

  if (!action || !id) {
    return _halamanPesan(false, "Parameter tidak lengkap.");
  }

  const hasil = prosesApproval(id, action);
  return _halamanPesan(hasil.ok, hasil.pesan);
}


function prosesApproval(id, action) {
  if (action !== "approve" && action !== "reject") {
    return { ok: false, pesan: "Aksi tidak valid." };
  }

  const sheet = _sheet("Pengajuan-Cuti");
  const data = sheet.getDataRange().getValues();
  const h = data[0];
  const cId     = h.indexOf("ID");
  const cStatus = h.indexOf("Status");

  for (let i = 1; i < data.length; i++) {
    if (data[i][cId] !== id) continue;

    if (data[i][cStatus] !== "Pending") {
      return { ok: false, pesan: `Pengajuan sudah ${data[i][cStatus]}.` };
    }

    const status = action === "approve" ? "Approved" : "Rejected";
    sheet.getRange(i + 1, cStatus + 1).setValue(status);

    const nama  = data[i][h.indexOf("Nama")];
    const email = data[i][h.indexOf("Email")];
    const mulai = data[i][h.indexOf("Tanggal Mulai")];
    const sel   = data[i][h.indexOf("Tanggal Selesai")];

    if (action === "approve") {
      buatEventCalendar(nama, email, mulai, sel);
      kurangiKuota(email, _hitungHari(mulai, sel));

      MailApp.sendEmail({
        to: email,
        subject: "✅ Cuti Anda di-Approved",
        htmlBody: `<p>Halo ${nama},</p>` +
                  `<p>Pengajuan cuti Anda <b>${mulai} — ${sel}</b> telah disetujui. Event Calendar sudah dibuat.</p>`
      });
    } else {
      MailApp.sendEmail({
        to: email,
        subject: "❌ Cuti Anda di-Reject",
        htmlBody: `<p>Halo ${nama},</p>` +
                  `<p>Pengajuan cuti Anda <b>${mulai} — ${sel}</b> ditolak. Silakan hubungi manager.</p>`
      });
    }

    _audit("approval-" + action, { id, nama });
    return { ok: true, pesan: `Pengajuan ${nama} berhasil di-${status}.` };
  }

  return { ok: false, pesan: "ID tidak ditemukan." };
}


function buatEventCalendar(nama, emailKaryawan, tglMulai, tglSelesai) {
  const cal = CalendarApp.getDefaultCalendar();
  const mulai = new Date(tglMulai);
  // All-day event: tanggal selesai = hari setelah hari terakhir cuti
  const selesai = new Date(new Date(tglSelesai).getTime() + 24 * 60 * 60 * 1000);

  cal.createAllDayEvent(`Cuti — ${nama}`, mulai, selesai, {
    description: `Cuti karyawan ${nama}`,
    guests: emailKaryawan,
    sendInvites: true
  });
}


function _halamanPesan(ok, pesan) {
  const warna = ok ? "#16a34a" : "#dc2626";
  const icon  = ok ? "✅" : "❌";
  return HtmlService.createHtmlOutput(`
    <html><body style="font-family:Arial;padding:40px;max-width:500px;margin:auto;">
      <div style="border-left:4px solid ${warna};padding-left:16px;">
        <h2>${icon} ${ok ? "Berhasil" : "Gagal"}</h2>
        <p>${pesan}</p>
      </div>
    </body></html>
  `);
}


// ============================================================
// Helper untuk testing manual
// ============================================================

function ujiCekKuota() {
  // Ganti email di bawah dengan yang ada di tab Kuota-Cuti
  console.log("Sisa kuota:", cekKuota("ganti@email.com"));
}

function ujiHitungHari() {
  console.log(_hitungHari("2026-06-01", "2026-06-03"));   // harus 3
}
