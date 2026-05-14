/**
 * Modul 8 — Solusi Latihan (Sistem Cuti)
 *
 * Solusi ini melengkapi sistem cuti di contoh.js.
 * Untuk Soal 1 dan 2, ada modifikasi langsung ke function existing —
 * di sini ditulis dengan komentar yang menjelaskan bagian yang berubah.
 */


/* ============================================================
 * SOAL 1 — Validasi Tanggal
 *
 * Tambahkan blok validasi ini di pengajuanCutiHandler,
 * SEBELUM "2. Cek kuota".
 * ============================================================ */

function _validasiTanggal(tglMulai, tglSelesai) {
  const mulai = new Date(tglMulai);
  const selesai = new Date(tglSelesai);

  // Normalisasi: bandingkan tanggal saja (jam = 00:00:00)
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);
  mulai.setHours(0, 0, 0, 0);
  selesai.setHours(0, 0, 0, 0);

  if (mulai < hariIni)   return "Tanggal mulai tidak boleh di masa lalu.";
  if (selesai < mulai)   return "Tanggal selesai harus setelah tanggal mulai.";

  const jumlahHari = Math.round((selesai - mulai) / (24 * 60 * 60 * 1000)) + 1;
  if (jumlahHari > 14)   return `Maksimal 14 hari per pengajuan (Anda ajukan ${jumlahHari} hari).`;

  return null;   // valid
}

// Contoh integrasi ke pengajuanCutiHandler (potong dari versi asli):
//
//   ...
//   data["Email"] = e.response.getRespondentEmail();
//
//   // ====== VALIDASI TANGGAL (Soal 1) ======
//   const errMsg = _validasiTanggal(data["Tanggal Mulai"], data["Tanggal Selesai"]);
//   if (errMsg) {
//     MailApp.sendEmail({
//       to: data["Email"],
//       subject: "❌ Pengajuan ditolak — validasi gagal",
//       body: `Halo ${data["Nama"]},\n\n${errMsg}\n\nSilakan ajukan ulang.`
//     });
//     _audit("tolak-validasi", { email: data["Email"], errMsg });
//     cache.put(`cuti:${responseId}`, "1", 21600);
//     return;
//   }
//   // =========================================
//
//   const sisa  = cekKuota(data["Email"]);
//   ...


/* ============================================================
 * SOAL 2 — Halaman Status Pribadi
 *
 * Tambahkan cabang ini di doGet, SEBELUM cek action.
 * ============================================================ */

function _halamanStatus(email) {
  if (!email) {
    return _halamanPesan(false, "Parameter ?email=... wajib.");
  }

  const sheet = _sheet("Pengajuan-Cuti");
  const data = sheet.getDataRange().getValues();
  const h = data[0];
  const cEmail = h.indexOf("Email");
  const cMulai = h.indexOf("Tanggal Mulai");
  const cSel   = h.indexOf("Tanggal Selesai");
  const cJenis = h.indexOf("Jenis Cuti");
  const cStat  = h.indexOf("Status");

  const riwayat = data.slice(1)
    .filter((r) => String(r[cEmail]).toLowerCase() === email.toLowerCase());

  const baris = riwayat.map((r) => `
    <tr>
      <td style="padding:6px 12px;border:1px solid #d1d5db;">${_fmtTanggal(r[cMulai])}</td>
      <td style="padding:6px 12px;border:1px solid #d1d5db;">${_fmtTanggal(r[cSel])}</td>
      <td style="padding:6px 12px;border:1px solid #d1d5db;">${r[cJenis]}</td>
      <td style="padding:6px 12px;border:1px solid #d1d5db;">${_badgeStatus(r[cStat])}</td>
    </tr>
  `).join("");

  const sisaKuota = cekKuota(email);

  return HtmlService.createHtmlOutput(`
    <html><body style="font-family:Arial;padding:30px;max-width:700px;margin:auto;">
      <h2>Riwayat Cuti — ${email}</h2>
      <p>Sisa kuota Anda: <b>${sisaKuota} hari</b></p>
      <table style="border-collapse:collapse;width:100%;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:6px 12px;border:1px solid #d1d5db;text-align:left;">Mulai</th>
            <th style="padding:6px 12px;border:1px solid #d1d5db;text-align:left;">Selesai</th>
            <th style="padding:6px 12px;border:1px solid #d1d5db;text-align:left;">Jenis</th>
            <th style="padding:6px 12px;border:1px solid #d1d5db;text-align:left;">Status</th>
          </tr>
        </thead>
        <tbody>${baris || '<tr><td colspan="4" style="padding:20px;text-align:center;color:#6b7280;">Belum ada pengajuan</td></tr>'}</tbody>
      </table>
    </body></html>
  `);
}

