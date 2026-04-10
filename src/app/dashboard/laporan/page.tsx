"use client";

import React, { useState, useMemo } from "react";
import { usePembelianModule } from "@/hook/usePembelianModule";
import { usePenjualanModule } from "@/hook/usePenjualanModule";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { MultiSelect } from "@/components/ui/multi-select";
import Swal from "sweetalert2";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

const LaporanPage = () => {
  const { useGetAllPembelian } = usePembelianModule();
  const { useGetAllPenjualan } = usePenjualanModule();
  const { data: pembelianData = [], isLoading: loadingPembelian } =
    useGetAllPembelian();
  const { data: penjualanData = [], isLoading: loadingPenjualan } =
    useGetAllPenjualan();

  const [selectedTab, setSelectedTab] = useState<"pembelian" | "penjualan">(
    "pembelian",
  );
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [showFilter, setShowFilter] = useState(false);
  const [filterKode, setFilterKode] = useState<string[]>([]);
  const [filterNama, setFilterNama] = useState<string[]>([]);
  const [filterSatuan, setFilterSatuan] = useState<string[]>([]);
  const [filterItems, setFilterItems] = useState<string[]>([]);
  const [filterNoPo, setFilterNoPo] = useState<string[]>([]);
  const [filterNoInv, setFilterNoInv] = useState<string[]>([]);
  const [draftFilterNoPo, setDraftFilterNoPo] = useState<string[]>([]);
  const [draftFilterNoInv, setDraftFilterNoInv] = useState<string[]>([]);

  const [draftFilterKode, setDraftFilterKode] = useState<string[]>([]);
  const [draftFilterNama, setDraftFilterNama] = useState<string[]>([]);
  const [draftFilterSatuan, setDraftFilterSatuan] = useState<string[]>([]);
  const [draftFilterItems, setDraftFilterItems] = useState<string[]>([]);
  const [filterTanggalRange, setFilterTanggalRange] = useState<{
    start?: Date;
    end?: Date;
  }>({});
  const [draftFilterTanggalRange, setDraftFilterTanggalRange] = useState<{
    start?: Date;
    end?: Date;
  }>({});
  const [filterQtyRange, setFilterQtyRange] = useState<{
    min?: number;
    max?: number;
  }>({});

  const [draftFilterQtyRange, setDraftFilterQtyRange] = useState<{
    min?: number;
    max?: number;
  }>({});

  const data = useMemo(
    () => (selectedTab === "pembelian" ? pembelianData : penjualanData),
    [selectedTab, pembelianData, penjualanData],
  );

  const toggleRow = (index: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const exportExcel = async () => {
    const isPartial = selectedRows.size > 0;

    const result = await Swal.fire({
      title: "Konfirmasi Download",
      text: isPartial
        ? "Apakah kamu ingin mendownload data yang dipilih?"
        : "Apakah kamu yakin ingin mendownload semua data?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, download",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    const source = isPartial
      ? Array.from(selectedRows).map((i) => paginatedData[i])
      : filteredData;

    const rows = source.map((d: any) => ({
      Tanggal: new Date(d.tanggal).toLocaleDateString("id-ID"),
      Nomor: d.No_Po || d.No_Inv,
      Kode: d.barang?.kode,
      Barang: d.barang?.nama,
      Satuan: d.barang?.satuan,
      Items: d.barang?.items,
      Jumlah: (selectedTab === "pembelian" ? "+" : "-") + d.qty,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
    XLSX.writeFile(workbook, `${selectedTab}-laporan.xlsx`);
  };

  const extractNumber = (value: string) => {
    const match = value.match(/\d+/);
    return match ? Number(match[0]) : 0;
  };

  const getUniqueOptions = (
    key: "kode" | "nama" | "satuan" | "items",
  ): string[] => {
    const values = data
      .map((d: any) => d.barang?.[key])
      .filter((v: any): v is string => typeof v === "string");

    const unique = Array.from(new Set<string>(values));

    if (key === "kode") {
      return unique.sort((a, b) => extractNumber(a) - extractNumber(b));
    }

    return unique.sort((a, b) => a.localeCompare(b));
  };

  const getUniqueNoPo = (): string[] => {
    const values = data
      .map((d: any) => d.No_Po)
      .filter((v: any): v is string => typeof v === "string");

    return Array.from(new Set<string>(values)).sort(
      (a, b) => extractNumber(a) - extractNumber(b),
    );
  };

  const getUniqueNoInv = (): string[] => {
    const values = data
      .map((d: any) => d.No_Inv)
      .filter((v: any): v is string => typeof v === "string");

    return Array.from(new Set<string>(values)).sort(
      (a, b) => extractNumber(a) - extractNumber(b),
    );
  };

  const filteredData = useMemo(() => {
    const filtered = data.filter((d: any) => {
      const matchSearch = d.barang?.nama
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchKode =
        filterKode.length > 0 ? filterKode.includes(d.barang?.kode) : true;

      const matchNama =
        filterNama.length > 0 ? filterNama.includes(d.barang?.nama) : true;

      const matchSatuan =
        filterSatuan.length > 0
          ? filterSatuan.includes(d.barang?.satuan)
          : true;

      const matchItems =
        filterItems.length > 0 ? filterItems.includes(d.barang?.items) : true;

      const matchNoPo =
        filterNoPo.length > 0 ? filterNoPo.includes(d.No_Po) : true;

      const matchNoInv =
        filterNoInv.length > 0 ? filterNoInv.includes(d.No_Inv) : true;

      const startDate = filterTanggalRange.start
        ? new Date(filterTanggalRange.start.setHours(0, 0, 0, 0))
        : undefined;

      const endDate = filterTanggalRange.end
        ? new Date(filterTanggalRange.end.setHours(23, 59, 59, 999))
        : undefined;

      const matchTanggal =
        (!startDate || new Date(d.tanggal) >= startDate) &&
        (!endDate || new Date(d.tanggal) <= endDate);

      const matchQty = (() => {
        if (!filterQtyRange.min && !filterQtyRange.max) return true;

        const qtyAbs = Math.abs(d.qty);

        if (filterQtyRange.min && qtyAbs < filterQtyRange.min) return false;
        if (filterQtyRange.max && qtyAbs > filterQtyRange.max) return false;

        return true;
      })();

      return (
        matchSearch &&
        matchKode &&
        matchNama &&
        matchSatuan &&
        matchItems &&
        matchTanggal &&
        matchNoPo &&
        matchNoInv &&
        matchQty
      );
    });

    return filtered.sort((a: any, b: any) => {
      if (selectedTab === "pembelian") {
        return extractNumber(a.No_Po ?? "") - extractNumber(b.No_Po ?? "");
      }

      return extractNumber(a.No_Inv ?? "") - extractNumber(b.No_Inv ?? "");
    });
  }, [
    data,
    search,
    filterKode,
    filterNama,
    filterSatuan,
    filterItems,
    filterTanggalRange,
    filterNoInv,
    filterNoPo,
    filterQtyRange,
  ]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  if (loadingPembelian || loadingPenjualan) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <motion.div
      className="p-4 sm:p-6 space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div
        className="
    grid grid-cols-2 gap-2
    sm:flex sm:items-center sm:justify-between
  "
      >
        <div className="col-span-2 sm:col-auto flex gap-2">
          <motion.button
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="
        flex-1 sm:flex-none
        h-10
        px-5
        rounded-xl
        text-sm font-medium
        bg-green-600 text-white
      "
            onClick={() => {
              setSelectedTab("pembelian");
              setSelectedRows(new Set());
              setPage(1);
            }}
          >
            Pembelian
          </motion.button>

          <motion.button
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="
        flex-1 sm:flex-none
        h-10
        px-5
        rounded-xl
        text-sm font-medium
        bg-red-600 text-white
      "
            onClick={() => {
              setSelectedTab("penjualan");
              setSelectedRows(new Set());
              setPage(1);
            }}
          >
            Penjualan
          </motion.button>
        </div>

        <div className="col-span-2 sm:col-auto flex gap-2">
          <motion.button
            onClick={exportExcel}
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="
        flex-1 sm:flex-none
        h-10
        px-4
        rounded-xl
        inline-flex items-center justify-center gap-2
        text-sm font-medium
        border border-gray-200
        bg-white text-gray-700
      "
          >
            <Upload size={16} />
            Export
          </motion.button>

          <motion.button
            onClick={() => setShowFilter(true)}
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="
        flex-1 sm:flex-none
        h-10
        px-4
        rounded-xl
        inline-flex items-center justify-center gap-2
        text-sm font-medium
        border border-gray-200
        bg-white text-gray-700
      "
          >
            <Filter size={16} />
            Filter
          </motion.button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 px-4 py-2.5 border rounded-xl w-full sm:w-1/2">
          <Search size={18} className="text-gray-400" />
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

        <div className="flex items-center gap-2 text-sm flex-wrap">
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

      <div className="md:hidden grid gap-3">
        {paginatedData.length > 0 ? (
          paginatedData.map((d: any, i: number) => (
            <div
              key={d.id || d.No_Po}
              className="bg-white border rounded-xl p-3 text-xs space-y-2 relative"
            >
              <input
                type="checkbox"
                checked={selectedRows.has(i)}
                onChange={() => toggleRow(i)}
                className="absolute top-3 right-3"
              />

              <div className="space-y-1">
                <p>
                  <span className="text-gray-500">Tanggal</span> :{" "}
                  <span className="font-medium">
                    {format(new Date(d.tanggal), "dd MMM yyyy")}
                  </span>
                </p>

                <p>
                  <span className="text-gray-500">No Po / Inv</span> :{" "}
                  <span className="font-medium">{d.No_Po || d.No_Inv}</span>
                </p>

                <p>
                  <span className="text-gray-500">Kode</span> :{" "}
                  <span className="font-medium">{d.barang?.kode}</span>
                </p>

                <p>
                  <span className="text-gray-500">Item Details</span> :{" "}
                  <span className="font-medium">{d.barang?.nama}</span>
                </p>

                <p>
                  <span className="text-gray-500">Satuan</span> :{" "}
                  <span className="font-medium">{d.barang?.satuan}</span>
                </p>

                <p>
                  <span className="text-gray-500">Items</span> :{" "}
                  <span className="font-medium">{d.barang?.items}</span>
                </p>

                <p>
                  <span className="text-gray-500">Jumlah</span> :{" "}
                  <span
                    className={`font-semibold ${
                      selectedTab === "pembelian"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedTab === "pembelian" ? "+" : "-"}
                    {d.qty}
                  </span>
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">Data tidak ditemukan</p>
        )}
      </div>

      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl border shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-4 text-left">Tanggal</th>
              <th className="px-6 py-4 text-left">
                {selectedTab === "pembelian" ? "No Po" : "No Inv"}
              </th>
              <th className="px-6 py-4 text-left">Kode</th>
              <th className="px-6 py-4 text-left">Item Details</th>
              <th className="px-6 py-4 text-left">Satuan</th>
              <th className="px-6 py-4 text-left">Items</th>
              <th className="px-6 py-4 text-left">Jumlah</th>
              <th className="px-6 py-4 text-center">Pilih</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((d: any, i: number) => (
              <motion.tr
                key={i}
                className="border-t hover:bg-gray-50 align-top"
              >
                <td className="px-6 py-4 align-top whitespace-normal wrap-break-word">
                  {format(new Date(d.tanggal), "dd/MM/yyyy")}
                </td>

                <td className="px-6 py-4 align-top wrap-break-word">
                  {d.No_Po || d.No_Inv}
                </td>

                <td className="px-6 py-4 align-top wrap-break-word">
                  {d.barang?.kode}
                </td>

                <td className="px-6 py-4 align-top whitespace-normal wrap-break-word">
                  {d.barang?.nama}
                </td>

                <td className="px-6 py-4 align-top wrap-break-word">
                  {d.barang?.satuan}
                </td>

                <td className="px-6 py-4 align-top wrap-break-word">
                  {d.barang?.items}
                </td>

                <td
                  className={`px-6 py-4 align-top font-semibold wrap-break-word ${
                    selectedTab === "pembelian"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {selectedTab === "pembelian" ? "+" : "-"}
                  {d.qty}
                </td>

                <td className="px-6 py-4 align-top text-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(i)}
                    onChange={() => toggleRow(i)}
                  />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
        <p className="text-gray-500">
          Page {page} dari {totalPages || 1}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="p-2 border rounded-lg disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="p-2 border rounded-lg disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

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
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex justify-between">
                  <h3 className="font-semibold text-lg">Filter Laporan</h3>
                  <button onClick={() => setShowFilter(false)}>
                    <X />
                  </button>
                </div>

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
                {selectedTab === "pembelian" && (
                  <MultiSelect
                    label="No Po"
                    value={draftFilterNoPo}
                    onChange={setDraftFilterNoPo}
                    options={getUniqueNoPo()}
                  />
                )}

                {selectedTab === "penjualan" && (
                  <MultiSelect
                    label="No Inv"
                    value={draftFilterNoInv}
                    onChange={setDraftFilterNoInv}
                    options={getUniqueNoInv()}
                  />
                )}

                <MultiSelect
                  label="Kode"
                  value={draftFilterKode}
                  onChange={setDraftFilterKode}
                  options={getUniqueOptions("kode")}
                />
                <MultiSelect
                  label="Iten Details"
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
                  <label className="block text-sm">Jumlah</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      value={draftFilterQtyRange.min ?? ""}
                      onChange={(e) =>
                        setDraftFilterQtyRange((p) => ({
                          ...p,
                          min: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        }))
                      }
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      value={draftFilterQtyRange.max ?? ""}
                      onChange={(e) =>
                        setDraftFilterQtyRange((p) => ({
                          ...p,
                          max: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        }))
                      }
                    />
                  </div>

                  <p className="text-xs text-gray-400">
                    Berlaku untuk pembelian & penjualan
                  </p>
                </div>
              </div>
              <div className="sticky bottom-0 left-0 right-0 p-6 bg-white border-t flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setDraftFilterKode([]);
                    setDraftFilterNama([]);
                    setDraftFilterSatuan([]);
                    setDraftFilterItems([]);
                    setDraftFilterTanggalRange({});
                    setFilterTanggalRange({});
                    setFilterKode([]);
                    setFilterNama([]);
                    setFilterSatuan([]);
                    setFilterItems([]);
                    setDraftFilterNoPo([]);
                    setDraftFilterNoInv([]);
                    setFilterNoPo([]);
                    setFilterNoInv([]);
                    setDraftFilterQtyRange({});
                    setFilterQtyRange({});

                    setPage(1);
                  }}
                >
                  Reset
                </Button>

                <motion.div whileTap={{ scale: 0.97 }} className="flex-1">
                  <Button
                    className="w-full"
                    onClick={() => {
                      setFilterKode(draftFilterKode);
                      setFilterNama(draftFilterNama);
                      setFilterSatuan(draftFilterSatuan);
                      setFilterItems(draftFilterItems);
                      setFilterTanggalRange(draftFilterTanggalRange);
                      setFilterNoPo(draftFilterNoPo);
                      setFilterNoInv(draftFilterNoInv);
                      setFilterQtyRange(draftFilterQtyRange);
                      setPage(1);
                      setShowFilter(false);
                    }}
                  >
                    Terapkan
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LaporanPage;
