import * as XLSX from "xlsx";

const normalizeHeader = (h: string) =>
  h.toLowerCase().replace(/\s|_|-/g, "");

const HEADER_MAP: Record<string, string> = {
  nama: "nama",
  namabarang: "nama",
  itemdetails: "nama",

  qty: "qty",
  jumlah: "qty",
  kuantitas: "qty",

  nopo: "No_Po",
  nomorpo: "No_Po",
  purchaseorder: "No_Po",
};

// 🔥 parser angka anti Excel / ODS toxic
const parseNumber = (v: any) => {
  if (v === "" || v === null || v === undefined) return 0;
  if (typeof v === "number") return v;

  if (typeof v === "string") {
    const cleaned = v
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(/,/g, ".");
    const n = Number(cleaned);
    return isNaN(n) ? 0 : n;
  }

  return 0;
};

export const importPembelianExcel = (
  file: File,
  barangList: any[],
): Promise<{
  valid: any[];
  rejected: any[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // 🔥 RAW ARRAY MODE (ODS AMAN)
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
          raw: false,
        });

        // cari header pertama yg ada isinya
        const headerRowIndex = rows.findIndex((r) =>
          r.some((c) => String(c).trim() !== ""),
        );

        if (headerRowIndex === -1) {
          throw new Error("Header tidak ditemukan");
        }

        const headers = rows[headerRowIndex].map((h) =>
          normalizeHeader(String(h)),
        );

        const dataRows = rows.slice(headerRowIndex + 1);

        // map barang (case-insensitive)
        const barangMap = new Map(
          barangList.map((b) => [b.nama.toLowerCase(), b]),
        );

        const mapped = dataRows.map((row, idx) => {
          const obj: any = { __row: headerRowIndex + idx + 2 };

          // skip baris kosong
          if (!row.some((v) => String(v).trim() !== "")) {
            return { __skip: true };
          }

          headers.forEach((h, i) => {
            const key = HEADER_MAP[h];
            if (key) obj[key] = row[i];
          });

          const barang = barangMap.get(
            String(obj.nama || "").toLowerCase(),
          );

          const qty = parseNumber(obj.qty);

          if (!obj.nama)
            return { ...obj, __error: "Nama barang kosong" };

          if (!barang)
            return { ...obj, __error: "Barang tidak ditemukan" };

          if (!obj.No_Po)
            return { ...obj, __error: "No PO kosong" };

          if (qty <= 0)
            return { ...obj, __error: "Jumlah tidak valid" };

          return {
            No_Po: String(obj.No_Po).trim(),
            barangId: barang.id,
            qty,
          };
        });

        resolve({
          valid: mapped.filter((d) => !d.__error && !d.__skip),
          rejected: mapped.filter((d) => d.__error),
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;

    // 🔥 KUNCI UTAMA ODS
    reader.readAsArrayBuffer(file);
  });
};
