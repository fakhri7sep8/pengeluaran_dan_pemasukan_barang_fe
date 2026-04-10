"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  X,
  Edit,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useBarangModule } from "@/hook/useBarangModule";
import { MultiSelect } from "@/components/ui/multi-select";
import Swal from "sweetalert2";
import { importBarangExcel } from "@/helper/importBarangExcel";

export default function BarangPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [showFilter, setShowFilter] = useState(false);

  const [filterKode, setFilterKode] = useState<string[]>([]);
  const [filterNama, setFilterNama] = useState<string[]>([]);
  const [filterSatuan, setFilterSatuan] = useState<string[]>([]);
  const [filterItems, setFilterItems] = useState<string[]>([]);
  const [filterSaldoRange, setFilterSaldoRange] = useState<{
    min: string;
    max: string;
  }>({ min: "", max: "" });

  const [draftFilterSaldoRange, setDraftFilterSaldoRange] = useState<{
    min: string;
    max: string;
  }>({ min: "", max: "" });

  const [draftFilterKode, setDraftFilterKode] = useState<string[]>([]);
  const [draftFilterNama, setDraftFilterNama] = useState<string[]>([]);
  const [draftFilterSatuan, setDraftFilterSatuan] = useState<string[]>([]);
  const [draftFilterItems, setDraftFilterItems] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const defaultForm = { kode: "", nama: "", satuan: "", items: "", saldo: "" };
  const [form, setForm] = useState(defaultForm);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const [editForm, setEditForm] = useState({
    kode: "",
    nama: "",
    satuan: "",
    items: "",
    saldo: "",
  });

  const handleEditChange = (key: string, value: any) =>
    setEditForm((prev) => ({ ...prev, [key]: value }));

  const handleChange = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const { useGetAllBarang, useCreateBarang } = useBarangModule();
  const { data: itemsData = [], isLoading } = useGetAllBarang();
  const { useUpdateBarang } = useBarangModule();
  const { mutate: updateMutate, isPending: isUpdating } = useUpdateBarang();

  const { mutate: createMutate, isPending: isCreating } = useCreateBarang();
  const TEXT_FIELDS = ["kode", "nama", "satuan", "items"] as const;

  const extractNumber = (value?: string) => {
    if (!value) return Number.MAX_SAFE_INTEGER;
    return Number(value.match(/\d+/)?.[0] ?? Number.MAX_SAFE_INTEGER);
  };

  const filteredItems = useMemo(() => {
    const filtered = itemsData.filter((item: any) => {
      const minSaldo = filterSaldoRange.min
        ? Number(filterSaldoRange.min)
        : null;

      const maxSaldo = filterSaldoRange.max
        ? Number(filterSaldoRange.max)
        : null;

      const matchSaldo =
        (minSaldo === null || item.saldo >= minSaldo) &&
        (maxSaldo === null || item.saldo <= maxSaldo);

      return (
        item.nama?.toLowerCase().includes(search.toLowerCase()) &&
        (filterKode.length === 0 || filterKode.includes(item.kode)) &&
        (filterNama.length === 0 || filterNama.includes(item.nama)) &&
        (filterSatuan.length === 0 || filterSatuan.includes(item.satuan)) &&
        (filterItems.length === 0 ||
          filterItems.includes(String(item.items))) &&
        matchSaldo
      );
    });

    // 🔥 SORT KODE DI SINI
    return filtered.sort(
      (a: any, b: any) => extractNumber(a.kode) - extractNumber(b.kode),
    );
  }, [
    itemsData,
    search,
    filterKode,
    filterNama,
    filterSatuan,
    filterItems,
    filterSaldoRange,
  ]);

  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const paginatedItems = filteredItems.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const getUniqueOptions = (field: keyof (typeof itemsData)[0]): string[] => {
    const values = [
      ...new Set(itemsData.map((b: any) => String(b[field]))),
    ].filter((v): v is string => Boolean(v));

    if (field === "kode") {
      return values.sort((a, b) => extractNumber(a) - extractNumber(b));
    }

    return values.sort((a, b) => a.localeCompare(b));
  };

  const handleImportBarang = async (file: File) => {
    try {
      const { valid, rejected } = await importBarangExcel(file);

      if (rejected.length) {
        console.table(rejected);
        await Swal.fire({
          icon: "warning",
          title: "Sebagian data gagal",
          text: `${rejected.length} baris tidak valid`,
        });
      }

      if (!valid.length) return;

      const res = await Swal.fire({
        title: "Import Barang?",
        text: `${valid.length} data akan diimport`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Lanjutkan",
        cancelButtonText: "Batal",
      });

      if (!res.isConfirmed) return;

      for (const item of valid) {
        await new Promise<void>((resolve, reject) => {
          createMutate(item, {
            onSuccess: () => resolve(),
            onError: () => reject(),
          });
        });
      }

      Swal.fire({
        icon: "success",
        title: "Import sukses ",
        text: `${valid.length} barang berhasil ditambahkan`,
      });
    } catch (err) {
      Swal.fire("Error", "Gagal membaca file Excel", "error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Data Barang</h2>
          <p className="text-gray-500 text-sm">Kelola stok barang</p>
        </div>

        <div className="flex items-center gap-3">
          <motion.label
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium text-sm h-11 cursor-pointer"
          >
            📥 Import Excel
            <input
              type="file"
              accept=".xlsx,.xls,.ods"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportBarang(file);
                e.target.value = "";
              }}
            />
          </motion.label>

          <motion.button
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm h-11"
            onClick={() => {
              setForm(defaultForm);
              setShowForm(true);
            }}
          >
            <Plus size={18} /> Tambah Barang
          </motion.button>

          <motion.button
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium text-sm h-11"
            onClick={() => setShowFilter(true)}
          >
            <Filter size={18} /> Filter
          </motion.button>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 w-full ">
          <Search size={16} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari Item Details"
            className="flex-1 text-sm outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span>Tampilkan</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
          <span>data</span>
        </div>
      </div>

      <div className="hidden md:block bg-white border rounded-xl overflow-x-auto">
        <table className=" w-full text-sm table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-gray-600 w-30">Kode</th>
              <th className="px-6 py-4 text-left text-gray-600 w-107.5">
                Item Details
              </th>
              <th className="px-6 py-4 text-left text-gray-600 w-25">Satuan</th>
              <th className="px-6 py-4 text-left text-gray-600 w-30">Items</th>
              <th className="px-6 py-4 text-left text-gray-600 w-25">Saldo</th>
              <th className="px-6 py-4 text-left text-gray-600 w-20">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {paginatedItems.length ? (
              paginatedItems.map((item: any, i: number) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-t hover:bg-blue-50"
                >
                  <td className="px-6 py-4 align-top wrap-break-word">
                    {item.kode}
                  </td>

                  <td
                    className="px-6 py-4 align-top wrap-break-word"
                    title={item.nama}
                  >
                    {item.nama}
                  </td>

                  <td className="px-6 py-4 align-top wrap-break-word">
                    {item.satuan}
                  </td>

                  <td className="px-6 py-4 align-top wrap-break-word">
                    {item.items}
                  </td>

                  <td className="px-6 py-4 align-top wrap-break-word font-medium">
                    {item.saldo}
                  </td>

                  <td className="px-6 py-4 align-top whitespace-nowrap">
                    <button
                      onClick={() => {
                        setEditData(item);
                        setEditForm({
                          kode: item.kode,
                          nama: item.nama,
                          satuan: item.satuan,
                          items: item.items,
                          saldo: String(item.saldo),
                        });
                        setShowEditForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      <Edit size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">
                  {isLoading ? "Memuat data..." : "Data tidak ditemukan"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {paginatedItems.map((item: any) => (
          <div
            key={item.id}
            className="bg-white border rounded-lg p-3 text-[11px] space-y-1"
          >
            <p>
              <span className="text-gray-500">Kode</span> :{" "}
              <span className="font-medium">{item.kode}</span>
            </p>
            <p>
              <span className="text-gray-500">Item Details</span> : {item.nama}
            </p>
            <p>
              <span className="text-gray-500">Satuan</span> : {item.satuan}
            </p>
            <p>
              <span className="text-gray-500">Items</span> : {item.items}
            </p>
            <p className="font-medium">
              <span className="text-gray-500 font-normal">Saldo</span> :{" "}
              {item.saldo}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Page {page} dari {totalPages || 1}
        </p>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="p-2 border rounded-lg disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="p-2 border rounded-lg disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showFilter && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowFilter(false)}
              className="fixed w-full h-screen inset-0 bg-black/10  z-40"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 p-6 space-y-4"
            >
              <h3 className="text-lg font-semibold mb-4">Filter Barang</h3>

              <div className="space-y-4 overflow-y-auto">
                <MultiSelect
                  label="Kode"
                  value={draftFilterKode}
                  onChange={setDraftFilterKode}
                  options={getUniqueOptions("kode")}
                />

                <MultiSelect
                  label="Item Details"
                  value={draftFilterNama}
                  onChange={setDraftFilterNama}
                  options={getUniqueOptions("nama")}
                />

                <MultiSelect
                  label="Satuan"
                  value={draftFilterSatuan}
                  onChange={setDraftFilterSatuan}
                  options={getUniqueOptions("satuan")}
                />

                <MultiSelect
                  label="Items"
                  value={draftFilterItems}
                  onChange={setDraftFilterItems}
                  options={getUniqueOptions("items")}
                />
                <div className="space-y-1">
                  <label className="text-sm mb-1 text-black">
                    Saldo (Range)
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={draftFilterSaldoRange.min}
                      onChange={(e) =>
                        setDraftFilterSaldoRange((p) => ({
                          ...p,
                          min: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border px-4 py-2.5 text-sm"
                    />

                    <input
                      type="number"
                      placeholder="Max"
                      value={draftFilterSaldoRange.max}
                      onChange={(e) =>
                        setDraftFilterSaldoRange((p) => ({
                          ...p,
                          max: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border px-4 py-2.5 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    setDraftFilterKode([]);
                    setDraftFilterNama([]);
                    setDraftFilterSatuan([]);
                    setDraftFilterItems([]);
                    setDraftFilterSaldoRange({ min: "", max: "" });
                    setFilterSaldoRange({ min: "", max: "" });
                    setFilterKode([]);
                    setFilterNama([]);
                    setFilterSatuan([]);
                    setFilterItems([]);
                    setPage(1);
                  }}
                  className="flex-1 border rounded-lg py-2"
                >
                  Reset
                </button>

                <button
                  onClick={() => {
                    setFilterKode(draftFilterKode);
                    setFilterNama(draftFilterNama);
                    setFilterSatuan(draftFilterSatuan);
                    setFilterItems(draftFilterItems);
                    setFilterSaldoRange(draftFilterSaldoRange);
                    setPage(1);
                    setShowFilter(false);
                  }}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2"
                >
                  Terapkan
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 w-full h-screen bg-black/40 backdrop-blur-md z-40"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const requiredFields = ["kode", "nama", "satuan", "items"];
                  for (const key of requiredFields) {
                    if (!(form as any)[key]) {
                      Swal.fire(
                        "Oops",
                        `Lengkapi field ${key.toUpperCase()}`,
                        "error",
                      );
                      return;
                    }
                  }
                  createMutate(form, {
                    onSuccess: () => {
                      Swal.fire(
                        "Sukses",
                        `Barang ${form.nama} berhasil ditambahkan`,
                        "success",
                      );
                      setForm(defaultForm);
                      setShowForm(false);
                    },
                    onError: (err: any) =>
                      Swal.fire(
                        "Gagal",
                        err?.response?.data?.message || "Terjadi kesalahan",
                        "error",
                      ),
                  });
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full  max-w-lg max-h-[85vh] overflow-hidden   bg-white rounded-2xl shadow-xl border  border-gray-100 flex flex-col"
              >
                <div className="px-6 py-5 border-b bg-gray-50 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Tambah Barang
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="p-2 rounded-lg hover:bg-gray-200 transition"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>

                <div className="px-6 py-4 grid grid-cols-1 gap-3 overflow-y-auto">
                  {TEXT_FIELDS.map((key) => (
                    <div key={key} className="space-y-1">
                      <label className="text-xs font-medium text-gray-600 capitalize">
                        {key === "nama" ? "Item details" : key}
                      </label>
                      <input
                        value={(form as any)[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  ))}

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">
                      SALDO
                    </label>
                    <input
                      type="number"
                      value={form.saldo}
                      onChange={(e) => handleChange("saldo", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {isCreating ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showEditForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditForm(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();

                  updateMutate(
                    {
                      id: editData.id,
                      data: {
                        ...editForm,
                        saldo: Number(editForm.saldo),
                      },
                    },
                    {
                      onSuccess: () => {
                        Swal.fire(
                          "Sukses",
                          `Barang ${editForm.nama} berhasil diupdate`,
                          "success",
                        );
                        setShowEditForm(false);
                      },
                    },
                  );
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg max-h-[85vh] overflow-hidden bg-white rounded-2xl shadow-xl border flex flex-col"
              >
                <div className="px-6 py-5 border-b bg-gray-50 flex justify-between">
                  <h3 className="text-lg font-semibold">Edit Barang</h3>
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="p-2 rounded-lg hover:bg-gray-200"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="px-6 py-4 grid gap-3 overflow-y-auto">
                  {TEXT_FIELDS.map((key) => (
                    <div key={key}>
                      <label className="text-xs font-medium text-gray-600 capitalize">
                        {key === "nama" ? "Item details" : key}
                      </label>
                      <input
                        value={(editForm as any)[key]}
                        onChange={(e) => handleEditChange(key, e.target.value)}
                        className="w-full rounded-xl border px-4 py-2.5 text-sm"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="text-xs font-medium text-gray-600">
                      SALDO
                    </label>
                    <input
                      type="number"
                      value={editForm.saldo}
                      onChange={(e) =>
                        handleEditChange("saldo", e.target.value)
                      }
                      className="w-full rounded-xl border px-4 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="px-5 py-2.5 border rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl"
                  >
                    {isUpdating ? "Menyimpan..." : "Update"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
