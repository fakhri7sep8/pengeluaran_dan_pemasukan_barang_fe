"use client";

import ReactECharts from "echarts-for-react";
import { useBarangModule } from "@/hook/useBarangModule";

export default function GrafikStokKategori() {
  const { useGetAllBarang } = useBarangModule();
  const { data: barang = [] } = useGetAllBarang();

  const grouped = barang.reduce((acc: any, b: any) => {
    acc[b.items] = (acc[b.items] || 0) + b.saldo;
    return acc;
  }, {});

  const kategori = Object.keys(grouped);
  const saldo = Object.values(grouped);

  const option = {
    tooltip: { trigger: "axis" },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: { type: "category", data: kategori },
    yAxis: { type: "value" },
    series: [
      {
        type: "bar",
        data: saldo,
        barWidth: "45%",
        itemStyle: { borderRadius: [6, 6, 0, 0] },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 300 }} />;
}
