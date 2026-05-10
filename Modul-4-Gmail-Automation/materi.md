# Modul 4 — Gmail Automation

Setelah Modul 1 mengenalkan `MailApp.sendEmail` sebagai contoh tercepat, Modul 4 menggali fitur **Gmail otomasi** lebih dalam: kirim massal, attachment, template HTML, dan baca email masuk untuk diproses lebih lanjut.

---

## 1. MailApp vs GmailApp — Pilih Mana?

Apps Script punya **dua service email** dengan kemampuan berbeda.

```mermaid
flowchart LR
    subgraph MA["MailApp"]
        M1[Kirim email saja]
        M2[Tidak bisa baca inbox]
        M3[Tidak bisa kelola label/draft]
        M4[Quota: 100/hari Gmail biasa]
    end

    subgraph GA["GmailApp"]
        G1[Kirim email]
        G2[Baca inbox / Sent / Trash / Label]
        G3[Kelola label, draft, thread]
        G4[Quota sama: 100/hari]
    end

    classDef ma fill:#dbeafe,stroke:#3b82f6
    classDef ga fill:#dcfce7,stroke:#16a34a
    class M1,M2,M3,M4 ma
    class G1,G2,G3,G4 ga
```

**Aturan praktis**:
- Cuma kirim email (newsletter, notifikasi, alert) → `MailApp` cukup, lebih ringkas.
- Butuh baca/proses email masuk, kelola label/draft → `GmailApp`.

> **Quota**: Gmail biasa 100 recipient/hari. Workspace berbayar 1.500/hari. Cek sisa quota: `MailApp.getRemainingDailyQuota()`.

---

## 2. Mengirim Email

### 2.1 Bentuk paling sederhana

```javascript
MailApp.sendEmail("alice@example.com", "Halo", "Ini body email.");
```

### 2.2 Bentuk lengkap dengan opsi

```javascript
MailApp.sendEmail({
  to:      "alice@example.com",
  cc:      "bob@example.com",
  bcc:     "audit@example.com",
  replyTo: "noreply@example.com",
  subject: "Laporan Mingguan",
  body:    "Versi plain text untuk client yang tidak support HTML.",
  htmlBody: "<h2>Laporan Mingguan</h2><p>Selamat siang,</p>",
  name:     "Bot Otomasi",      // nama pengirim yang tampil
  attachments: [pdfBlob]        // array Blob (lihat §4)
});
```

### 2.3 Email HTML

Tag HTML dasar didukung Gmail: `<h1>-<h6>`, `<p>`, `<a>`, `<table>`, `<img>`, `<strong>`, `<ul>`, dll. CSS inline didukung; CSS eksternal/`<style>` dukungannya terbatas.

```javascript
const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px;">
    <h2 style="color: #1e40af;">Konfirmasi Pesanan ${nomor}</h2>
    <p>Halo <b>${nama}</b>,</p>
    <p>Pesanan Anda telah kami terima.</p>
    <table style="border-collapse: collapse;">
      <tr><td style="padding: 4px 12px;">Total</td><td><b>Rp ${total}</b></td></tr>
    </table>
  </div>
`;
MailApp.sendEmail({ to, subject, body: "lihat versi HTML", htmlBody: html });
```

> **Best practice**: selalu sertakan `body` plain text + `htmlBody`. Beberapa client hanya tampilkan plain.

---

## 3. Pola Template — Gmail HTML dari File

Tulis HTML email panjang langsung di string susah dibaca. Pola yang **lebih maintainable**: simpan template sebagai file `.html` di project Apps Script, isi placeholder dari kode.

### Langkah

**1) Tambah file HTML di project**

Klik **+** di sidebar editor → **HTML** → beri nama `template-konfirmasi`. Isi:

```html
<!-- File: template-konfirmasi.html -->
<div style="font-family: Arial, sans-serif; max-width: 600px;">
  <h2>Konfirmasi Pesanan <?= nomor ?></h2>
  <p>Halo <b><?= nama ?></b>,</p>
  <p>Pesanan Anda telah kami terima dengan rincian berikut:</p>
  <ul>
    <li>Produk : <?= produk ?></li>
    <li>Qty    : <?= qty ?></li>
    <li>Total  : Rp <?= total ?></li>
  </ul>
  <p>Terima kasih.</p>
