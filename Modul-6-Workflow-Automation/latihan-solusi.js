/**
 * Modul 6 — Solusi Latihan
 * Set SHEET_ID kalau standalone.
 */

const SHEET_ID = "GANTI_DENGAN_ID_SHEET_LATIHAN_M6";

function _ss() {
  if (SHEET_ID && SHEET_ID !== "GANTI_DENGAN_ID_SHEET_LATIHAN_M6") {
    return SpreadsheetApp.openById(SHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}


/* ----- Soal 1: onOpen menu ----- */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("⚡ Workflow")
    .addItem("Pasang reminder tugas",  "pasangReminderTugas")
    .addItem("Pasang reminder Senin",  "pasangTriggerSenin")
    .addItem("Pasang trigger onEdit",  "pasangTriggerEdit")
    .addSeparator()
    .addItem("List trigger aktif",     "listTrigger")
    .addItem("Hapus semua trigger",    "hapusSemuaTrigger")
    .addToUi();
}

function listTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  console.log(`Total: ${triggers.length}`);
  triggers.forEach((t) => {
    console.log(`  ${t.getHandlerFunction()} | ${t.getEventType()}`);
  });
}

function hapusSemuaTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach((t) => ScriptApp.deleteTrigger(t));
  SpreadsheetApp.getUi().alert(`${triggers.length} trigger dihapus.`);
}

function _hapusTriggerBernama(name) {
  ScriptApp.getProjectTriggers().forEach((t) => {
    if (t.getHandlerFunction() === name) ScriptApp.deleteTrigger(t);
  });
}

function pasangTriggerSenin() {
  _hapusTriggerBernama("kirimLaporanSenin");
  ScriptApp.newTrigger("kirimLaporanSenin")
    .timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(8).create();
  console.log("Trigger Senin jam 8 dipasang.");
}

function kirimLaporanSenin() {
  console.log("Laporan Senin dijalankan: " + new Date().toISOString());
}


/* ----- Soal 2: Reminder Tugas Besok (idempotent) ----- */
function pasangReminderTugas() {
  _hapusTriggerBernama("reminderTugasBesok");
  ScriptApp.newTrigger("reminderTugasBesok")
    .timeBased().atHour(18).everyDays(1).create();
  console.log("Trigger reminder tugas dipasang (18:00).");
}

function reminderTugasBesok() {
  const props = PropertiesService.getScriptProperties();
  const todayKey = "lastReminderTugas:" + Utilities.formatDate(
    new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"
  );

  if (props.getProperty(todayKey)) {
    console.log("Sudah dikirim hari ini. Skip.");
    return;
  }

  const sheet = _ss().getSheetByName("Tugas");
  const data = sheet.getDataRange().getValues();
  const h = data[0];
  const cNama = h.indexOf("Nama");
  const cDl   = h.indexOf("Deadline");
  const cStat = h.indexOf("Status");

  const besok = new Date();
  besok.setDate(besok.getDate() + 1);
  besok.setHours(0, 0, 0, 0);
  const lusa = new Date(besok.getTime() + 24 * 60 * 60 * 1000);

  const tugas = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][cStat] === "Selesai") continue;
    const dl = data[i][cDl] instanceof Date ? data[i][cDl] : new Date(data[i][cDl]);
    if (dl >= besok && dl < lusa) {
      tugas.push(data[i][cNama]);
    }
  }

  if (tugas.length === 0) {
    console.log("Tidak ada tugas besok. Skip.");
    return;
  }

  const html = `
    <p>Halo,</p>
    <p>Berikut tugas Anda untuk besok:</p>
    <ul>
      ${tugas.map((t) => `<li>${t}</li>`).join("")}
    </ul>
  `;

  MailApp.sendEmail({
    to: Session.getActiveUser().getEmail(),
    subject: `Reminder: ${tugas.length} tugas besok`,
    body: tugas.join("\n"),
    htmlBody: html
  });

  props.setProperty(todayKey, "1");
  console.log(`${tugas.length} tugas dikirim sebagai reminder.`);
}


/* ----- Soal 3: onEdit Auto-Format ----- */
function pasangTriggerEdit() {
  _hapusTriggerBernama("onEditAutoFormat");
  ScriptApp.newTrigger("onEditAutoFormat")
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit().create();
  console.log("Trigger onEdit dipasang.");
}

function onEditAutoFormat(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  if (sheet.getName() !== "Tugas") return;
  if (e.range.getColumn() !== 4) return;   // kolom Status

  const baris = e.range.getRow();
  const last = sheet.getLastColumn();
  const rangeBaris = sheet.getRange(baris, 1, 1, last);

  const styleMap = {
    "Selesai":  { bg: "#dcfce7", line: "line-through" },
    "Cancel":   { bg: "#fee2e2", line: "none" },
    "Diproses": { bg: "#fef3c7", line: "none" }
  };

  const s = styleMap[e.value];
  if (s) {
    rangeBaris.setBackground(s.bg).setFontLine(s.line);
  } else {
    rangeBaris.setBackground(null).setFontLine("none");
  }
}


/* ----- Soal 4: Form Submit ----- */
function pasangTriggerForm() {
  const FORM_ID = "GANTI_DENGAN_FORM_ID";
  if (FORM_ID === "GANTI_DENGAN_FORM_ID") {
    console.log("Set FORM_ID dulu.");
    return;
  }
  _hapusTriggerBernama("prosesPertanyaan");
  ScriptApp.newTrigger("prosesPertanyaan")
    .forForm(FormApp.openById(FORM_ID))
    .onFormSubmit().create();
  console.log("Trigger form dipasang.");
}

