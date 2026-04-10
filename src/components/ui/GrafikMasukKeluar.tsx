"use client";

import ReactECharts from "echarts-for-react";
import { usePembelianModule } from "@/hook/usePembelianModule";
import { usePenjualanModule } from "@/hook/usePenjualanModule";


export default function GrafikMasukKeluar() {
  const { useGetAllPembelian } = usePembelianModule();
  const { useGetAllPenjualan} = usePenjualanModule();
  const { data: pembelian = [] } = useGetAllPembelian();
  const { data: pengeluaran = [] } = useGetAllPenjualan();

  const groupByDate = (data: any[]) =>
    data.reduce((acc: any, item: any) => {
      const date = new Date(item.tanggal).toLocaleDateString();
      acc[date] = (acc[date] || 0) + item.qty;
      return acc;
    }, {});

  const masukMap = groupByDate(pembelian);
  const keluarMap = groupByDate(pengeluaran);

  const labels = Array.from(
    new Set([...Object.keys(masukMap), ...Object.keys(keluarMap)])
  );

  const masuk = labels.map((l) => masukMap[l] || 0);
  const keluar = labels.map((l) => keluarMap[l] || 0);

  const option = {
    tooltip: { trigger: "axis" },
    legend: { data: ["Masuk", "Keluar"], bottom: 0 },
    grid: { left: "3%", right: "4%", bottom: "10%", containLabel: true },
    xAxis: { type: "category", data: labels },
    yAxis: { type: "value" },
    series: [
      {
        name: "Masuk",
        type: "line",
        smooth: true,
        data: masuk,
        areaStyle: { opacity: 0.15 },
      },
      {
        name: "Keluar",
        type: "line",
        smooth: true,
        data: keluar,
        areaStyle: { opacity: 0.15 },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 300 }} />;
}