</div>
```

**2) Render dari Apps Script**

```javascript
function kirimKonfirmasi(data) {
  const tmpl = HtmlService.createTemplateFromFile("template-konfirmasi");
  Object.keys(data).forEach((key) => {
    tmpl[key] = data[key];                   // injek variable
  });
  const html = tmpl.evaluate().getContent();

  MailApp.sendEmail({
    to: data.email,
    subject: `Konfirmasi Pesanan ${data.nomor}`,
    body: `Pesanan ${data.nomor} dikonfirmasi.`,
    htmlBody: html
  });
}

kirimKonfirmasi({
  email: "alice@example.com",
  nama: "Sari",
  nomor: "TRX-001",
  produk: "Mouse",
  qty: 3,
  total: "450.000"
});
```

**Sintaks `HtmlService` di template**:
- `<?= var ?>` — print value (auto-escape HTML).
- `<?!= var ?>` — print mentah (raw HTML, hati-hati XSS).
- `<? if (kondisi) { ?> ... <? } ?>` — kontrol flow.
- `<? list.forEach((item) => { ?> ... <? }); ?>` — loop.

---

## 4. Attachment — Mengirim File

`attachments` menerima array **Blob**. Blob bisa berasal dari Drive, Doc/Sheet yang di-export, atau dibuat manual.

### 4.1 Attachment dari Drive

```javascript
const file = DriveApp.getFileById("1AbcXyz...");
const blob = file.getBlob();

MailApp.sendEmail({
  to: "alice@example.com",
  subject: "Lampiran",
  body: "Terlampir dokumen.",
  attachments: [blob]
});
```

### 4.2 Export Doc → PDF lalu kirim

```javascript
const doc = DocumentApp.openById("1AbcXyz...");
const pdfBlob = DriveApp.getFileById(doc.getId()).getAs("application/pdf");

MailApp.sendEmail({
  to: "alice@example.com",
  subject: "Laporan PDF",
  body: "Terlampir laporan.",
  attachments: [pdfBlob.setName("Laporan.pdf")]
});
```

### 4.3 Attachment buatan: CSV dari Sheet

```javascript
function csvDariSheet(sheet) {
  const data = sheet.getDataRange().getValues();
  const csv  = data.map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  return Utilities.newBlob(csv, "text/csv", `${sheet.getName()}.csv`);
}

const blob = csvDariSheet(SpreadsheetApp.openById("...").getActiveSheet());
MailApp.sendEmail({
  to: "ops@kantor.id",
  subject: "Export CSV",
  body: "Terlampir export hari ini.",
  attachments: [blob]
});
```

---

## 5. Membaca Email Masuk

### 5.1 Pencarian dengan query Gmail

```mermaid
flowchart LR
    Q["Query string<br/>'is:unread from:bos@kantor.id'"]:::q
    --> S["GmailApp.search(query)"]:::svc
    --> T["Threads<br/>(GmailThread[])"]:::t
    --> M["Messages<br/>(GmailMessage[][])"]:::m

    classDef q fill:#fef3c7,stroke:#f59e0b
    classDef svc fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
    classDef t fill:#dcfce7,stroke:#16a34a
    classDef m fill:#e0e7ff,stroke:#6366f1
```

```javascript
const threads = GmailApp.search("is:unread from:bos@kantor.id newer_than:7d", 0, 20);