function _fmtTanggal(v) {
  return v instanceof Date
    ? Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd")
    : String(v);
}

function _badgeStatus(status) {
  const warna = { Pending: "#f59e0b", Approved: "#16a34a", Rejected: "#dc2626" }[status] || "#6b7280";
  return `<span style="color:white;background:${warna};padding:2px 8px;border-radius:4px;font-size:12px;">${status}</span>`;
}

// Cara integrasi di doGet:
//
//   function doGet(e) {
//     if (e.parameter.page === "status") {
//       return _halamanStatus(e.parameter.email);
//     }
//     // ... logic approve/reject yang sudah ada
//   }


/* ============================================================
 * SOAL 3 — Reminder Cuti Besok
 * ============================================================ */

function reminderCutiBesok() {
  const sheet = _sheet("Pengajuan-Cuti");
  const data = sheet.getDataRange().getValues();
  const h = data[0];
  const cNama  = h.indexOf("Nama");
  const cEmail = h.indexOf("Email");
  const cMulai = h.indexOf("Tanggal Mulai");
  const cSel   = h.indexOf("Tanggal Selesai");
  const cStat  = h.indexOf("Status");

  const tz = Session.getScriptTimeZone();
  const besok = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const besokStr = Utilities.formatDate(besok, tz, "yyyy-MM-dd");

  const adminEmail = _props().getProperty("ADMIN_EMAIL");
  let count = 0;

  for (let i = 1; i < data.length; i++) {
    if (data[i][cStat] !== "Approved") continue;

    const mulaiStr = _fmtTanggal(data[i][cMulai]);
    if (mulaiStr !== besokStr) continue;

    const nama  = data[i][cNama];
    const email = data[i][cEmail];
    const sel   = _fmtTanggal(data[i][cSel]);

    MailApp.sendEmail({
      to: email,
      cc: adminEmail,
      subject: `[Reminder] Cuti dimulai besok — ${nama}`,
      htmlBody: `<p>Halo ${nama},</p>` +
                `<p>Reminder: cuti Anda dimulai <b>besok</b> dan berakhir <b>${sel}</b>.</p>` +
                `<p>Pastikan handover pekerjaan sudah selesai. Selamat istirahat! 🌴</p>`
    });
    count++;
  }

  console.log(`Reminder dikirim ke ${count} karyawan.`);
  _audit("reminder-cuti", { tanggal: besokStr, count });
}

function pasangReminderTrigger() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === "reminderCutiBesok")
    .forEach((t) => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger("reminderCutiBesok")
    .timeBased().atHour(17).everyDays(1).create();

  console.log("Trigger reminder jam 17:00 terpasang ✓");
}


/* ============================================================
 * SOAL 4 — Reset Kuota Tahunan
 * ============================================================ */

function resetKuotaTahunan(paksa) {
  // getMonth() → 0 = Januari
  if (new Date().getMonth() !== 0 && !paksa) {
    throw new Error(
      "Reset kuota hanya boleh dijalankan di bulan Januari. " +
      "Untuk override, panggil resetKuotaTahunan(true)."
    );
  }

  const sheet = _sheet("Kuota-Cuti");
  const data = sheet.getDataRange().getValues();
  const cSisa = data[0].indexOf("Sisa");

  const updates = data.slice(1).map(() => [12]);   // semua di-set ke 12
  if (updates.length > 0) {
    sheet.getRange(2, cSisa + 1, updates.length, 1).setValues(updates);
  }

  _audit("reset-kuota-tahunan", { jumlahKaryawan: updates.length });
  console.log(`${updates.length} karyawan di-reset jadi 12 hari.`);
}


/* ============================================================
 * SOAL 5 — Dashboard HR
 * ============================================================ */