function prosesPertanyaan(e) {
  const respon = e.response;
  const items = respon.getItemResponses();

  const data = {};
  items.forEach((item) => {
    data[item.getItem().getTitle()] = item.getResponse();
  });

  // Konfirmasi ke pengirim
  if (data.Email) {
    MailApp.sendEmail({
      to: data.Email,
      subject: "Pertanyaan Anda diterima",
      htmlBody: `
        <p>Halo <b>${data.Nama || "Pengirim"}</b>,</p>
        <p>Pertanyaan Anda telah kami terima:</p>
        <blockquote>${data.Pertanyaan || ""}</blockquote>
        <p>Akan kami balas dalam 1×24 jam.</p>
      `
    });
  }

  // Notif ke admin
  MailApp.sendEmail({
    to: Session.getActiveUser().getEmail(),
    subject: `[Pertanyaan baru] ${data.Nama || ""}`,
    body: JSON.stringify(data, null, 2)
  });

  console.log("Form submission diproses.");
}


/* ----- Soal 5: LockService ----- */
function pasangSyncBerat() {
  _hapusTriggerBernama("syncBeratAman");
  ScriptApp.newTrigger("syncBeratAman")
    .timeBased().everyMinutes(1).create();
  console.log("Trigger sync (per 1 menit) dipasang.");
}

function syncBeratAman() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    console.log(`[${new Date().toISOString()}] SKIP — sync lain berjalan.`);
    return;
  }

  try {
    console.log(`[${new Date().toISOString()}] Mulai sync...`);
    Utilities.sleep(20000);   // 20 detik (lebih lama dari interval trigger)
    console.log(`[${new Date().toISOString()}] Sync selesai.`);
  } finally {
    lock.releaseLock();
  }
}


/* ----- Soal 6: Audit Log ke Sheet ----- */
function auditExec(handlerName, status, message) {
  const ss = _ss();
  let sheet = ss.getSheetByName("Audit-Trigger");
  if (!sheet) {
    sheet = ss.insertSheet("Audit-Trigger");
    sheet.appendRow(["Timestamp", "Handler", "Status", "Message"]);
  }
  sheet.appendRow([new Date(), handlerName, status, String(message || "")]);
}

function reminderTugasBesokAudit() {
  try {
    reminderTugasBesok();
    auditExec("reminderTugasBesok", "OK", "selesai");
  } catch (err) {
    auditExec("reminderTugasBesok", "ERROR", err.message);
    throw err;
  }
}


/* ----- Soal 7: Reminder Kontrak Berlapis ----- */
function pasangReminderKontrakBerlapis() {
  _hapusTriggerBernama("reminderKontrakBerlapis");
  ScriptApp.newTrigger("reminderKontrakBerlapis")
    .timeBased().atHour(7).everyDays(1).create();
}

function reminderKontrakBerlapis() {
  const sheet = _ss().getSheetByName("Kontrak");
  const range = sheet.getDataRange();
  const data  = range.getValues();
  const h = data[0];

  const cNama  = h.indexOf("Nama Klien");
  const cEmail = h.indexOf("Email");
  const cTgl   = h.indexOf("Tanggal Berakhir");
  const cH30   = h.indexOf("Reminded H-30");
  const cH7    = h.indexOf("Reminded H-7");
  const cH1    = h.indexOf("Reminded H-1");

  const MANAGER = Session.getActiveUser().getEmail();
  const sekarang = new Date();
  sekarang.setHours(0, 0, 0, 0);

  const dayMs = 24 * 60 * 60 * 1000;

  let count = 0;
  for (let i = 1; i < data.length; i++) {
    const tgl = data[i][cTgl] instanceof Date ? new Date(data[i][cTgl]) : new Date(data[i][cTgl]);
    tgl.setHours(0, 0, 0, 0);
    const selisih = Math.round((tgl - sekarang) / dayMs);

    const nama = data[i][cNama];
    const email = data[i][cEmail];
    const tglStr = tgl.toLocaleDateString("id-ID");

    if (selisih > 0 && selisih <= 1 && !data[i][cH1]) {
      MailApp.sendEmail({
        to: email,
        cc: MANAGER,
        subject: `[H-1] Kontrak ${nama} berakhir besok`,
        body: `Kontrak Anda berakhir pada ${tglStr}. Segera hubungi tim kami.`
      });
      data[i][cH1] = "✓";
      count++;
    } else if (selisih > 0 && selisih <= 7 && !data[i][cH7]) {
      MailApp.sendEmail({
        to: email,
        subject: `[H-7] Kontrak ${nama} berakhir ${tglStr}`,
        body: `Reminder kontrak Anda berakhir dalam minggu ini.`
      });
      data[i][cH7] = "✓";
      count++;
    } else if (selisih > 0 && selisih <= 30 && !data[i][cH30]) {
      MailApp.sendEmail({
        to: email,
        subject: `[H-30] Kontrak ${nama} berakhir ${tglStr}`,
        body: `Reminder kontrak Anda akan berakhir dalam 30 hari.`
      });
      data[i][cH30] = "✓";
      count++;
    }
  }

  range.setValues(data);
  console.log(`${count} reminder dikirim.`);
}
