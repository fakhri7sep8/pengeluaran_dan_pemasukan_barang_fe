"use client";

import React from "react";
import { motion } from "framer-motion";
import { Boxes, TrendingUp, TrendingDown } from "lucide-react";
import { useBarangModule } from "@/hook/useBarangModule";
import { usePembelianModule } from "@/hook/usePembelianModule";
import { usePenjualanModule } from "@/hook/usePenjualanModule";
import GrafikStokKategori from "@/components/ui/GrafikStokKategori";
import GrafikMasukKeluar from "@/components/ui/GrafikMasukKeluar";

const DashboardPage = () => {
  const { useGetAllBarang } = useBarangModule();
  const { useGetAllPembelian } = usePembelianModule();
  const { useGetAllPenjualan } = usePenjualanModule();

  const { data: barang } = useGetAllBarang();
  const { data: pembelian } = useGetAllPembelian();
  const { data: penjualan } = useGetAllPenjualan();

  const stats = [
    {
      title: "Total Barang",
      value: barang?.length ?? 0,
      icon: Boxes,
      gradient: "from-blue-600 to-blue-500",
    },
    {
      title: "Transaksi Masuk",
      value: pembelian?.length ?? 0,
      icon: TrendingUp,
      gradient: "from-emerald-600 to-emerald-500",
    },
    {
      title: "Transaksi Keluar",
      value: penjualan?.length ?? 0,
      icon: TrendingDown,
      gradient: "from-rose-600 to-rose-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-10"
    >
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Overview</h2>
        <p className="text-gray-500 mt-1">
          Ringkasan stok dan aktivitas terbaru
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6 w-full">
        {stats.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -8, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 260 }}
            className={`relative overflow-hidden rounded-2xl p-6 text-white bg-linear-to-br ${item.gradient} shadow-lg`}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition" />

            <div className="relative flex items-center justify-between">
              <p className="text-sm opacity-90">{item.title}</p>
              <item.icon size={22} className="opacity-90" />
            </div>

            <h3 className="relative text-3xl font-semibold mt-4">
              {item.value}
            </h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-screen">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="bg-linear-to-br from-white to-gray-50 rounded-2xl p-6 border shadow-sm h-96"
        >
          <h3 className="font-semibold mb-4 text-gray-800">
            Barang Masuk vs Keluar
          </h3>

          <GrafikMasukKeluar />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="bg-linear-to-br from-white to-gray-50 rounded-2xl p-6 border shadow-sm h-96"
        >
          <h3 className="font-semibold mb-4 text-gray-800">
            Stok per Kategori
          </h3>

          <GrafikStokKategori />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
