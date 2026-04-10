"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  EditIcon,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePembelianModule } from "@/hook/usePembelianModule";
import Swal from "sweetalert2";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { MultiSelect } from "@/components/ui/multi-select";
import { useBarangModule } from "@/hook/useBarangModule";
import { importPembelianExcel } from "@/helper/importPembelianExcel";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandInput,
  Command,
} from "@/components/ui/command";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

const PembelianPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const defaultForm = {
    barangId: "",
    qty: "",
    No_Po: "",
  };
  const [form, setForm] = useState(defaultForm);

  const [filterKode, setFilterKode] = useState<string[]>([]);
  const [filterNoPo, setFilterNoPo] = useState<string[]>([]);
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
  const [filterTanggalRange, setFilterTanggalRange] = useState<{
    start?: Date;
    end?: Date;
  }>({});
  const [draftFilterTanggalRange, setDraftFilterTanggalRange] = useState<{
    start?: Date;
    end?: Date;
  }>({});

  const [draftFilterKode, setDraftFilterKode] = useState<string[]>([]);
  const [draftFilterNoPo, setDraftFilterNoPo] = useState<string[]>([]);
  const [draftFilterNama, setDraftFilterNama] = useState<string[]>([]);
  const [draftFilterSatuan, setDraftFilterSatuan] = useState<string[]>([]);
  const [draftFilterItems, setDraftFilterItems] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);

  const { useGetAllBarang } = useBarangModule();
  const { data: barangs = [] } = useGetAllBarang();

  const { useGetAllPembelian, useCreatePembelian, useUpdatePembelian } =
    usePembelianModule();

  const { data: purchasesData = [], isLoading } = useGetAllPembelian();
  const { mutate: createMutate, isPending: isCreating } = useCreatePembelian();
  const { mutate: updateMutate, isPending: isUpdating } = useUpdatePembelian();
  const extractNumber = (value?: string) =>
  Number(value?.match(/\d+/)?.[0] ?? Number.MAX_SAFE_INTEGER);


  const handleImportExcel = async (file: File) => {
    try {
      const { valid, rejected } = await importPembelianExcel(file, barangs);

      if (!valid.length) {
        Swal.fire(
          "Gagal",
          rejected.length
            ? `Semua data error (${rejected.length} baris)`
            : "Excel kosong ",
          "error",
        );
        return;
      }

      if (rejected.length) {
        const previewError = rejected
          .slice(0, 3)
          .map((r) => `Baris ${r.__row}: ${r.__error}`)
          .join("<br>");

        const res = await Swal.fire({
          title: "Ada data bermasalah ⚠️",
          html: `
          ${previewError}
          <br/><br/>
          <b>${valid.length}</b> data valid akan diimport
        `,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Lanjutkan",
        });

        if (!res.isConfirmed) return;
      } else {
        const res = await Swal.fire({
          title: "Import Pembelian?",
          text: `${valid.length} data akan diimport`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Lanjutkan",
        });

        if (!res.isConfirmed) return;
      }

      await Promise.all(
        valid.map(
          (item) =>
            new Promise((resolve, reject) => {
              createMutate(item, {
                onSuccess: resolve,
                onError: reject,
              });
            }),
        ),
      );

      Swal.fire("Sukses 🎉", "Data berhasil diimport", "success");
    } catch (err) {
      Swal.fire("Error", "Gagal baca file Excel", "error");
    }
  };

 const getUniqueOptions = (key: string) => {
  const values = [
    ...new Set(
      purchasesData
        .map((p: any) => (key === "No_Po" ? p.No_Po : p.barang?.[key]))
        .filter(Boolean),
    ),
  ] as string[];

  if (key === "kode") {
    return values.sort((a, b) => {
      const numA = Number(a.replace(/\D/g, ""));
      const numB = Number(b.replace(/\D/g, ""));
      return numA - numB;
    });
  }

  // sisanya aman pakai sort biasa
  return values.sort((a, b) => a.localeCompare(b));
};


  const isEdit = editingId !== null;

 const filteredPurchases = useMemo(() => {
  const filtered = purchasesData.filter((p: any) => {
    const matchSearch = (p.barang?.nama || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchKode =
      filterKode.length > 0 ? filterKode.includes(p.barang?.kode) : true;

    const matchNoPo =
      filterNoPo.length > 0 ? filterNoPo.includes(p.No_Po) : true;

    const matchNama =
      filterNama.length > 0 ? filterNama.includes(p.barang?.nama) : true;

    const matchSatuan =
      filterSatuan.length > 0
        ? filterSatuan.includes(p.barang?.satuan)
        : true;

    const matchItems =
      filterItems.length > 0
        ? filterItems.includes(String(p.barang?.items))
        : true;

    const minSaldo = filterSaldoRange.min
      ? Number(filterSaldoRange.min)
      : null;

    const maxSaldo = filterSaldoRange.max
      ? Number(filterSaldoRange.max)
      : null;

    const matchSaldo =
      (minSaldo === null || p.qty >= minSaldo) &&
      (maxSaldo === null || p.qty <= maxSaldo);

    const startDate = filterTanggalRange.start
      ? new Date(filterTanggalRange.start.setHours(0, 0, 0, 0))
      : undefined;

    const endDate = filterTanggalRange.end
      ? new Date(filterTanggalRange.end.setHours(23, 59, 59, 999))
      : undefined;

    const matchTanggal =
      (!startDate || new Date(p.tanggal) >= startDate) &&
      (!endDate || new Date(p.tanggal) <= endDate);

    return (
      matchSearch &&
      matchKode &&
      matchNoPo &&
      matchNama &&
      matchSatuan &&
      matchItems &&
      matchSaldo &&
      matchTanggal
    );
  });

  // 🔥 URUTIN No PO SAJA
  return filtered.sort(
    (a: any, b: any) =>
      extractNumber(a.No_Po) - extractNumber(b.No_Po),
  );
}, [
  purchasesData,
  search,
  filterKode,
  filterNoPo,
  filterNama,
  filterSatuan,
  filterItems,
  filterSaldoRange,
  filterTanggalRange,
]);


  const totalPages = Math.ceil(filteredPurchases.length / pageSize);
  const paginatedPurchases = filteredPurchases.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const selectedBarang = useMemo(() => {
    return barangs.find((b: any) => String(b.id) === String(form.barangId));
  }, [form.barangId, barangs]);

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Pembelian</h2>
          <p className="text-gray-500">Riwayat barang masuk</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <motion.label
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="inline-flex items-center gap-2 px-5 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium text-sm leading-none h-10 cursor-pointer"
          >
            <Upload size={18} className="text-green-600" />
            Import Excel
            <input
              type="file"
              accept=".xlsx,.xls,.ods"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportExcel(file);
              }}
            />
          </motion.label>

          <motion.button
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="inline-flex items-center gap-2 px-5 rounded-xl bg-green-600 text-white text-sm font-medium leading-none h-10 active:scale-[0.98]"
            onClick={() => {
              setEditingId(null);
              setForm(defaultForm);
              setShowForm(true);
            }}
          >
            <Plus size={18} /> Tambah Pembelian
          </motion.button>

          <motion.button
            onClick={() => setShowFilter(true)}
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="inline-flex items-center gap-2 px-5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium leading-none hover:border-gray-300 h-10"
          >
            <Filter size={18} className="text-gray-500" /> Filter
          </motion.button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 px-4 py-2.5 border rounded-xl w-full">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari Item Details"
            className="flex-1 text-sm focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 shrink-0">
          <span>Tampilkan</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-20 rounded-lg">
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

      <div className="md:hidden grid gap-3">
        {paginatedPurchases.map((p: any) => (
          <div
            key={p.id}
            className="bg-white border rounded-xl p-3 text-xs space-y-2"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p>
                  <span className="text-gray-500">tanggal</span> :{" "}
                  <span className="font-medium">
                    {format(new Date(p.tanggal), "dd MMM yyyy")}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">No Po</span> :{" "}
                  <span className="font-medium ">{p.No_Po}</span>
                </p>
                <p>
                  <span className="text-gray-500">Kode</span> :{" "}
                  <span className="font-medium">{p.barang.kode}</span>
                </p>

                <p>
                  <span className="text-gray-500">Item Details</span> :{" "}
                  <span className="font-medium">{p.barang.nama}</span>
                </p>

                <p>
                  <span className="text-gray-500">Satuan</span> :{" "}
                  <span className="font-medium">{p.barang.satuan}</span>
                </p>

                <p>
                  <span className="text-gray-500">Items</span> :{" "}
                  <span className="font-medium">{p.barang.items}</span>
                </p>

                <p>
                  <span className="text-gray-500">Saldo</span> :{" "}
                  <span className="font-medium">{p.qty}</span>
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingId(p.id);
                  setForm({
                    barangId: p.barang.id,
                    qty: p.qty,
                    No_Po: p.No_Po,
                  });
                  setShowForm(true);
                }}
                className="text-green-600"
              >
                <EditIcon size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {showFilter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilter(false)}
              className="fixed w-full h-screen inset-0 bg-black/40 z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50"
            >
              <div className="relative h-full flex flex-col">
                <div className="px-6 py-5 border-b flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Filter Pembelian</h3>
                  <button onClick={() => setShowFilter(false)}>
                    <X className="text-gray-500 hover:text-gray-800" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 pb-28">
                  <div className="space-y-1">
                    <label className="block text-sm mb-1">Tanggal</label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="w-full border rounded-lg px-3 py-2 text-left text-sm text-gray-400">
                            {draftFilterTanggalRange.start
                              ? format(
                                  draftFilterTanggalRange.start,
                                  "dd MMM yyyy",
                                )
                              : "Mulai"}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateCalendar
                              value={draftFilterTanggalRange.start || null}
                              onChange={(newDate) =>
                                setDraftFilterTanggalRange((p) => ({
                                  ...p,
                                  start: newDate || undefined,
                                }))
                              }
                              minDate={new Date(1900, 0, 1)}
                              maxDate={new Date()}
                            />
                          </LocalizationProvider>
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="w-full border rounded-lg px-3 py-2 text-left text-sm text-gray-400">
                            {draftFilterTanggalRange.end
                              ? format(
                                  draftFilterTanggalRange.end,
                                  "dd MMM yyyy",
                                )
                              : "Sampai"}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateCalendar
                              value={draftFilterTanggalRange.end || null}
                              onChange={(newDate) =>
                                setDraftFilterTanggalRange((p) => ({
                                  ...p,
                                  end: newDate || undefined,
                                }))
                              }
                              minDate={new Date(1900, 0, 1)}
                              maxDate={new Date()}
                            />
                          </LocalizationProvider>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <MultiSelect
                    label="No Po"
                    value={draftFilterNoPo}
                    onChange={setDraftFilterNoPo}
                    options={getUniqueOptions("No_Po")}
                  />

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
                      Jumlah (Range)
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
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t px-6 py-4 flex gap-2">
                  <button
                    onClick={() => {
                      setDraftFilterKode([]);
                      setDraftFilterNoPo([]);
                      setDraftFilterNama([]);
                      setDraftFilterSatuan([]);
                      setDraftFilterItems([]);
                      setDraftFilterTanggalRange({});
                      setFilterTanggalRange({});

                      setFilterKode([]);
                      setFilterNoPo([]);
                      setFilterNama([]);
                      setFilterSatuan([]);
                      setFilterItems([]);
                      setDraftFilterSaldoRange({ min: "", max: "" });
                      setFilterSaldoRange({ min: "", max: "" });

                      setPage(1);
                    }}
                    className="flex-1 border rounded-lg py-2 hover:bg-gray-50"
                  >
                    Reset
                  </button>

                  <button
                    onClick={() => {
                      setFilterKode(draftFilterKode);
                      setFilterNoPo(draftFilterNoPo);
                      setFilterNama(draftFilterNama);
                      setFilterSatuan(draftFilterSatuan);
                      setFilterItems(draftFilterItems);
                      setFilterSaldoRange(draftFilterSaldoRange);
                      setFilterTanggalRange(draftFilterTanggalRange);

                      setPage(1);
                      setShowFilter(false);
                    }}
                    className="flex-1 bg-green-600 text-white rounded-lg py-2 hover:bg-green-700"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="hidden md:block bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm table-fixed">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-4 text-left w-25">Tanggal</th>
              <th className="px-6 py-4 text-left w-25">No PO</th>
              <th className="px-6 py-4 text-left w-28">Kode</th>
              <th className="px-6 py-4 text-left w-62.5">Item Details</th>
              <th className="px-6 py-4 text-left w-25">Satuan</th>
              <th className="px-6 py-4 text-left w-34">Items</th>
              <th className="px-6 py-4 text-left w-25">Jumlah</th>
              <th className="px-6 py-4 text-left w-20">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {paginatedPurchases.length > 0 ? (
              paginatedPurchases.map((p: any, i: number) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-t hover:bg-green-50 align-top"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(p.tanggal).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 wrap-break-word">{p.No_Po}</td>

                  <td className="px-6 py-4 wrap-break-word">
                    {p.barang.kode}
                  </td>

                  <td className="px-6 py-4 wrap-break-word">{p.barang.nama}</td>

                  <td className="px-6 py-4 wrap-break-word">
                    {p.barang.satuan}
                  </td>

                  <td className="px-6 py-4 wrap-break-word">
                    {p.barang.items}
                  </td>

                  <td className="px-6 py-4 font-semibold text-green-600 wrap-break-word">
                    +{p.qty}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setEditingId(p.id);
                        setForm({
                          barangId: p.barang.id,
                          qty: p.qty,
                          No_Po: p.No_Po,
                        });
                        setShowForm(true);
                      }}
                      className="text-green-600 hover:text-green-800 transition"
                    >
                      <EditIcon size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-10 text-center text-gray-400"
                >
                  {isLoading
                    ? "Memuat data..."
                    : "Data pembelian tidak ditemukan"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Page {page} dari {totalPages || 1}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border disabled:opacity-40 hover:bg-gray-50"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages || totalPages === 0}
            className="p-2 rounded-lg border disabled:opacity-40 hover:bg-gray-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed w-full h-screen inset-0 bg-black/40 backdrop-blur-sm z-40"
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

                  if (!form.barangId || !form.qty || !form.No_Po) {
                    Swal.fire("Oops", "Lengkapi semua field", "error");
                    return;
                  }

                  if (editingId) {
                    updateMutate(
                      { id: editingId, payload: form },
                      {
                        onSuccess: () => {
                          Swal.fire("Berhasil", "Data diperbarui ", "success");
                          setShowForm(false);
                          setEditingId(null);
                          setForm({ barangId: "", qty: "", No_Po: "" });
                        },
                      },
                    );
                  } else {
                    createMutate(form, {
                      onSuccess: () => {
                        Swal.fire(
                          "Berhasil",
                          "Pembelian ditambahkan ",
                          "success",
                        );
                        setShowForm(false);
                        setForm({ barangId: "", qty: "", No_Po: "" });
                      },
                    });
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-white rounded-2xl shadow-xl border overflow-hidden"
              >
                <div className="px-6 py-5 border-b bg-gray-50 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    {editingId ? "Edit Pembelian" : "Tambah Pembelian"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="p-2 rounded-lg hover:bg-gray-200"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="px-6 py-6 grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">
                      Kode
                    </label>

                    <Popover>
                      <PopoverTrigger asChild disabled={isEdit}>
                        <button
                          type="button"
                          disabled={isEdit}
                          className="w-full flex justify-between items-center rounded-xl border px-4 py-2.5 text-sm"
                        >
                          {selectedBarang?.kode || "Pilih kode "}
                          {!isEdit && (
                            <Search className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </PopoverTrigger>

                      {!isEdit && (
                        <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                          <Command>
                            <CommandInput placeholder="Cari kode" />
                            <CommandEmpty>Kode tidak ditemukan</CommandEmpty>

                            <CommandGroup className="max-h-60 overflow-auto">
                              {barangs.map((b: any) => (
                                <CommandItem
                                  key={b.id}
                                  value={b.kode}
                                  onSelect={() =>
                                    setForm((prev) => ({
                                      ...prev,
                                      barangId: String(b.id),
                                    }))
                                  }
                                >
                                  {b.kode}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      )}
                    </Popover>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">
                      Item Details
                    </label>

                    <Popover>
                      <PopoverTrigger asChild disabled={isEdit}>
                        <button
                          type="button"
                          disabled={isEdit}
                          className="w-full flex justify-between items-center rounded-xl border px-4 py-2.5 text-sm"
                        >
                          {selectedBarang?.nama || "Pilih Item Details"}
                          {!isEdit && (
                            <Search className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </PopoverTrigger>

                      {!isEdit && (
                        <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                          <Command>
                            <CommandInput placeholder="Cari nama barang..." />
                            <CommandEmpty>Barang tidak ditemukan</CommandEmpty>

                            <CommandGroup className="max-h-60 overflow-auto">
                              {barangs.map((b: any) => (
                                <CommandItem
                                  key={b.id}
                                  value={b.nama}
                                  onSelect={() =>
                                    setForm((prev) => ({
                                      ...prev,
                                      barangId: String(b.id),
                                    }))
                                  }
                                  className="flex flex-col items-start"
                                >
                                  <span>{b.nama}</span>
                                  <span className="text-xs text-gray-400">
                                    {b.kode}
                                  </span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      )}
                    </Popover>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">
                      Jumlah
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={form.qty}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          setForm((prev) => ({ ...prev, qty: "" }));
                          return;
                        }
                        if (!/^\d+$/.test(value)) return;
                        setForm((prev) => ({ ...prev, qty: value }));
                      }}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">
                      No PO
                    </label>
                    <input
                      value={form.No_Po}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          No_Po: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border px-4 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 rounded-xl border text-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-green-600 text-white text-sm"
                  >
                    {editingId ? "Update" : "Simpan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PembelianPage;
