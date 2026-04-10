"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  EditIcon,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useBarangModule } from "@/hook/useBarangModule";
import { usePenjualanModule } from "@/hook/usePenjualanModule";
import { X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { MultiSelect } from "@/components/ui/multi-select";
import { importPenjualanExcel } from "@/helper/importPenjualanExcel";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

const PenjualanPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [showForm, setShowForm] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState<any>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterKategori, setFilterKategori] = useState<string[]>([]);
  const [searchBarang, setSearchBarang] = useState("");
  const [draftFilterKategori, setDraftFilterKategori] = useState<string[]>([]);
  const [filterSatuan, setFilterSatuan] = useState<string[]>([]);
  const [filterKode, setFilterKode] = useState<string[]>([]);
  const [filterNama, setFilterNama] = useState<string[]>([]);
  const [filterNoInv, setFilterNoInv] = useState<string[]>([]);
  const [draftFilterSatuan, setDraftFilterSatuan] = useState<string[]>([]);
  const [draftFilterKode, setDraftFilterKode] = useState<string[]>([]);
  const [draftFilterNama, setDraftFilterNama] = useState<string[]>([]);
  const [draftFilterNoInv, setDraftFilterNoInv] = useState<string[]>([]);
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
  const {
    useGetAllPenjualan,
    useCreatePenjualan,
    useGetDetailPenjualan,
    useUpdatePenjualan,
  } = usePenjualanModule();
  const { useGetAllBarang } = useBarangModule();
  const { data: penjualanList, isLoading } = useGetAllPenjualan();
  const { mutate: tambahPenjualan } = useCreatePenjualan();
  const { mutate: updatePenjualan } = useUpdatePenjualan(() => {
    setShowForm(false);
    setEditingId(null);
    setSelectedBarang(null);
    setForm({ barangId: "", qty: "", No_Inv: "" });
  });

  const { data: barangList } = useGetAllBarang();
  const [editingId, setEditingId] = useState<number | null>(null);
    const extractNumber = (value?: string) =>
    Number(value?.match(/\d+/)?.[0] ?? Number.MAX_SAFE_INTEGER);

  const buildOptions = <T,>(
    list: T[] | undefined,
    picker: (item: T) => unknown,
    toString = true,
  ): string[] =>
    Array.from(
      new Set(
        (list ?? [])
          .map(picker)
          .filter(
            (v): v is string =>
              typeof v === "string" && (!toString || v.trim() !== ""),
          ),
      ),
    );

  const itemOptions = useMemo(
    () => buildOptions(penjualanList, (p: any) => p.barang.items),
    [penjualanList],
  );

  const satuanOptions = useMemo(
    () => buildOptions(penjualanList, (p: any) => p.barang.satuan),
    [penjualanList],
  );

  const kodeOptions = useMemo(() => {
    const opts = buildOptions(penjualanList, (p: any) => p.barang.kode);
    return opts.sort((a, b) => extractNumber(a) - extractNumber(b));
  }, [penjualanList]);

  const namaOptions = useMemo(
    () => buildOptions(penjualanList, (p: any) => p.barang.nama),
    [penjualanList],
  );

  const noInvOptions = useMemo(() => {
    const opts = buildOptions(penjualanList, (p: any) => p.No_Inv);
    return opts.sort((a, b) => extractNumber(a) - extractNumber(b));
  }, [penjualanList]);


  const filteredSales = useMemo(() => {
    if (!penjualanList) return [];

    const filtered = penjualanList.filter((s: any) => {
      const matchSearch = search
        ? s.barang.nama.toLowerCase().includes(search.toLowerCase())
        : true;

      const matchItems = filterKategori.length
        ? filterKategori.includes(s.barang.items)
        : true;

      const matchSatuan = filterSatuan.length
        ? filterSatuan.includes(s.barang.satuan)
        : true;

      const matchKode = filterKode.length
        ? filterKode.includes(s.barang.kode)
        : true;

      const matchNama = filterNama.length
        ? filterNama.includes(s.barang.nama)
        : true;

      const matchNoInv = filterNoInv.length
        ? filterNoInv.includes(s.No_Inv)
        : true;

      const minSaldo = filterSaldoRange.min
        ? Number(filterSaldoRange.min)
        : null;

      const maxSaldo = filterSaldoRange.max
        ? Number(filterSaldoRange.max)
        : null;

      const matchSaldo =
        (minSaldo === null || s.qty >= minSaldo) &&
        (maxSaldo === null || s.qty <= maxSaldo);

      const startDate = filterTanggalRange.start
        ? new Date(filterTanggalRange.start.setHours(0, 0, 0, 0))
        : undefined;

      const endDate = filterTanggalRange.end
        ? new Date(filterTanggalRange.end.setHours(23, 59, 59, 999))
        : undefined;

      const matchTanggal =
        (!startDate || new Date(s.tanggal) >= startDate) &&
        (!endDate || new Date(s.tanggal) <= endDate);

      return (
        matchSearch &&
        matchItems &&
        matchSatuan &&
        matchKode &&
        matchNama &&
        matchNoInv &&
        matchSaldo &&
        matchTanggal
      );
    });

    // 🔥 INI KUNCI UTAMA
    return filtered.sort(
      (a: any, b: any) => extractNumber(a.No_Inv) - extractNumber(b.No_Inv),
    );
  }, [
    penjualanList,
    search,
    filterKategori,
    filterSatuan,
    filterKode,
    filterNama,
    filterNoInv,
    filterSaldoRange,
    filterTanggalRange,
  ]);

  const totalPages = Math.ceil(filteredSales.length / pageSize);
  const paginatedSales = filteredSales.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const { data: detail, refetch: refetchDetail } = useGetDetailPenjualan(
    editingId || 0,
  );

  const [form, setForm] = useState<{
    barangId: string;
    qty: string | number;
    No_Inv: string;
  }>({
    barangId: "",
    qty: "",
    No_Inv: "",
  });

  useEffect(() => {
    if (detail) {
      setSelectedBarang(detail.barang);
      setForm({
        barangId: String(detail.barang.id),
        qty: String(detail.qty),
        No_Inv: detail.No_Inv,
      });
    }
  }, [detail]);

  const handleImport = async (file: File) => {
    const { valid, rejected } = await importPenjualanExcel(file, barangList);

    if (rejected.length) {
      console.table(rejected);
      await Swal.fire({
        icon: "warning",
        title: "Sebagian data gagal",
        text: `${rejected.length} baris tidak bisa diimpor`,
      });
    }

    if (!valid.length) return;

    const res = await Swal.fire({
      title: "Import Penjualan?",
      text: `${valid.length} data akan diimpor`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Lanjutkan",
      cancelButtonText: "Batal",
    });

    if (!res.isConfirmed) return;

    valid.forEach((item) => tambahPenjualan(item));

    Swal.fire({
      icon: "success",
      title: "Import berhasil ",
      text: `${valid.length} data masuk`,
    });
  };

  const handleUpdate = () => {
    if (!editingId) return;

    updatePenjualan({
      id: editingId,
      payload: {
        qty: Number(form.qty),
        No_Inv: form.No_Inv,
      },
    });
  };

  const handleSubmit = () => {
    if (
      !form.barangId ||
      form.qty === "" ||
      Number(form.qty) < 1 ||
      !form.No_Inv
    ) {
      Swal.fire({ icon: "error", title: "Isi semua field dengan benar" });
      return;
    }

    tambahPenjualan({
      barangId: Number(form.barangId),
      qty: Number(form.qty),
      No_Inv: form.No_Inv,
    });

    setShowForm(false);
    setEditingId(null);
    setSelectedBarang(null);
    setForm({
      barangId: "",
      qty: "",
      No_Inv: "",
    });

    setSearchBarang("");
  };

  const isEdit = editingId !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Penjualan</h2>
          <p className="text-gray-500">Riwayat barang keluar</p>
        </div>

        <div className="flex items-center gap-3">
          <motion.label
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl 
      border border-gray-200 bg-white
      text-gray-700 font-medium
      hover:border-gray-300 cursor-pointer"
          >
            <Upload size={18} className="text-red-600" />
            <span className="text-sm">Import Excel</span>

            <input
              type="file"
              accept=".xlsx,.xls,.ods"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
                e.target.value = "";
              }}
            />
          </motion.label>
          <motion.button
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.12 }}
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl 
             bg-red-600 text-white font-medium "
          >
            <Plus size={18} />
            <span className="text-sm">Tambah Penjualan</span>
          </motion.button>

          <motion.button
            onClick={() => setShowFilter(true)}
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl 
             border border-gray-200 bg-white
             text-gray-700 font-medium
             hover:border-gray-300"
          >
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm">Filter</span>
          </motion.button>
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
              className="fixed w-full h-screen inset-0 bg-black/40 backdrop-blur-md z-40"
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

                  if (
                    !form.barangId ||
                    !form.qty ||
                    Number(form.qty) < 1 ||
                    !form.No_Inv
                  ) {
                    Swal.fire("Oops", "Lengkapi semua field", "error");
                    return;
                  }

                  if (isEdit) {
                    handleUpdate();
                  } else {
                    handleSubmit();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-white rounded-2xl shadow-xl border overflow-hidden"
              >
                <div className="px-6 py-5 border-b bg-gray-50 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    {editingId ? "Edit Penjualan" : "Tambah Penjualan"}
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
                              {barangList?.map((b: any) => (
                                <CommandItem
                                  key={b.id}
                                  value={b.nama}
                                  onSelect={() => {
                                    setSelectedBarang(b);
                                    setForm((prev) => ({
                                      ...prev,
                                      barangId: String(b.id),
                                    }));
                                  }}
                                  className="flex flex-col items-start"
                                >
                                  <span>{b.kode}</span>
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
                            <CommandInput placeholder="Cari Item Details" />
                            <CommandEmpty>Barang tidak ditemukan</CommandEmpty>

                            <CommandGroup className="max-h-60 overflow-auto">
                              {barangList?.map((b: any) => (
                                <CommandItem
                                  key={b.id}
                                  value={b.nama}
                                  onSelect={() => {
                                    setSelectedBarang(b);
                                    setForm((prev) => ({
                                      ...prev,
                                      barangId: String(b.id),
                                    }));
                                  }}
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
                      value={form.qty}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "") {
                          setForm((p) => ({ ...p, qty: "" }));
                          return;
                        }
                        if (!/^\d+$/.test(v)) return;
                        setForm((p) => ({ ...p, qty: v }));
                      }}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">
                      No INV
                    </label>
                    <input
                      value={form.No_Inv}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, No_Inv: e.target.value }))
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
                    className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-sm"
                  >
                    {editingId ? "Update" : "Simpan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFilter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilter(false)}
              className="fixed inset-0 w-full h-screen bg-black/40 z-40"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col"
            >
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filter Penjualan</h3>
                <button onClick={() => setShowFilter(false)}>
                  <X className="text-gray-500 hover:text-gray-800" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
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
                            ? format(draftFilterTanggalRange.end, "dd MMM yyyy")
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
                  label="No INV"
                  value={draftFilterNoInv}
                  onChange={setDraftFilterNoInv}
                  options={noInvOptions}
                  placeholder="Pilih No INV"
                />

                <MultiSelect
                  label="Kode"
                  value={draftFilterKode}
                  onChange={setDraftFilterKode}
                  options={kodeOptions}
                  placeholder="Pilih kode"
                />

                <MultiSelect
                  label="Item Details"
                  value={draftFilterNama}
                  onChange={setDraftFilterNama}
                  options={namaOptions}
                  placeholder="Pilih Item Details"
                />

                <MultiSelect
                  label="Satuan"
                  value={draftFilterSatuan}
                  onChange={setDraftFilterSatuan}
                  options={satuanOptions}
                  placeholder="Pilih satuan"
                />

                <MultiSelect
                  label="Items"
                  value={draftFilterKategori}
                  onChange={setDraftFilterKategori}
                  options={itemOptions}
                  placeholder="Pilih kategori"
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

              <div className="p-6 border-t bg-white flex gap-2">
                <button
                  onClick={() => {
                    setDraftFilterKategori([]);
                    setDraftFilterSaldoRange({ min: "", max: "" });
                    setDraftFilterNoInv([]);
                    setDraftFilterKode([]);
                    setDraftFilterNama([]);
                    setDraftFilterSatuan([]);
                    setDraftFilterTanggalRange({});
                    setFilterTanggalRange({});
                    setFilterKategori([]);
                    setFilterSaldoRange({ min: "", max: "" });
                    setFilterNoInv([]);
                    setFilterKode([]);
                    setFilterNama([]);
                    setFilterSatuan([]);

                    setPage(1);
                  }}
                  className="flex-1 border rounded-lg py-2 hover:bg-gray-50"
                >
                  Reset
                </button>

                <button
                  onClick={() => {
                    setFilterKategori(draftFilterKategori);
                    setFilterSaldoRange(draftFilterSaldoRange);
                    setFilterTanggalRange(draftFilterTanggalRange);
                    setFilterNoInv(draftFilterNoInv);
                    setFilterKode(draftFilterKode);
                    setFilterNama(draftFilterNama);
                    setFilterSatuan(draftFilterSatuan);

                    setPage(1);
                    setShowFilter(false);
                  }}
                  className="flex-1 bg-red-600 text-white rounded-lg py-2 hover:bg-red-700"
                >
                  Terapkan
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded-lg px-2 py-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span>data</span>
        </div>
      </div>
      <div className="md:hidden grid gap-3">
        {paginatedSales.map((s: any) => (
          <div
            key={s.id}
            className="bg-white border rounded-xl p-3 text-xs space-y-2"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p>
                  <span className="text-gray-500">Tanggal</span> :{" "}
                  <span className="font-medium">
                    {format(new Date(s.tanggal), "dd MMM yyyy")}
                  </span>
                </p>

                <p>
                  <span className="text-gray-500">No INV</span> :{" "}
                  <span className="font-medium">{s.No_Inv}</span>
                </p>

                <p>
                  <span className="text-gray-500">Kode</span> :{" "}
                  <span className="font-medium">{s.barang.kode}</span>
                </p>

                <p>
                  <span className="text-gray-500">Item Details</span> :{" "}
                  <span className="font-medium">{s.barang.nama}</span>
                </p>

                <p>
                  <span className="text-gray-500">Satuan</span> :{" "}
                  <span className="font-medium">{s.barang.satuan}</span>
                </p>

                <p>
                  <span className="text-gray-500">Items</span> :{" "}
                  <span className="font-medium">{s.barang.items}</span>
                </p>

                <p>
                  <span className="text-gray-500">Jumlah</span> :{" "}
                  <span className="font-semibold text-red-600">-{s.qty}</span>
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingId(s.id);
                  setShowForm(true);
                }}
                className="text-red-600"
              >
                <EditIcon size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm table-fixed">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-4 text-left w-25">Tanggal</th>
              <th className="px-6 py-4 text-left w-25">No INV</th>
              <th className="px-6 py-4 text-left w-28">Kode</th>
              <th className="px-6 py-4 text-left w-62.5">Item Details</th>
              <th className="px-6 py-4 text-left w-25">Satuan</th>
              <th className="px-6 py-4 text-left w-34">Items</th>
              <th className="px-6 py-4 text-left w-25">Jumlah</th>
              <th className="px-6 py-4 text-left w-20">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {!isLoading && paginatedSales.length > 0 ? (
              paginatedSales.map((s: any, i: number) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-t hover:bg-red-50 align-top"
                >
                  <td className="px-6 py-4 align-top">
                    {new Date(s.tanggal).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 align-top wrap-break-word">
                    {s.No_Inv}
                  </td>

                  <td className="px-6 py-4 align-top wrap-break-word">
                    {s.barang.kode}
                  </td>

                  <td className="px-6 py-4 align-top wrap-break-word">
                    {s.barang.nama}
                  </td>

                  <td className="px-6 py-4 align-top wrap-break-word">
                    {s.barang.satuan}
                  </td>

                  <td className="px-6 py-4 align-top wrap-break-word">
                    {s.barang.items}
                  </td>

                  <td className="px-6 py-4 align-top font-semibold text-red-600">
                    -{s.qty}
                  </td>

                  <td className="px-6 py-4 align-top">
                    <button
                      onClick={() => {
                        setEditingId(s.id);
                        setShowForm(true);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <EditIcon size={20} />
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
                  {isLoading ? "Loading..." : "Data penjualan tidak ditemukan"}
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
    </motion.div>
  );
};

export default PenjualanPage;
