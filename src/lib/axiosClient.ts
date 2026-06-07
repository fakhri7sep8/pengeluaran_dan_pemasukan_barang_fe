import axios, { AxiosInstance } from "axios";

export const axiosClient: AxiosInstance = axios.create({
  baseURL: "https://pengeluaran-dan-pemasukan-barang-be.vercel.app/",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});