threads.forEach((thread) => {
  const messages = thread.getMessages();
  messages.forEach((msg) => {
    console.log(`Dari: ${msg.getFrom()}`);
    console.log(`Subject: ${msg.getSubject()}`);
    console.log(`Body (snippet): ${msg.getPlainBody().substring(0, 100)}`);
  });
});
```

### 5.2 Operator query Gmail (sama seperti di UI Gmail)

| Operator | Contoh |
|---|---|
| `from:` / `to:` | `from:alice@example.com` |
| `subject:` | `subject:invoice` |
| `is:unread` / `is:starred` / `is:important` | `is:unread` |
| `has:attachment` | `has:attachment` |
| `label:` | `label:auto-process` |
| `after:` / `before:` | `after:2026/05/01` |
| `newer_than:` / `older_than:` | `newer_than:7d` |
| Boolean | `AND`, `OR`, `(...)`, `-` (NOT) |

### 5.3 Pola: Proses email lalu tandai sudah diproses

```javascript
function prosesEmailInvoice() {
  const label = GmailApp.getUserLabelByName("Processed") ||
                GmailApp.createLabel("Processed");

  const threads = GmailApp.search("subject:invoice -label:Processed", 0, 50);

  threads.forEach((thread) => {
    const msg = thread.getMessages()[0];

    // ... proses (extract data, simpan ke Sheet, dll)
    console.log(`Diproses: ${msg.getSubject()}`);

    thread.addLabel(label);   // marker — pencarian berikutnya skip thread ini
    thread.markRead();
  });
}
```

### 5.4 Mengambil attachment

```javascript
function ambilAttachmentDariEmail() {
  const threads = GmailApp.search("has:attachment subject:laporan", 0, 5);

  threads.forEach((thread) => {
    thread.getMessages().forEach((msg) => {
      msg.getAttachments().forEach((att) => {
        const folder = DriveApp.getFolderById("FOLDER_ID");
        folder.createFile(att);   // simpan ke Drive
        console.log(`Disimpan: ${att.getName()}`);
      });
    });
  });
}
```

---

## 6. Draft & Reply

```javascript
// Buat draft (tidak terkirim)
GmailApp.createDraft("alice@example.com", "Draft", "Isi draft.");

// Reply ke thread terakhir dari pengirim tertentu
const thread = GmailApp.search("from:alice@example.com", 0, 1)[0];
if (thread) {
  thread.reply("Terima kasih, akan kami proses.");
}
```

---

## 7. Mini-Project — Auto-Reply dari Sheet "Pengaduan"

Skenario: ada Sheet `Pengaduan` dengan kolom `Email`, `Judul`, `Status`. Setiap baris baru dengan `Status = Baru` harus dibalas otomatis dengan email konfirmasi (HTML, pakai template), lalu `Status` berubah jadi `Auto-Replied`.

```mermaid
flowchart TD
    A([Trigger time-driven<br/>tiap 15 menit]) --> B[Baca Sheet Pengaduan]
    B --> C{Loop tiap baris}
    C --> D{Status = 'Baru'?}
    D -->|Tidak| C
    D -->|Ya| E[Render template HTML<br/>dengan data baris]
    E --> F[MailApp.sendEmail]
    F --> G[Update Status<br/>jadi 'Auto-Replied']
    G --> C
    C -->|Selesai| H[setValues 1× round-trip]
    H --> I([Selesai])

    style F fill:#dbeafe,stroke:#3b82f6
    style E fill:#fef3c7,stroke:#f59e0b
```

Implementasi lengkap di `contoh.js` (`contoh10_autoReplyPengaduan`).

---

## 8. Best Practices

1. **Selalu set `htmlBody` + `body`** — jangan hanya HTML.
2. **Cek quota** sebelum batch besar: `MailApp.getRemainingDailyQuota()`.
3. **Trottle batch besar**: untuk 500 email, beri jeda dengan `Utilities.sleep(100)` antar 50 email — menghindari rate-limit transien.
4. **Marker idempotent**: pakai label Gmail (`addLabel`) atau kolom Sheet (`Notif Terkirim`) untuk hindari kirim duplikat.
5. **Test ke diri sendiri dulu** — pakai `Session.getActiveUser().getEmail()` saat development sebelum ke daftar penerima asli.
6. **Hindari spam-trigger** — subject pakai HURUF KAPITAL SEMUA, banyak `!!!`, atau kata "FREE/GRATIS" sering masuk spam.
7. **Reply-to terpisah dari From** — pakai `replyTo` kalau email dikirim dari bot tapi balasan ingin masuk ke alamat manusia.

---

## 9. Penutup

**Yang harus dikuasai sebelum lanjut**:

- [ ] Bisa pilih MailApp vs GmailApp sesuai kebutuhan.
- [ ] Bisa kirim email plain text dan HTML.
- [ ] Bisa pakai `HtmlService` template untuk HTML email maintainable.
- [ ] Bisa lampirkan file dari Drive, export Doc → PDF, atau buat Blob CSV.
- [ ] Bisa search email dengan query Gmail dan iterasi thread/message.
- [ ] Bisa simpan attachment email ke Drive otomatis.
- [ ] Paham idempotent pattern dengan label Gmail.

**Selanjutnya: Modul 5 — Building UI Forms for Data Input.**
