"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";


const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white border rounded-2xl shadow-sm p-8 text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle size={28} />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900">
          Halaman tidak ditemukan
        </h1>

        <p className="text-gray-500 mt-2 leading-relaxed">
          Maaf, halaman yang kamu cari tidak tersedia
        </p>

        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
              bg-gray-900 text-white text-sm font-medium
              hover:bg-gray-800 transition"
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Error 404 · Sistem tidak menemukan rute yang diminta
        </p>
      </motion.div>
    </div>
  );
};

export default NotFound;
