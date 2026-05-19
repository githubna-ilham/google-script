/**
 * Modul 6 — Workflow Automation (Triggers)
 *
 * Konteks: lembaga pelatihan dengan tab Peserta & Program (lanjutan Modul 3 & 5).
 *
 * Cara aman bereksperimen:
 *   - Jalankan SETIAP function "kerjaan" manual via Run di editor dulu (untuk validasi).
 *   - Pasang trigger pakai function pasangXxx().
 *   - Cek hasil di sidebar Executions.
 *   - HAPUS trigger setelah selesai latihan: hapusSemuaTrigger().
 */


/* =========================================================================
 * BAGIAN 1 — Manajemen trigger
 * ========================================================================= */

function listTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  console.log(`Total trigger aktif: ${triggers.length}`);
  triggers.forEach((t) => {
    console.log(`  ${t.getHandlerFunction()} | ${t.getTriggerSource()} | ${t.getEventType()}`);
  });
}

function hapusSemuaTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach((t) => ScriptApp.deleteTrigger(t));
  console.log(`${triggers.length} trigger dihapus.`);
}

function hapusTriggerBernama(handlerName) {
  let count = 0;
  ScriptApp.getProjectTriggers().forEach((t) => {
    if (t.getHandlerFunction() === handlerName) {
      ScriptApp.deleteTrigger(t);
      count++;
    }
  });
  console.log(`${count} trigger '${handlerName}' dihapus.`);
}


/* =========================================================================
 * BAGIAN 2 — Time-driven triggers (installer)
 * ========================================================================= */

/** Pasang trigger harian jam 7 pagi untuk kirim reminder H-3 ke peserta. */
function pasangReminderPelatihan() {
  hapusTriggerBernama("kirimReminderPelatihan");
  ScriptApp.newTrigger("kirimReminderPelatihan")
    .timeBased()
    .atHour(7)
    .everyDays(1)
    .create();
  console.log("Trigger reminder pelatihan harian jam 7 dipasang.");
}

/** Pasang trigger setiap Senin jam 8 untuk rekap mingguan peserta Lulus. */
function pasangRekapMingguan() {
  hapusTriggerBernama("rekapMingguanLulus");
  ScriptApp.newTrigger("rekapMingguanLulus")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(8)
    .create();
  console.log("Trigger rekap mingguan Senin jam 8 dipasang.");
}


/* =========================================================================
 * BAGIAN 3 — Mini-project: Reminder Pelatihan H-3
 *
 * Function ini dipanggil oleh trigger yang dipasang di pasangReminderPelatihan().
 * Untuk test: jalankan manual via Run di editor.
 *
 * Logic:
 *   1. Hitung tanggal target = hari ini + 3 hari.
 *   2. Cari program di tab "Program" yang Tanggal Mulai = target.
 *   3. Untuk peserta yang terdaftar di program itu DAN Notif Email kosong:
 *      → kirim email reminder.
 *      → isi kolom Notif Email dengan timestamp (idempotent marker).
 * ========================================================================= */

function kirimReminderPelatihan() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shPeserta = ss.getSheetByName("Peserta");
  const shProgram = ss.getSheetByName("Program");

  if (!shPeserta || !shProgram) {
    throw new Error("Tab 'Peserta' atau 'Program' tidak ditemukan.");
  }

  const tz = Session.getScriptTimeZone();

  // 1) Tanggal target = H+3
  const target = new Date();
  target.setDate(target.getDate() + 3);
  const targetStr = Utilities.formatDate(target, tz, "yyyy-MM-dd");
  console.log(`Cari program yang Tanggal Mulai = ${targetStr}`);

  // 2) Cari program yang match — bikin map kodeProgram → info
  const dataProg = shProgram.getDataRange().getValues();
  const hProg = dataProg[0];
  const cKode      = hProg.indexOf("Kode");
  const cNamaProg  = hProg.indexOf("Nama Program");
  const cTglMulai  = hProg.indexOf("Tanggal Mulai");
  const cLokasi    = hProg.indexOf("Lokasi");

  const programMatch = {};   // kode → { nama, lokasi, tglStr }
  for (let i = 1; i < dataProg.length; i++) {
    const tgl = dataProg[i][cTglMulai];
    if (!(tgl instanceof Date)) continue;
    if (Utilities.formatDate(tgl, tz, "yyyy-MM-dd") === targetStr) {
      programMatch[dataProg[i][cKode]] = {
        nama:   dataProg[i][cNamaProg],
        lokasi: dataProg[i][cLokasi],
        tglStr: targetStr
      };
    }
  }

  if (Object.keys(programMatch).length === 0) {
    console.log("Tidak ada program yang dimulai H+3. Skip.");
    return;
  }
  console.log(`${Object.keys(programMatch).length} program match: ${Object.keys(programMatch).join(", ")}`);

  // 3) Loop peserta — kirim email kalau program match & Notif Email kosong
  const range = shPeserta.getDataRange();
  const data  = range.getValues();
  const h = data[0];
  const cNama   = h.indexOf("Nama");
  const cEmail  = h.indexOf("Email");
  const cProgKd = h.indexOf("Program");
  const cNotif  = h.indexOf("Notif Email");

  const stamp = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd HH:mm");
  let terkirim = 0;

  for (let i = 1; i < data.length; i++) {
    const kode = data[i][cProgKd];
    if (!programMatch[kode]) continue;        // bukan program H+3
    if (data[i][cNotif]) continue;             // sudah dapat reminder (idempotent)

    const prog = programMatch[kode];
    MailApp.sendEmail({
      to: data[i][cEmail],
      subject: `Reminder: Pelatihan ${prog.nama} dimulai 3 hari lagi`,
      body: [
        `Halo ${data[i][cNama]},`,
        ``,
        `Mengingatkan bahwa pelatihan Anda akan dimulai dalam 3 hari:`,
        ``,
        `Program : ${prog.nama}`,
        `Tanggal : ${prog.tglStr}`,
        `Lokasi  : ${prog.lokasi}`,
        ``,
        `Sampai jumpa.`,
        ``,
        `Salam,`,
        `Penyelenggara Pelatihan`
      ].join("\n")
    });

    data[i][cNotif] = stamp;
    terkirim++;
  }

  // 4) Tulis ulang kolom Notif Email — 1 round-trip
  const kolomNotif = data.map((r) => [r[cNotif]]);
  shPeserta.getRange(1, cNotif + 1, kolomNotif.length, 1).setValues(kolomNotif);

  console.log(`${terkirim} email reminder dikirim.`);
}