function _halamanDashboard() {
  // Auth sederhana
  const HR_EMAILS = (_props().getProperty("HR_EMAILS") || "")
    .split(",").map((s) => s.trim().toLowerCase());
  const userEmail = (Session.getActiveUser().getEmail() || "").toLowerCase();

  if (HR_EMAILS.length > 0 && !HR_EMAILS.includes(userEmail)) {
    return _halamanPesan(false, "Akses ditolak. Halaman ini hanya untuk HR.");
  }

  const sheet = _sheet("Pengajuan-Cuti");
  const data = sheet.getDataRange().getValues();
  const h = data[0];
  const cTime  = h.indexOf("Timestamp");
  const cNama  = h.indexOf("Nama");
  const cJenis = h.indexOf("Jenis Cuti");
  const cStat  = h.indexOf("Status");
  const cId    = h.indexOf("ID");
  const cMulai = h.indexOf("Tanggal Mulai");
  const cSel   = h.indexOf("Tanggal Selesai");

  const tz = Session.getScriptTimeZone();
  const bulanIni = Utilities.formatDate(new Date(), tz, "yyyy-MM");

  // 1. Total bulan ini
  const bulanIniRows = data.slice(1).filter((r) => {
    const t = r[cTime];
    if (!(t instanceof Date)) return false;
    return Utilities.formatDate(t, tz, "yyyy-MM") === bulanIni;
  });

  // 2. Breakdown status
  const statusCount = { Pending: 0, Approved: 0, Rejected: 0 };
  data.slice(1).forEach((r) => {
    if (statusCount[r[cStat]] !== undefined) statusCount[r[cStat]]++;
  });

  // 3. Top 3 jenis cuti
  const jenisCount = {};
  data.slice(1).forEach((r) => {
    const j = r[cJenis];
    jenisCount[j] = (jenisCount[j] || 0) + 1;
  });
  const top3 = Object.entries(jenisCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // 4. Pending list
  const webAppUrl = _props().getProperty("WEB_APP_URL");
  const pendingRows = data.slice(1)
    .filter((r) => r[cStat] === "Pending")
    .map((r) => `
      <tr>
        <td style="padding:6px 12px;border:1px solid #d1d5db;">${r[cNama]}</td>
        <td style="padding:6px 12px;border:1px solid #d1d5db;">${r[cJenis]}</td>
        <td style="padding:6px 12px;border:1px solid #d1d5db;">${_fmtTanggal(r[cMulai])} → ${_fmtTanggal(r[cSel])}</td>
        <td style="padding:6px 12px;border:1px solid #d1d5db;">
          <a href="${webAppUrl}?action=approve&id=${r[cId]}" style="color:#16a34a;">✓ Approve</a>
          &nbsp;|&nbsp;
          <a href="${webAppUrl}?action=reject&id=${r[cId]}"  style="color:#dc2626;">✗ Reject</a>
        </td>
      </tr>
    `).join("");

  return HtmlService.createHtmlOutput(`
    <html><body style="font-family:Arial;padding:30px;max-width:900px;margin:auto;">
      <h2>📊 Dashboard HR — Cuti</h2>

      <h3>Bulan ini</h3>
      <p>Total pengajuan: <b>${bulanIniRows.length}</b></p>

      <h3>Breakdown status (semua waktu)</h3>
      <ul>
        <li>Pending : ${statusCount.Pending}</li>
        <li>Approved: ${statusCount.Approved}</li>
        <li>Rejected: ${statusCount.Rejected}</li>
      </ul>

      <h3>Top 3 jenis cuti</h3>
      <ol>${top3.map(([j, n]) => `<li>${j} — ${n}×</li>`).join("")}</ol>

      <h3>Pending Approval</h3>
      <table style="border-collapse:collapse;width:100%;">
        <thead><tr style="background:#f3f4f6;">
          <th style="padding:6px 12px;border:1px solid #d1d5db;text-align:left;">Nama</th>
          <th style="padding:6px 12px;border:1px solid #d1d5db;text-align:left;">Jenis</th>
          <th style="padding:6px 12px;border:1px solid #d1d5db;text-align:left;">Periode</th>
          <th style="padding:6px 12px;border:1px solid #d1d5db;text-align:left;">Aksi</th>
        </tr></thead>
        <tbody>${pendingRows || '<tr><td colspan="4" style="padding:20px;text-align:center;color:#6b7280;">Tidak ada pending</td></tr>'}</tbody>
      </table>
    </body></html>
  `);
}

// Integrasi di doGet:
//
//   if (e.parameter.page === "dashboard") return _halamanDashboard();
