import * as XLSX from "xlsx";

const normalizeHeader = (h: string) =>
  h
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/\s|_|-/g, "")
    .trim();

const clean = (v: any) =>
  typeof v === "string" ? v.trim() : v;

// 🔥 PARSER ANGKA ANTI EXCEL TOXIC (KHUSUS SALDO)
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
  kode: "kode",
  kodebarang: "kode",

  nama: "nama",
  namabarang: "nama",
  itemdetails: "nama",

  satuan: "satuan",

  items: "items",
  item: "items",

  saldo: "saldo",
  stok: "saldo",
  saldoakhir: "saldo",
};

export const importBarangExcel = async (
  file: File,
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
        const workbook = XLSX.read(e.target.result, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
          raw: false,
        });

        const headerRowIndex = rows.findIndex((r) =>
          r.some((c) => String(c).trim() !== ""),
        );
        if (headerRowIndex === -1)
          throw new Error("Header tidak ditemukan");

        const headers = rows[headerRowIndex].map((h) =>
          normalizeHeader(String(h)),
        );

        const dataRows = rows.slice(headerRowIndex + 1);

        const mapped = dataRows.map((row, idx) => {
          const obj: any = { __row: headerRowIndex + idx + 2 };

          if (!row.some((v) => String(v).trim() !== "")) {
            return { __skip: true };
          }

          headers.forEach((h, i) => {
            const key = HEADER_MAP[h];
            if (key) obj[key] = row[i];
          });

          // 🔎 VALIDASI WAJIB
          if (!clean(obj.kode))
            return { ...obj, __error: "Kode barang kosong" };

          if (!clean(obj.nama))
            return { ...obj, __error: "Nama barang kosong" };

          if (!clean(obj.satuan))
            return { ...obj, __error: "Satuan kosong" };

          if (!clean(obj.items))
            return { ...obj, __error: "Items kosong" };

          const saldo = parseNumber(obj.saldo);
          if (saldo < 0)
            return { ...obj, __error: "Saldo tidak boleh minus" };

          return {
            kode: String(obj.kode).trim(),
            nama: String(obj.nama).trim(),
            satuan: String(obj.satuan).trim(),
            items: String(obj.items).trim(), // ✅ STRING
            saldo, // ✅ ANGKA
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
    reader.readAsArrayBuffer(file);
  });
};
