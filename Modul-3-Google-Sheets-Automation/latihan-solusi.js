/**
 * Modul 3 — Solusi Latihan
 * Set SHEET_ID di bawah sebelum jalankan (atau pakai container-bound).
 */

const SHEET_ID = "GANTI_DENGAN_ID_SHEET_LATIHAN_M3";

function _ss() {
  if (SHEET_ID && SHEET_ID !== "GANTI_DENGAN_ID_SHEET_LATIHAN_M3") {
    return SpreadsheetApp.openById(SHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function _readAsObjects(sheetName) {
  const sheet = _ss().getSheetByName(sheetName);
  const data  = sheet.getDataRange().getValues();
  const headers = data.shift();
  return data.map((row) => {
    const obj = {};
    headers.forEach((k, i) => { obj[k] = row[i]; });
    return obj;
  });
}


/* ----- Soal 1: Statistik Penjualan ----- */
function statistikPenjualan() {
  const rows = _readAsObjects("Penjualan");
  const total = rows.length;
  const selesai = rows.filter((r) => r.Status === "Selesai");
  const totalNilai = selesai.reduce((sum, r) => sum + r.Qty * r["Harga Satuan"], 0);

  // Top customer (by jumlah baris Selesai)
  const customerCount = {};
  selesai.forEach((r) => {
    customerCount[r.Customer] = (customerCount[r.Customer] || 0) + 1;
  });
  const topCustomer = Object.entries(customerCount).sort((a, b) => b[1] - a[1])[0];

  // Top produk (by jumlah Qty Selesai)
  const produkQty = {};
  selesai.forEach((r) => {
    produkQty[r.Produk] = (produkQty[r.Produk] || 0) + r.Qty;
  });
  const topProduk = Object.entries(produkQty).sort((a, b) => b[1] - a[1])[0];

  console.log(`Total transaksi: ${total}`);
  console.log(`Transaksi Selesai: ${selesai.length}`);
  console.log(`Total nilai (Selesai): Rp ${totalNilai.toLocaleString("id-ID")}`);
  console.log(`Top customer: ${topCustomer[0]} (${topCustomer[1]} transaksi)`);
  console.log(`Top produk : ${topProduk[0]} (${topProduk[1]} qty)`);
}


/* ----- Soal 2: Tambah Kolom Subtotal ----- */
function tambahKolomSubtotal() {
  const sheet = _ss().getSheetByName("Penjualan");
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  let colSub = headers.indexOf("Subtotal") + 1; // 1-indexed
  if (colSub === 0) {
    const colHarga = headers.indexOf("Harga Satuan") + 1;
    sheet.insertColumnAfter(colHarga);
    sheet.getRange(1, colHarga + 1).setValue("Subtotal");
    colSub = colHarga + 1;
  }

  const lastRow = sheet.getLastRow();
  const data = sheet.getDataRange().getValues();
  const newHeaders = data[0];
  const colQty   = newHeaders.indexOf("Qty");
  const colHargS = newHeaders.indexOf("Harga Satuan");
  const colSubIdx = newHeaders.indexOf("Subtotal");

  for (let i = 1; i < data.length; i++) {
    data[i][colSubIdx] = data[i][colQty] * data[i][colHargS];
  }
  sheet.getDataRange().setValues(data);
  sheet.getRange(2, colSub, lastRow - 1, 1).setNumberFormat('"Rp" #,##0');
  console.log("Kolom Subtotal terisi & diformat.");
}


/* ----- Soal 3: Validasi Stok ----- */
function validasiStok() {
  const ss = _ss();
  const shPenj = ss.getSheetByName("Penjualan");
  const shProd = ss.getSheetByName("Produk");

  const dataPenj = shPenj.getDataRange().getValues();
  const dataProd = shProd.getDataRange().getValues();

  const hPenj = dataPenj[0];
  const hProd = dataProd[0];

  const cProduk  = hPenj.indexOf("Produk");
  const cQty     = hPenj.indexOf("Qty");
  const cStatus  = hPenj.indexOf("Status");

  const cNamaP   = hProd.indexOf("Nama Produk");
  const cStokP   = hProd.indexOf("Stok");

  // Map nama produk → index baris (di array dataProd)
  const stokMap = {};
  for (let i = 1; i < dataProd.length; i++) {
    stokMap[dataProd[i][cNamaP]] = i;
  }

  for (let i = 1; i < dataPenj.length; i++) {
    if (dataPenj[i][cStatus] !== "Selesai") continue;
    const produk = dataPenj[i][cProduk];
    const qty    = dataPenj[i][cQty];
    const idx    = stokMap[produk];
    if (idx === undefined) continue;

    if (dataProd[idx][cStokP] >= qty) {
      dataProd[idx][cStokP] -= qty;
    } else {
      dataPenj[i][cStatus] = "Stok Tidak Cukup";
    }
  }

  shPenj.getDataRange().setValues(dataPenj);
  shProd.getDataRange().setValues(dataProd);
  console.log("Validasi stok selesai.");
}


/* ----- Soal 4: Custom Function LEVEL_HARGA ----- */
/**
 * @param {number} hargaSatuan
 * @return {string}
 * @customfunction
 */
function LEVEL_HARGA(hargaSatuan) {
  if (hargaSatuan > 1000000) return "Mahal";
  if (hargaSatuan >= 200000) return "Sedang";
  return "Murah";
}


/* ----- Soal 5: Export Selesai ke Sheet Baru ----- */
function exportSelesaiKeSheetBaru() {
  const ss = _ss();
  const src = ss.getSheetByName("Penjualan");
  const data = src.getDataRange().getValues();
  const headers = data[0];
  const cStatus = headers.indexOf("Status");
  const cQty    = headers.indexOf("Qty");
  const cHarga  = headers.indexOf("Harga Satuan");

  const tanggal = Utilities.formatDate(
    new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"
  );
  const namaTab = `Penjualan-Selesai-${tanggal}`;

  const existing = ss.getSheetByName(namaTab);
  if (existing) ss.deleteSheet(existing);

  const dst = ss.insertSheet(namaTab);

  const newHeaders = headers.concat(["Total Nilai"]);
  const newRows = data.slice(1)
    .filter((r) => r[cStatus] === "Selesai")
    .map((r) => r.concat([r[cQty] * r[cHarga]]));

  dst.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]).setFontWeight("bold");
  if (newRows.length > 0) {
    dst.getRange(2, 1, newRows.length, newHeaders.length).setValues(newRows);
  }

  console.log(`Export selesai → tab "${namaTab}" (${newRows.length} baris).`);
}


/* ----- Soal 6: Kirim Notif Selesai (Idempotent) ----- */
function kirimNotifSelesai() {
  const sheet = _ss().getSheetByName("Penjualan");
  const range = sheet.getDataRange();
  const data = range.getValues();
  const headers = data[0];

  const cId    = headers.indexOf("ID Transaksi");
  const cCust  = headers.indexOf("Customer");
  const cEmail = headers.indexOf("Email Customer");
  const cProd  = headers.indexOf("Produk");
  const cQty   = headers.indexOf("Qty");
  const cHarga = headers.indexOf("Harga Satuan");
  const cStat  = headers.indexOf("Status");
  const cNotif = headers.indexOf("Notif Terkirim");

  const stamp = Utilities.formatDate(
    new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm"
  );

  let terkirim = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][cStat] === "Selesai" && !data[i][cNotif]) {
      const total = data[i][cQty] * data[i][cHarga];
      MailApp.sendEmail({
        to: data[i][cEmail],
        subject: `[Selesai] ${data[i][cId]}`,
        body: [
          `Halo ${data[i][cCust]},`,
          ``,
          `Pesanan Anda telah selesai diproses.`,
          ``,
          `ID Transaksi : ${data[i][cId]}`,
          `Produk       : ${data[i][cProd]}`,
          `Qty          : ${data[i][cQty]}`,
          `Total        : Rp ${total.toLocaleString("id-ID")}`,
          ``,
          `Terima kasih.`
        ].join("\n")
      });
      data[i][cNotif] = stamp;
      terkirim++;
    }
  }

  range.setValues(data);
  console.log(`${terkirim} email dikirim.`);
}


