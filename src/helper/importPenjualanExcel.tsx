import * as XLSX from "xlsx";

const normalizeHeader = (h: string) =>
  h.toLowerCase().replace(/\s|_|-/g, "");

const clean = (v: any) =>
  typeof v === "string" ? v.trim() : v;

// 🔥 parser angka biar gak drama (Excel / ODS / koma / titik)
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

const HEADER_MAP: Record<string, string> = {
  noinv: "No_Inv",
  invoice: "No_Inv",
  noinvois: "No_Inv",

  nama: "nama",
  namabarang: "nama",
  itemdetails: "nama",

  qty: "qty",
  jumlah: "qty",
  kuantitas: "qty",
};

export const importPenjualanExcel = async (
  file: File,
  barangList: any[],
): Promise<{
  valid: any[];
  rejected: any[];
}> => {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (!["xlsx", "xls", "ods"].includes(ext || "")) {
    throw new Error("Format file harus .xlsx, .xls, atau .ods");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        // 🔥 ARRAY BUFFER = ODS AMAN
        const workbook = XLSX.read(e.target.result, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // 🔥 RAW ARRAY MODE
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
          raw: false,
        });

        // cari header row pertama
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

          obj.qty = parseNumber(obj.qty);

          if (!clean(obj.No_Inv))
            return { ...obj, __error: "No INV kosong" };

          if (!clean(obj.nama))
            return { ...obj, __error: "Nama barang kosong" };

          const barang = barangMap.get(String(obj.nama).toLowerCase());

          if (!barang)
            return { ...obj, __error: "Barang tidak ditemukan" };

          if (obj.qty <= 0)
            return { ...obj, __error: "Jumlah tidak valid" };

          return {
            No_Inv: String(obj.No_Inv).trim(),
            barangId: barang.id,
            qty: obj.qty,
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

    // 🔥 INI KUNCI ODS
    reader.readAsArrayBuffer(file);
  });
};
