"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 font-sans">
      <motion.main
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-12 w-full max-w-lg px-10 py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl"
      >
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-50 text-center">
            Selamat Datang di PT. Sakka Kreasindo Perkasa
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
            Masuk untuk mengelola dashboard atau daftar akun baru.
          </p>
        </div>

        <div className="flex w-full flex-col gap-5 sm:flex-row sm:justify-center">
          <Link
            href="/auth/login"
            className="flex-1 flex items-center justify-center h-14 rounded-xl bg-linear-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg transform transition duration-300 hover:scale-105 hover:from-blue-700 hover:to-blue-600"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="flex-1 flex items-center justify-center h-14 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-medium shadow-sm transform transition duration-300 hover:scale-105 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Daftar
          </Link>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          &copy; {new Date().getFullYear()} PT. Sakka Kreasindo Perkasa. All rights reserved.
        </p>
      </motion.main>
    </div>
  );
}