/* ----- Soal 7: Dashboard ----- */
function bangunDashboard() {
  const ss = _ss();
  let dash = ss.getSheetByName("Dashboard");
  if (dash) dash.clear();
  else dash = ss.insertSheet("Dashboard");

  const rows = _readAsObjects("Penjualan");

  const total = rows.length;
  const totalNilai = rows
    .filter((r) => r.Status === "Selesai")
    .reduce((s, r) => s + r.Qty * r["Harga Satuan"], 0);
  const cSelesai    = rows.filter((r) => r.Status === "Selesai").length;
  const cDiproses   = rows.filter((r) => r.Status === "Diproses").length;
  const cDibatalkan = rows.filter((r) => r.Status === "Dibatalkan").length;

  // Top customer
  const custMap = {};
  rows.filter((r) => r.Status === "Selesai").forEach((r) => {
    custMap[r.Customer] = (custMap[r.Customer] || 0) + r.Qty * r["Harga Satuan"];
  });
  const topCust = Object.entries(custMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // Top produk
  const prodMap = {};
  rows.filter((r) => r.Status === "Selesai").forEach((r) => {
    prodMap[r.Produk] = (prodMap[r.Produk] || 0) + r.Qty;
  });
  const topProd = Object.entries(prodMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // Tulis layout
  dash.getRange("A1").setValue("Dashboard Penjualan")
      .setFontWeight("bold").setFontSize(16).setBackground("#fef3c7");

  const ringkasan = [
    ["Total Transaksi",      total],
    ["Total Nilai",          totalNilai],
    ["Transaksi Selesai",    cSelesai],
    ["Transaksi Diproses",   cDiproses],
    ["Transaksi Dibatalkan", cDibatalkan]
  ];
  dash.getRange(3, 1, ringkasan.length, 2).setValues(ringkasan);
  dash.getRange("A3:A7").setFontWeight("bold");
  dash.getRange("B4").setNumberFormat('"Rp" #,##0');

  // Top customer
  dash.getRange("A9").setValue("Top 3 Customer").setFontWeight("bold");
  if (topCust.length > 0) {
    dash.getRange(10, 1, topCust.length, 2).setValues(topCust);
    dash.getRange(10, 2, topCust.length, 1).setNumberFormat('"Rp" #,##0');
  }

  // Top produk
  dash.getRange("A14").setValue("Top 3 Produk").setFontWeight("bold");
  if (topProd.length > 0) {
    dash.getRange(15, 1, topProd.length, 2).setValues(topProd);
  }

  dash.autoResizeColumns(1, 2);
  console.log("Dashboard di-update.");
}
