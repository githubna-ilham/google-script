/**
 * Modul 1 — Solusi Latihan
 * Ini SATU dari banyak solusi valid. Kalau output Anda sama, tetap betul.
 */


/* ----- Soal 1: Salam Berdasarkan Waktu ----- */
function salamSesuaiJam() {
  const jam = new Date().getHours();
  let salam;

  if (jam >= 4 && jam < 11)       salam = "Selamat pagi";
  else if (jam >= 11 && jam < 15) salam = "Selamat siang";
  else if (jam >= 15 && jam < 18) salam = "Selamat sore";
  else                             salam = "Selamat malam";

  const email = Session.getActiveUser().getEmail();
  console.log(`${salam}, ${email}`);
}


/* ----- Soal 2: Email Ringkasan ----- */
function kirimRingkasanHari() {
  const email = Session.getActiveUser().getEmail();
  const tanggal = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "dd MMM yyyy"
  );

  const subject = `Ringkasan: ${tanggal}`;
  const body = [
    `Halo,`,
    "",
    `Hari ini adalah hari yang produktif. Lanjutkan!`,
    "",
    `Salam,`,
    `Bot Apps Script`
  ].join("\n");

  MailApp.sendEmail({ to: email, subject, body });
  console.log(`Email ringkasan terkirim ke ${email}`);
}


/* ----- Soal 3: Format Rupiah ----- */
function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

function ujiFormatRupiah() {
  [1000, 25000, 150000, 2500000, 1500000000].forEach((n) => {
    console.log(`${n} → ${formatRupiah(n)}`);
  });
}


/* ----- Soal 4: Komposisi Function ----- */
function getJamSapaan() {
  const jam = new Date().getHours();
  if (jam >= 4 && jam < 11)  return "pagi";
  if (jam >= 11 && jam < 15) return "siang";
  if (jam >= 15 && jam < 18) return "sore";
  return "malam";
}

function getNamaUser() {
  const email = Session.getActiveUser().getEmail();
  return email.split("@")[0];
}

function bangunSapaan() {
  return `Selamat ${getJamSapaan()}, ${getNamaUser()}!`;
}

function tampilSapaan() {
  console.log(bangunSapaan());
}


/* ----- Soal 5: Try/Catch ----- */
function bagi(a, b) {
  if (b === 0) {
    throw new Error("Tidak bisa membagi dengan nol");
  }
  return a / b;
}

function ujiBagi() {
  const kasus = [[10, 2], [10, 0], [9, 3], [5, 0]];

  kasus.forEach(([a, b]) => {
    try {
      const hasil = bagi(a, b);
      console.log(`${a} / ${b} = ${hasil}`);
    } catch (err) {
      console.log(`${a} / ${b} → ERROR: ${err.message}`);
    }
  });
}


/* ----- Soal 6: Eksplorasi Service (jawaban referensi) ----- */
function tebakService() {
  // 1. Membuat folder di Drive
  // → DriveApp.createFolder("Folder Baru")

  // 2. Mengirim email
  // → MailApp.sendEmail(...) atau GmailApp.sendEmail(...)

  // 3. Baca cell A1 di Sheet
  // → SpreadsheetApp.getActiveSpreadsheet().getRange("A1").getValue()

  // 4. Buat event Calendar
  // → CalendarApp.createEvent(...) atau CalendarApp.getDefaultCalendar().createEvent(...)

  // 5. Panggil API eksternal
  // → UrlFetchApp.fetch(url)

  console.log("Lihat komentar di kode untuk jawaban.");
}


/* ----- Soal 7: Pencatat Aktivitas ----- */
function catatAktivitas(deskripsi) {
  const waktu = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd HH:mm:ss"
  );
  const user = Session.getActiveUser().getEmail();

  const entry = { waktu, user, deskripsi };

  // Log
  console.log(JSON.stringify(entry, null, 2));

  // Email
  MailApp.sendEmail({
    to: user,
    subject: `[Log Aktivitas] ${deskripsi}`,
    body: [
      `Aktivitas tercatat:`,
      ``,
      `Waktu     : ${entry.waktu}`,
      `User      : ${entry.user}`,
      `Deskripsi : ${entry.deskripsi}`
    ].join("\n")
  });
}

function ujiCatatAktivitas() {
  catatAktivitas("Selesai mengerjakan latihan Modul 1");
}


/* ----- Jalankan semua (kecuali yang kirim email — supaya tidak spam) ----- */
function jalankanSemuaSolusi() {
  const semua = [
    salamSesuaiJam,
    ujiFormatRupiah,
    tampilSapaan,
    ujiBagi,
    tebakService
  ];
  semua.forEach((fn, i) => {
    console.log(`\n========== Soal ${i + 1} ==========`);
    fn();
  });
}