/* =========================================================================
 * BAGIAN 4 — Rekap Mingguan Peserta Lulus
 *
 * Dipanggil tiap Senin jam 8 oleh trigger dari pasangRekapMingguan().
 * Hitung jumlah peserta lulus minggu lalu → email ke manager.
 * ========================================================================= */

function rekapMingguanLulus() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Peserta");
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  const h = data[0];
  const cStatus = h.indexOf("Status");
  const cProg   = h.indexOf("Program");

  // Hitung per program
  const countByProgram = {};
  let totalLulus = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][cStatus] === "Lulus") {
      const kode = data[i][cProg];
      countByProgram[kode] = (countByProgram[kode] || 0) + 1;
      totalLulus++;
    }
  }

  const ringkasan = Object.entries(countByProgram)
    .map(([kode, n]) => `  ${kode}: ${n} peserta`)
    .join("\n");

  const me = Session.getActiveUser().getEmail();
  MailApp.sendEmail({
    to: me,
    subject: `Rekap Mingguan — ${totalLulus} peserta Lulus`,
    body: `Rekap status Lulus per program:\n\n${ringkasan}\n\nTotal: ${totalLulus} peserta.`
  });

  console.log(`Rekap mingguan dikirim — ${totalLulus} peserta Lulus.`);
}


/* =========================================================================
 * BAGIAN 5 — onEdit installable (auto-email saat Lulus)
 *
 * Trigger ini perlu installable karena pakai MailApp.
 * Simple onEdit tidak bisa.
 * ========================================================================= */

function pasangTriggerEditPeserta() {
  hapusTriggerBernama("onEditPeserta");
  ScriptApp.newTrigger("onEditPeserta")
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();
  console.log("Trigger onEdit Peserta dipasang.");
}

/**
 * Saat kolom Status di tab Peserta diset:
 *   - "Lulus"           → warnai baris hijau + kirim email konfirmasi
 *   - "Tidak Lulus"     → warnai baris merah muda
 *   - "Sedang Berjalan" → reset format
 *
 * Idempotent: kalau Notif Email sudah terisi → skip kirim email.
 */
function onEditPeserta(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  if (sheet.getName() !== "Peserta") return;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const colStatus = headers.indexOf("Status") + 1;
  if (e.range.getColumn() !== colStatus) return;

  const row = e.range.getRow();
  const lastCol = sheet.getLastColumn();

  // Visual highlight
  if (e.value === "Lulus") {
    sheet.getRange(row, 1, 1, lastCol).setBackground("#dcfce7");
  } else if (e.value === "Tidak Lulus") {
    sheet.getRange(row, 1, 1, lastCol).setBackground("#fee2e2");
  } else if (e.value === "Sedang Berjalan") {
    sheet.getRange(row, 1, 1, lastCol).setBackground(null);
  }

  // Kirim email kalau Lulus dan belum pernah dikirim
  if (e.value !== "Lulus") return;

  const cNotif = headers.indexOf("Notif Email") + 1;
  const sudahNotif = sheet.getRange(row, cNotif).getValue();
  if (sudahNotif) {
    console.log(`Skip kirim email — sudah ada notif: ${sudahNotif}`);
    return;
  }

  const nama  = sheet.getRange(row, headers.indexOf("Nama")  + 1).getValue();
  const email = sheet.getRange(row, headers.indexOf("Email") + 1).getValue();
  const nilai = sheet.getRange(row, headers.indexOf("Nilai") + 1).getValue();

  MailApp.sendEmail({
    to: email,
    subject: `Selamat ${nama} — Anda LULUS pelatihan`,
    body: [
      `Halo ${nama},`,
      ``,
      `Selamat! Anda telah dinyatakan LULUS dengan nilai akhir: ${nilai}.`,
      `Sertifikat resmi akan menyusul dalam beberapa hari kerja.`,
      ``,
      `Salam,`,
      `Penyelenggara Pelatihan`
    ].join("\n")
  });

  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
  sheet.getRange(row, cNotif).setValue(stamp);

  console.log(`Email Lulus dikirim ke ${email}.`);
}


