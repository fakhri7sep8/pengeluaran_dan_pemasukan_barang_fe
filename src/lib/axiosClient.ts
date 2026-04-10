import axios, { AxiosInstance } from "axios";

export const axiosClient: AxiosInstance = axios.create({
  baseURL: "http://localhost:3232",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});