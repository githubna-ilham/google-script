/**
 * Modul 1 — Introduction to Google Apps Script
 *
 * Cara pakai:
 *   1. Buat project baru di script.google.com.
 *   2. Beri nama "Latihan Modul 1".
 *   3. Copy seluruh isi file ini ke Code.gs.
 *   4. Save (Ctrl/Cmd + S).
 *   5. Pilih function di dropdown "Select function" → klik Run.
 *   6. Setujui autorisasi saat diminta.
 *   7. Cek Execution log.
 */


/* =========================================================================
 * 1. Function pertama — gunakan Session untuk ambil info user
 * ========================================================================= */

function contoh01_sapaUser() {
  const email = Session.getActiveUser().getEmail();
  const pesan = `Halo, ${email}! Selamat datang di Apps Script.`;
  console.log(pesan);
}


/* =========================================================================
 * 2. Kirim email konfirmasi ke diri sendiri
 * ========================================================================= */

function contoh02_kirimKonfirmasi() {
  const email = Session.getActiveUser().getEmail();

  MailApp.sendEmail({
    to: email,
    subject: "Halo dari Apps Script!",
    body: "Ini email pertama yang dikirim oleh script Anda. 🎉"
  });

  console.log(`Email terkirim ke ${email}`);
}


/* =========================================================================
 * 3. console — log, info, warn, error
 * ========================================================================= */

function contoh03_consoleLevels() {
  const data = {
    nama: "Sari",
    divisi: "Finance",
    skill: ["Excel", "Apps Script", "SQL"]
  };

  // Empat level severity
  console.log("Halo, ini pesan biasa.");
  console.info("Data berhasil dimuat:", data);
  console.warn("Hati-hati: skill list akan dipotong jika > 5 item.");
  console.error("Contoh error (cuma demo, tidak benar-benar error).");

  // Multi-argumen — object dicetak dengan struktur penuh
  console.log("User detail:", data, "Timestamp:", new Date());
}


/* =========================================================================
 * 4. Memakai Utilities service — sleep & format tanggal
 * ========================================================================= */

function contoh04_utilities() {
  console.log("Mulai...");

  // Tunggu 1 detik
  Utilities.sleep(1000);

  // Format tanggal mengikuti timezone project
  const sekarang = new Date();
  const formatted = Utilities.formatDate(
    sekarang,
    Session.getScriptTimeZone(),
    "yyyy-MM-dd HH:mm:ss"
  );

  console.log(`Selesai pada ${formatted}`);
}


/* =========================================================================
 * 5. Info project & user yang sedang aktif
 * ========================================================================= */

function contoh05_infoProject() {
  const userEmail = Session.getActiveUser().getEmail();
  const timezone  = Session.getScriptTimeZone();
  const locale    = Session.getActiveUserLocale();

  console.log("=== Info Project ===");
  console.log("User aktif : " + userEmail);
  console.log("Timezone   : " + timezone);
  console.log("Locale     : " + locale);
}


/* =========================================================================
 * 6. Modularitas — function bisa saling memanggil
 * ========================================================================= */

function contoh06_komposisi() {
  const subject = buildSubject("Laporan Mingguan");
  const body    = buildBody("Sari", 5);
  console.log("Subject: " + subject);
  console.log("Body:");
  console.log(body);
}

function buildSubject(judul) {
  const tanggal = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "dd MMM yyyy"
  );
  return `[${tanggal}] ${judul}`;
}

function buildBody(nama, jumlahItem) {
  return [
    `Halo ${nama},`,
    "",
    `Berikut ringkasan laporan minggu ini:`,
    `- Jumlah item diproses: ${jumlahItem}`,
    "",
    "Salam,",
    "Tim Otomasi"
  ].join("\n");
}


/* =========================================================================
 * 7. Demo error handling — try/catch untuk operasi yang berisiko
 * ========================================================================= */

function contoh07_tryCatch() {
  try {
    // Sengaja error: parsing JSON tidak valid
    const data = JSON.parse("ini bukan JSON");
    console.log(data);
  } catch (err) {
    console.log("Tertangkap error: " + err.message);
    // Eksekusi tetap lanjut
  }

  console.log("Script tetap berjalan setelah error.");
}


/* =========================================================================
 * Helper untuk jalankan semua sekaligus (sanity check)
 * Hindari memanggil contoh02_kirimKonfirmasi di sini supaya tidak spam inbox.
 * ========================================================================= */

function jalankanSemua() {
  const semua = [
    contoh01_sapaUser,
    contoh03_consoleLevels,
    contoh04_utilities,
    contoh05_infoProject,
    contoh06_komposisi,
    contoh07_tryCatch
  ];

  semua.forEach((fn, i) => {
    console.log(`\n========== ${i + 1}. ${fn.name} ==========`);
    fn();
  });
}
