# Template Doc — Surat Notifikasi

File ini adalah **referensi konten** untuk Google Doc template yang dipakai di Modul 2 §3.3 (Pola Placeholder) dan latihan Soal 3.

> Apps Script bekerja dengan **Google Doc native**, bukan file `.md`. Jadi langkah Anda: bikin Google Doc baru, **copy isi di bawah ini** ke dalamnya, lalu copy ID Doc dari URL untuk set ke `TEMPLATE_ID` di kode.

---

## Cara Setup

1. Buka [https://docs.google.com](https://docs.google.com), klik **Blank** untuk dokumen baru.
2. Rename dokumen jadi **"Template-Surat-Notifikasi"**.
3. Copy isi blok di bawah ke dokumen tersebut.
4. (Opsional) Beri formatting: heading, bold, alignment, kop surat. Apps Script `replaceText` tidak peduli formatting — placeholder bisa di posisi apapun.
5. Save (otomatis di Google Docs).
6. Copy ID Doc dari URL:
   ```
   https://docs.google.com/document/d/  <-- ID DI SINI -->  /edit
   ```
7. Pakai ID itu sebagai `TEMPLATE_ID` di `contoh.js` Modul 2 atau di solusi latihan.

---

## Isi Template (copy mulai garis di bawah)

---

**SURAT NOTIFIKASI PEMBAYARAN**

Nomor   : SRT-{{nomor_surat}}
Tanggal : {{tanggal}}

Kepada Yth.,
**{{nama}}**
{{alamat}}

Dengan hormat,

Dengan ini kami informasikan bahwa kami telah memproses pembayaran untuk Anda dengan rincian sebagai berikut:

| Keterangan | Nilai |
|---|---|
| Periode | {{periode}} |
| Nominal | **{{nominal}}** |
| Metode  | Transfer Bank |

Pembayaran akan diteruskan ke rekening yang telah terdaftar di sistem kami dalam **1 × 24 jam** sejak surat ini diterbitkan.

Apabila ada pertanyaan, silakan menghubungi kami melalui email berikut: **{{email_pic}}**.

Terima kasih atas kerja sama yang baik.

Hormat kami,

**Tim Finance**
{{nama_kantor}}

---

(end of template)

---

## Daftar Placeholder

| Placeholder | Tipe | Contoh Nilai |
|---|---|---|
| `{{nomor_surat}}` | String | `"2026/05/001"` |
| `{{tanggal}}` | String | `"10 Mei 2026"` |
| `{{nama}}` | String | `"Sari Wulandari"` |
| `{{alamat}}` | String | `"Jl. Sudirman No. 123, Jakarta"` |
| `{{periode}}` | String | `"April 2026"` |
| `{{nominal}}` | String (sudah diformat) | `"Rp 5.000.000"` |
| `{{email_pic}}` | String | `"finance@kantor.id"` |
| `{{nama_kantor}}` | String | `"PT Otomasi Sejahtera"` |

---

## Versi Minimal (untuk latihan Soal 3 di `latihan.md`)

Kalau Anda hanya ingin latihan Soal 3 (3 placeholder), buat Doc terpisah `Template-Surat` dengan isi minimal:

```
Kepada: {{nama}}
Tanggal: {{tanggal}}

Dengan ini kami informasikan nominal sebesar {{nominal}}.

Terima kasih.
```

---

## Catatan Teknis untuk `replaceText`

Apps Script `body.replaceText(pattern, replacement)` menerima **regex**, bukan string biasa. Kurung kurawal `{` dan `}` adalah karakter spesial di regex, jadi **wajib di-escape** dengan `\\{` dan `\\}`:

```javascript
// ❌ Tidak match — { di regex artinya quantifier
body.replaceText("{{nama}}", data.nama);

// ✓ Match — \\{ escape jadi literal {
body.replaceText("\\{\\{nama\\}\\}", data.nama);
```

Pola escape `\\{\\{NAMA\\}\\}` mencocokkan teks literal `{{NAMA}}` di dokumen.

---

## Contoh Hasil

Setelah script men-replace placeholder dengan data:

```
data = {
  nomor_surat: "2026/05/001",
  tanggal: "10 Mei 2026",
  nama: "Sari Wulandari",
  alamat: "Jl. Sudirman No. 123, Jakarta",
  periode: "April 2026",
  nominal: "Rp 5.000.000",
  email_pic: "finance@kantor.id",
  nama_kantor: "PT Otomasi Sejahtera"
}
```

Hasil dokumen akan tampak seperti:

> **SURAT NOTIFIKASI PEMBAYARAN**
>
> Nomor   : SRT-2026/05/001
> Tanggal : 10 Mei 2026
>
> Kepada Yth.,
> **Sari Wulandari**
> Jl. Sudirman No. 123, Jakarta
>
> Dengan hormat,
>
> Dengan ini kami informasikan bahwa kami telah memproses pembayaran untuk Anda dengan rincian sebagai berikut:
>
> | Keterangan | Nilai |
> |---|---|
> | Periode | April 2026 |
> | Nominal | **Rp 5.000.000** |
> | Metode  | Transfer Bank |
>
> ... dst.