/* =========================================================================
 * BAGIAN 6 — onFormSubmit (pendaftaran peserta)
 *
 * Pasang setelah bikin Google Form pendaftaran (Nama, Email, Instansi, Program).
 * Ganti FORM_ID di pasangTriggerForm() sebelum jalankan.
 * ========================================================================= */

function pasangTriggerFormPendaftaran() {
  const FORM_ID = "GANTI_DENGAN_FORM_ID";
  if (FORM_ID === "GANTI_DENGAN_FORM_ID") {
    console.log("Set FORM_ID dulu di pasangTriggerFormPendaftaran().");
    return;
  }

  hapusTriggerBernama("prosesPendaftaranPeserta");
  const form = FormApp.openById(FORM_ID);
  ScriptApp.newTrigger("prosesPendaftaranPeserta")
    .forForm(form)
    .onFormSubmit()
    .create();
  console.log("Trigger form pendaftaran dipasang.");
}

function prosesPendaftaranPeserta(e) {
  const respon = e.response;
  const items = respon.getItemResponses();

  // Konversi jawaban → object
  const data = {};
  items.forEach((item) => {
    data[item.getItem().getTitle()] = item.getResponse();
  });

  const sheet = SpreadsheetApp.getActive().getSheetByName("Peserta");

  // Cek email duplikat
  const allData = sheet.getDataRange().getValues();
  const cEmail  = allData[0].indexOf("Email");
  const emailSudahAda = allData.slice(1).some((r) => r[cEmail] === data.Email);

  if (emailSudahAda) {
    MailApp.sendEmail({
      to: Session.getActiveUser().getEmail(),
      subject: `[Warning] Pendaftaran duplikat: ${data.Email}`,
      body: `Email ${data.Email} (${data.Nama}) sudah terdaftar — pendaftaran via form di-skip.`
    });
    console.log(`Skip — email ${data.Email} sudah terdaftar.`);
    return;
  }

  // Append peserta baru
  const idBaru = `PST-${String(sheet.getLastRow()).padStart(3, "0")}`;
  sheet.appendRow([
    idBaru,
    new Date(),
    data.Nama,
    data.Email,
    data.Instansi,
    data.Program
  ]);

  // Email konfirmasi ke peserta
  MailApp.sendEmail({
    to: data.Email,
    subject: `Pendaftaran pelatihan ${data.Program} diterima`,
    htmlBody: `<p>Halo <b>${data.Nama}</b>,</p>
               <p>Pendaftaran Anda untuk program <b>${data.Program}</b> telah kami terima.</p>
               <p>ID Peserta: <b>${idBaru}</b></p>`
  });

  // Notif ke admin
  MailApp.sendEmail({
    to: Session.getActiveUser().getEmail(),
    subject: `Pendaftaran baru: ${idBaru} — ${data.Nama}`,
    body: JSON.stringify({ idBaru, ...data }, null, 2)
  });

  console.log(`Peserta ${idBaru} (${data.Nama}) didaftarkan via form.`);
}


/* =========================================================================
 * BAGIAN 7 — PropertiesService (state antar eksekusi)
 * ========================================================================= */

function syncDataPeserta() {
  const props = PropertiesService.getScriptProperties();
  const lastRun = props.getProperty("lastSyncTime");
  const now = new Date();

  console.log(`Last sync peserta: ${lastRun || "(belum pernah)"}`);
  console.log(`Sync sekarang: ${now.toISOString()}`);

  // ... logic sync data peserta dari sistem lain sejak lastRun
  //     Hanya proses baris yang Tanggal Daftar > lastRun.

  props.setProperty("lastSyncTime", now.toISOString());
}

function resetState() {
  PropertiesService.getScriptProperties().deleteAllProperties();
  console.log("State direset.");
}


/* =========================================================================
 * BAGIAN 8 — LockService (hindari race condition)
 * ========================================================================= */

function syncPesertaAman() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    console.log("Sync lain sedang berjalan. Skip.");
    return;
  }

  try {
    console.log("Mulai sync peserta...");
    Utilities.sleep(2000);   // simulasi pekerjaan
    console.log("Sync selesai.");
  } finally {
    lock.releaseLock();
  }
}
